import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { ordersService, applicationsService, filesService, designsService, materialsService, conversationsService, clientsService, extractApiError } from "../../../services/api";
import type { ClientOrderResponseDto, ClientApplicationResponseDto, FileMetadataResponseDto, RequiredMaterialDto, MaterialResponseDto, ConversationResponseDto, MessageResponseDto, ClientResponseDto } from "../../../services/api/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

function DesignerDashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ClientOrderResponseDto[]>([]);
  const [applications, setApplications] = useState<Record<number, ClientApplicationResponseDto>>({});
  const [clients, setClients] = useState<Map<number, ClientResponseDto>>(new Map());
  const [ordersWithReworkHistory, setOrdersWithReworkHistory] = useState<Set<number>>(new Set());

  const formatOrderName = (order: ClientOrderResponseDto): string => {
    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `ORD-${year}-${month}-${day}-${order.id}`;
  };
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [applicationFiles, setApplicationFiles] = useState<Record<number, FileMetadataResponseDto[]>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState<Record<number, boolean>>({});
  const [showReworkComment, setShowReworkComment] = useState<Record<number, boolean>>({});
  const [savingMaterials, setSavingMaterials] = useState<Record<number, boolean>>({});
  const [sendingRework, setSendingRework] = useState<Record<number, boolean>>({});
  const [materialsMap, setMaterialsMap] = useState<Map<number, MaterialResponseDto>>(new Map());
  const [materialFormInitialValues, setMaterialFormInitialValues] = useState<Record<number, RequiredMaterialDto[]>>({});
  const [allMaterials, setAllMaterials] = useState<MaterialResponseDto[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [designFiles, setDesignFiles] = useState<Record<number, FileMetadataResponseDto[]>>({});
  const [fileTypes, setFileTypes] = useState<Map<number, '3d' | 'up'>>(new Map());
  const [showChatModal, setShowChatModal] = useState<number | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, MessageResponseDto[]>>({});
  const [loadingChat, setLoadingChat] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        let allOrders: ClientOrderResponseDto[] = [];
        try {
          const ordersData = await ordersService.getOrders();
          allOrders = Array.isArray(ordersData) ? ordersData : [];
        } catch (err) {
          const apiError = extractApiError(err);
          console.error('Failed to load orders:', apiError);
          if (apiError.status !== 403) {
            setError(apiError.message || apiError.detail || 'Ошибка загрузки заказов');
          }
        }

        const designerOrders = allOrders.filter(
          (order) => 
            order.status === "PENDING_APPROVAL" || 
            order.status === "REWORK" || 
            order.status === "IN_PROGRESS"
        );
        setOrders(designerOrders);

        const applicationsMap: Record<number, ClientApplicationResponseDto> = {};
        const clientsMap = new Map<number, ClientResponseDto>();
        const reworkOrdersSet = new Set<number>();
        const designFilesToLoad: number[] = [];

        for (const order of designerOrders) {
          if (order.clientApplicationId && !applicationsMap[order.clientApplicationId]) {
            try {
              const app = await applicationsService.getApplicationById(order.clientApplicationId);
              if (app) {
                applicationsMap[order.clientApplicationId] = app;
                
                if (app.clientId && !clientsMap.has(app.clientId)) {
                  try {
                    const client = await clientsService.getClientById(app.clientId);
                    clientsMap.set(app.clientId, client);
                  } catch (err) {
                    console.error(`Failed to load client ${app.clientId}:`, err);
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to load application ${order.clientApplicationId}:`, err);
            }
          }

          if (order.productDesignId && !designFilesToLoad.includes(order.productDesignId)) {
            designFilesToLoad.push(order.productDesignId);
          }

          if (order.id) {
            try {
              const hasBeenInRework = await ordersService.hasOrderBeenInStatus(order.id, "REWORK");
              if (hasBeenInRework) {
                reworkOrdersSet.add(order.id);
              }
            } catch (err) {
              console.error(`Failed to check REWORK status for order ${order.id}:`, err);
            }
          }
        }

        await Promise.all(
          designFilesToLoad.map(designId => 
            loadDesignFiles(designId).catch(err => {
              console.error(`Failed to load design files for design ${designId}:`, err);
            })
          )
        );
        setApplications(applicationsMap);
        setClients(clientsMap);
        setOrdersWithReworkHistory(reworkOrdersSet);
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || apiError.detail || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoadingMaterials(true);
        setError(null);
        const materials = await materialsService.getMaterials({ size: 1000 });
        setAllMaterials(materials);
        if (materials.length === 0) {
          console.warn('No materials found in the database');
        }
      } catch (err) {
        const apiError = extractApiError(err);
        console.error('Failed to load materials:', apiError);
        if (apiError.status !== 403) {
          setError(apiError.message || apiError.detail || 'Ошибка загрузки материалов');
        }
      } finally {
        setLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, []);

  const toggleOrder = async (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(orderId);
      
      if (isExpanding) {
        newSet.add(orderId);
        const order = orders.find(o => o.id === orderId);
        if (order) {
          if (order.clientApplicationId && !applicationFiles[order.clientApplicationId]) {
            loadApplicationFiles(order.clientApplicationId);
          }
          if (order.productDesignId && !designFiles[order.productDesignId]) {
            loadDesignFiles(order.productDesignId);
          }
        }
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const getFileType = (filename: string): '3d' | 'up' | null => {
    const ext = filename.toLowerCase().split('.').pop();
    if (!ext) return null;
    
    const model3DExts = ['stl', 'obj', '3ds', 'step', 'iges', 'stp', 'igs'];
    if (model3DExts.includes(ext)) {
      return '3d';
    }
    
    const upExts = ['nc', 'cnc', 'tap', 'gcode'];
    if (upExts.includes(ext)) {
      return 'up';
    }
    
    return null;
  };

  const loadDesignFiles = async (designId: number) => {
    try {
      const design = await designsService.getDesignById(designId);
      const files = design.files || [];
      setDesignFiles(prev => ({ ...prev, [designId]: files }));
      
      setFileTypes(prev => {
        const newMap = new Map(prev);
        files.forEach(file => {
          const fileType = getFileType(file.filename);
          if (fileType) {
            newMap.set(file.id, fileType);
          }
        });
        return newMap;
      });
    } catch (err) {
      console.error(`Failed to load files for design ${designId}:`, err);
    }
  };


  const handleRemoveDesignFile = async (orderId: number, designId: number, fileId: number) => {
    try {
      setError(null);
      await designsService.removeFileFromDesign(designId, fileId);
      
      setFileTypes(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
      
      await loadDesignFiles(designId);

      const allOrders = await ordersService.getOrders();
      const designerOrders = allOrders.filter(
        (o) => 
          o.status === "PENDING_APPROVAL" || 
          o.status === "REWORK" || 
          o.status === "IN_PROGRESS"
      );
      setOrders(designerOrders);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка удаления файла');
      console.error('Failed to remove file:', err);
    }
  };

  const loadApplicationFiles = async (applicationId: number) => {
    if (loadingFiles[applicationId] || applicationFiles[applicationId]) {
      return;
    }

    try {
      setLoadingFiles(prev => ({ ...prev, [applicationId]: true }));
      const files = await applicationsService.getApplicationAttachments(applicationId);
      setApplicationFiles(prev => ({ ...prev, [applicationId]: files }));
    } catch (err) {
      console.error(`Failed to load files for application ${applicationId}:`, err);
    } finally {
      setLoadingFiles(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const loadChatMessages = async (orderId: number) => {
    if (loadingChat[orderId] || chatMessages[orderId]) {
      return;
    }

    try {
      setLoadingChat(prev => ({ ...prev, [orderId]: true }));
      const conversation = await conversationsService.getConversationByOrderId(orderId);
      const messages = await conversationsService.getMessages(conversation.id, {
        sort: ["sentAt,ASC"],
      });
      setChatMessages(prev => ({ ...prev, [orderId]: Array.isArray(messages) ? messages : [] }));
    } catch (err) {
      console.error(`Failed to load chat messages for order ${orderId}:`, err);
      setChatMessages(prev => ({ ...prev, [orderId]: [] }));
    } finally {
      setLoadingChat(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      await filesService.downloadFile(fileId, filename);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка загрузки файла');
      console.error('Failed to download file:', err);
    }
  };

  const handleViewFile = async (fileId: number, filename: string, contentType: string) => {
    try {
      if (contentType.startsWith('image/')) {
        const url = await filesService.getFileUrl(fileId);
        if (url) {
          window.open(url, '_blank');
        } else {
          await handleDownloadFile(fileId, filename);
        }
      } else {
        await handleDownloadFile(fileId, filename);
      }
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка просмотра файла');
      console.error('Failed to view file:', err);
    }
  };

  const handle3DModelUpload = async (order: ClientOrderResponseDto, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = "";
      return;
    }

    try {
      setError(null);
      const fileMetadata = await filesService.uploadFile(file);
      const fileId = fileMetadata.id;

      const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
      const productName = application 
        ? `${formatOrderName(order)} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : formatOrderName(order);

      let designId = order.productDesignId;
      
      if (!designId) {
        const newDesign = await designsService.createDesign({
          productName,
          fileIds: [],
          requiredMaterials: [],
        });
        designId = newDesign.id;
        await designsService.assignDesigner(designId);
        await ordersService.updateOrderDesign(order.id, designId);
      }

      await designsService.addFileToDesign(designId, fileId);
      
      setFileTypes(prev => new Map(prev).set(fileId, '3d'));

      await loadDesignFiles(designId);

      const allOrders = await ordersService.getOrders();
      const designerOrders = allOrders.filter(
        (o) => 
          o.status === "PENDING_APPROVAL" || 
          o.status === "REWORK" || 
          o.status === "IN_PROGRESS"
      );
      const updatedOrder = designerOrders.find(o => o.id === order.id);
      if (updatedOrder && !order.productDesignId && designId) {
        updatedOrder.productDesignId = designId;
      }
      setOrders(designerOrders);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка загрузки 3D модели');
      console.error('Failed to upload 3D model:', err);
    }
    event.target.value = "";
  };

  const handleUPGenerate = async (order: ClientOrderResponseDto, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = "";
      return;
    }

    try {
      setError(null);
      const fileMetadata = await filesService.uploadFile(file);
      const fileId = fileMetadata.id;

      const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
      const productName = application 
        ? `${formatOrderName(order)} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : formatOrderName(order);

      let designId = order.productDesignId;
      
      if (!designId) {
        const newDesign = await designsService.createDesign({
          productName,
          fileIds: [],
          requiredMaterials: [],
        });
        designId = newDesign.id;
        await designsService.assignDesigner(designId);
        await ordersService.updateOrderDesign(order.id, designId);
      }

      await designsService.addFileToDesign(designId, fileId);

      setFileTypes(prev => new Map(prev).set(fileId, 'up'));

      await loadDesignFiles(designId);

      const allOrders = await ordersService.getOrders();
      const designerOrders = allOrders.filter(
        (o) => 
          o.status === "PENDING_APPROVAL" || 
          o.status === "REWORK" || 
          o.status === "IN_PROGRESS"
      );
      const updatedOrder = designerOrders.find(o => o.id === order.id);
      if (updatedOrder && !order.productDesignId && designId) {
        updatedOrder.productDesignId = designId;
      }
      setOrders(designerOrders);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка загрузки УП файла');
      console.error('Failed to upload UP file:', err);
    }
    event.target.value = "";
  };

  const loadMaterial = async (materialId: number) => {
    if (materialsMap.has(materialId)) return;
    try {
      const material = await materialsService.getMaterialById(materialId);
      setMaterialsMap(prev => new Map(prev).set(materialId, material));
    } catch (err) {
      console.error(`Failed to load material ${materialId}:`, err);
    }
  };

  const handleSaveMaterials = async (orderId: number, materials: RequiredMaterialDto[], price?: number) => {
    try {
      setSavingMaterials(prev => ({ ...prev, [orderId]: true }));
      setError(null);

      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Заказ не найден');
      }

      let designFilesList: FileMetadataResponseDto[] = [];
      if (order.productDesignId) {
        if (!designFiles[order.productDesignId]) {
          const design = await designsService.getDesignById(order.productDesignId);
          designFilesList = design.files || [];
          setDesignFiles(prev => ({ ...prev, [order.productDesignId!]: designFilesList }));
          setFileTypes(prev => {
            const newMap = new Map(prev);
            designFilesList.forEach(file => {
              const fileType = getFileType(file.filename);
              if (fileType) {
                newMap.set(file.id, fileType);
              }
            });
            return newMap;
          });
        } else {
          designFilesList = designFiles[order.productDesignId];
        }
      }
      
      const hasEnoughFiles = designFilesList.length >= 2;
      const has3DFile = hasEnoughFiles || designFilesList.some(f => {
        const type = fileTypes.get(f.id) || getFileType(f.filename);
        return type === '3d';
      });
      const hasUPFile = hasEnoughFiles || designFilesList.some(f => {
        const type = fileTypes.get(f.id) || getFileType(f.filename);
        return type === 'up';
      });

      if (!has3DFile || !hasUPFile) {
        throw new Error(t("designer.filesRequired") || 'Необходимо загрузить 3D модель и УП файл');
      }

      let finalPrice = order.price;
      if (!finalPrice || finalPrice === null) {
        if (!price || price <= 0) {
          throw new Error(t("designer.priceRequired") || 'Необходимо установить цену заказа');
        }
        finalPrice = price;
      }

      for (const mat of materials) {
        if (mat.materialId === 0 || mat.amount <= 0) {
          continue;
        }
        
        await loadMaterial(mat.materialId);
        const material = materialsMap.get(mat.materialId);
        
        if (material) {
          const availableBalance = material.currentBalance ?? 0;
          if (mat.amount > availableBalance) {
            throw new Error(
              t("designer.insufficientMaterial") || 
              `Недостаточно материала "${material.name}". Доступно: ${availableBalance} ${material.unitOfMeasure}, требуется: ${mat.amount} ${material.unitOfMeasure}`
            );
          }
        }
      }

      const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
      const productName = application 
        ? `${formatOrderName(order)} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : formatOrderName(order);

      let designId = order.productDesignId;
      
      if (!designId) {
        const newDesign = await designsService.createDesign({
          productName,
          fileIds: [],
          requiredMaterials: [],
        });
        designId = newDesign.id;
        await designsService.assignDesigner(designId);
      }

      for (const material of materials) {
        await designsService.addMaterialToDesign(designId, material);
      }

      if (!order.price || order.price === null) {
        await ordersService.updateOrderPrice(orderId, finalPrice);
      }

      await ordersService.changeOrderStatus(orderId, "APPROVED");

      const allOrdersAfterApproval = await ordersService.getOrders();
      const hasReadyOrInProduction = allOrdersAfterApproval.some(
        o => (o.status === "READY_FOR_PRODUCTION" || o.status === "IN_PRODUCTION") && o.id !== orderId
      );

      if (!hasReadyOrInProduction) {
        await ordersService.changeOrderStatus(orderId, "READY_FOR_PRODUCTION");
      }

      const allOrders = await ordersService.getOrders();

      const designerOrders = allOrders.filter(
        (o) => 
          o.status === "PENDING_APPROVAL" || 
          o.status === "REWORK" || 
          o.status === "IN_PROGRESS"
      );
      setOrders(designerOrders);
      setShowMaterialForm(prev => ({ ...prev, [orderId]: false }));
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка сохранения норм материалов');
      console.error('Failed to save materials:', err);
    } finally {
      setSavingMaterials(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSendReworkComment = async (orderId: number, comment: string) => {
    try {
      setSendingRework(prev => ({ ...prev, [orderId]: true }));
      setError(null);

      await ordersService.changeOrderStatus(orderId, "REWORK", comment);

      const allOrders = await ordersService.getOrders();
      const designerOrders = allOrders.filter(
        (o) => 
          o.status === "PENDING_APPROVAL" || 
          o.status === "REWORK" || 
          o.status === "IN_PROGRESS"
      );
      setOrders(designerOrders);
      setShowReworkComment(prev => ({ ...prev, [orderId]: false }));
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || 'Ошибка отправки комментария на доработку');
      console.error('Failed to send rework comment:', err);
    } finally {
      setSendingRework(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-gray-400">{t("catalog.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("designer.dashboard")}
          </h1>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {t("designer.ordersForDesign")}
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="text-left px-3 pb-2">{t("manager.order")}</th>
                  <th className="text-left px-3 pb-2">{t("manager.client")}</th>
                  <th className="text-right px-3 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t("designer.noOrders")}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isExpanded = expandedOrders.has(order.id);
                    const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
                    return (
                      <>
                        <tr
                          key={order.id}
                          onClick={() => toggleOrder(order.id)}
                          className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium">{formatOrderName(order)}</div>
                            <div className="text-xs text-gray-500">ID: {order.id}</div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-300">
                            {application ? (
                              (() => {
                                const client = clients.get(application.clientId);
                                return client 
                                  ? `${client.person.firstName} ${client.person.lastName}`
                                  : `Клиент #${application.clientId}`;
                              })()
                            ) : (
                              `Заявка #${order.clientApplicationId}`
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {isExpanded ? (
                              <ExpandLessIcon className="text-gray-400" />
                            ) : (
                              <ExpandMoreIcon className="text-gray-400" />
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${order.id}-details`}>
                            <td colSpan={3} className="px-3 py-4">
                              <div className="bg-stone-800/50 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {t("designer.orderDate")}
                                    </div>
                                    <div className="text-sm text-white">
                                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {ordersWithReworkHistory.has(order.id) && (
                                      <button
                                        onClick={async () => {
                                          if (order.id) {
                                            setShowChatModal(order.id);
                                            await loadChatMessages(order.id);
                                          }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 transition-colors"
                                      >
                                        {t("designer.viewChat")}
                                      </button>
                                    )}
                                    {order.clientApplicationId && (
                                      <button
                                        onClick={() => setShowApplicationModal(order.clientApplicationId!)}
                                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 transition-colors"
                                      >
                                        {t("designer.viewApplication")}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {order.clientApplicationId && (
                                  <div className="mt-4">
                                    <div className="text-xs text-gray-500 mb-2">
                                      {t("order.attachments")}
                                    </div>
                                    {loadingFiles[order.clientApplicationId] ? (
                                      <div className="text-sm text-gray-400">
                                        {t("catalog.loading")}...
                                      </div>
                                    ) : applicationFiles[order.clientApplicationId]?.length > 0 ? (
                                      <div className="space-y-2">
                                        {applicationFiles[order.clientApplicationId].map((file) => (
                                          <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-stone-800/50 rounded-lg px-3 py-2 border border-gray-700"
                                          >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <AttachFileIcon className="text-gray-400 text-lg flex-shrink-0" />
                                              <span className="text-sm text-gray-300 truncate" title={file.filename}>
                                                {file.filename}
                                              </span>
                                              <span className="text-xs text-gray-500 flex-shrink-0">
                                                ({(file.sizeBytes / 1024).toFixed(1)} KB)
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                              {file.contentType.startsWith('image/') && (
                                                <button
                                                  onClick={() => handleViewFile(file.id, file.filename, file.contentType)}
                                                  className="text-gray-400 hover:text-white transition-colors"
                                                  title={t("order.view")}
                                                >
                                                  <VisibilityIcon fontSize="small" />
                                                </button>
                                              )}
                                              <button
                                                onClick={() => handleDownloadFile(file.id, file.filename)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                                title={t("order.download")}
                                              >
                                                <DownloadIcon fontSize="small" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">
                                        {t("application.noAttachments") || "Нет прикрепленных файлов"}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {order.productDesignId && (
                                  <div className="mt-4">
                                    <div className="text-xs text-gray-500 mb-2">
                                      {t("designer.designFiles") || "Файлы дизайна"}
                                    </div>
                                    {designFiles[order.productDesignId]?.length > 0 ? (
                                      <div className="space-y-2">
                                        {designFiles[order.productDesignId].map((file) => (
                                          <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-stone-800/50 rounded-lg px-3 py-2 border border-gray-700"
                                          >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <AttachFileIcon className="text-gray-400 text-lg flex-shrink-0" />
                                              <span className="text-sm text-gray-300 truncate" title={file.filename}>
                                                {file.filename}
                                              </span>
                                              <span className="text-xs text-gray-500 flex-shrink-0">
                                                ({(file.sizeBytes / 1024).toFixed(1)} KB)
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                              <button
                                                onClick={() => handleDownloadFile(file.id, file.filename)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                                title={t("order.download")}
                                              >
                                                <DownloadIcon fontSize="small" />
                                              </button>
                                              {order.status !== "REWORK" && (order.status === "IN_PROGRESS" || order.status === "PENDING_APPROVAL") && (
                                                <button
                                                  onClick={() => handleRemoveDesignFile(order.id, order.productDesignId!, file.id)}
                                                  className="text-red-400 hover:text-red-300 transition-colors"
                                                  title={t("designer.removeFile") || "Удалить файл"}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">
                                        {t("designer.noDesignFiles") || "Нет файлов дизайна"}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {order.status !== "REWORK" && (order.status === "IN_PROGRESS" || order.status === "PENDING_APPROVAL") && (
                                  <div className="flex gap-4 pt-2">
                                    {(() => {
                                      const designFilesList = order.productDesignId ? designFiles[order.productDesignId] || [] : [];
                                      const hasEnoughFiles = designFilesList.length >= 2;
                                      const has3DFile = hasEnoughFiles || designFilesList.some(f => {
                                        const type = fileTypes.get(f.id) || getFileType(f.filename);
                                        return type === '3d';
                                      });
                                      const hasUPFile = hasEnoughFiles || designFilesList.some(f => {
                                        const type = fileTypes.get(f.id) || getFileType(f.filename);
                                        return type === 'up';
                                      });
                                      
                                      return (
                                        <>
                                          <label className="flex-1">
                                            <input
                                              type="file"
                                              // accept=".stl,.obj,.3ds,.step,.iges,.stp,.igs"
                                              onChange={(e) => handle3DModelUpload(order, e)}
                                              className="hidden"
                                              disabled={has3DFile}
                                            />
                                            <span className={`block w-full rounded-full text-sm font-medium py-2.5 text-center transition-colors ${
                                              has3DFile 
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                : 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                                            }`}>
                                              {t("designer.upload3DModel")}
                                            </span>
                                          </label>
                                          <label className="flex-1">
                                            <input
                                              type="file"
                                              // accept=".nc,.cnc,.tap,.gcode"
                                              onChange={(e) => handleUPGenerate(order, e)}
                                              className="hidden"
                                              disabled={hasUPFile}
                                            />
                                            <span className={`block w-full rounded-full text-sm font-medium py-2.5 text-center transition-colors ${
                                              hasUPFile 
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-600' 
                                                : 'bg-stone-950 text-white border border-gray-700 hover:bg-gray-900 cursor-pointer'
                                            }`}>
                                              {t("designer.generateUP")}
                                            </span>
                                          </label>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}

                                {order.status !== "REWORK" && (order.status === "IN_PROGRESS" || order.status === "PENDING_APPROVAL") && (
                                  <div className="mt-4 pt-4 border-t border-gray-700">
                                    {!showMaterialForm[order.id] ? (
                                      <button
                                        onClick={async () => {
                                          let initialMaterials: RequiredMaterialDto[] = [{ materialId: 0, amount: 0 }];
                                          if (order.productDesignId) {
                                            try {
                                              const design = await designsService.getDesignById(order.productDesignId);
                                              if (design.requiredMaterials.length > 0) {
                                                initialMaterials = design.requiredMaterials;
                                              }
                                            } catch (err) {
                                              console.error('Failed to load design:', err);
                                            }
                                          }
                                          setMaterialFormInitialValues(prev => ({ ...prev, [order.id]: initialMaterials }));
                                          setShowMaterialForm(prev => ({ ...prev, [order.id]: true }));
                                        }}
                                        className="w-full rounded-full bg-emerald-500 text-white text-sm font-medium py-2.5 hover:bg-emerald-600 transition-colors"
                                      >
                                        {t("designer.enterMaterialNorms")}
                                      </button>
                                    ) : (
                                      <Formik
                                        initialValues={{
                                          materials: materialFormInitialValues[order.id] || [{ materialId: 0, amount: 0 }],
                                          price: order.price || 0,
                                        }}
                                        enableReinitialize
                                        validationSchema={Yup.object({
                                          materials: Yup.array()
                                            .of(
                                              Yup.object({
                                                materialId: Yup.number().min(1, t("designer.materialRequired")).required(t("designer.materialRequired")),
                                                amount: Yup.number().min(0.01, t("designer.amountMin")).required(t("designer.amountRequired")),
                                              })
                                            )
                                            .min(1, t("designer.atLeastOneMaterial")),
                                          price: Yup.number()
                                            .min(0.01, t("designer.priceMin") || 'Цена должна быть больше 0')
                                            .required(t("designer.priceRequired") || 'Необходимо указать цену'),
                                        })}
                                        onSubmit={(values) => handleSaveMaterials(order.id, values.materials, values.price)}
                                      >
                                        {({ values, isSubmitting, setFieldValue }) => {
                                          let hasInsufficientMaterial = false;
                                          const materialErrors: Record<number, string> = {};
                                          
                                          values.materials.forEach((material: RequiredMaterialDto, index: number) => {
                                            if (material.materialId > 0 && material.amount > 0) {
                                              const mat = allMaterials.find(m => m.id === material.materialId);
                                              if (mat) {
                                                const availableBalance = mat.currentBalance ?? 0;
                                                if (material.amount > availableBalance) {
                                                  hasInsufficientMaterial = true;
                                                  materialErrors[index] = t("designer.insufficientMaterial") || 
                                                    `Недостаточно материала. Доступно: ${availableBalance} ${mat.unitOfMeasure}`;
                                                }
                                              }
                                            }
                                          });

                                          return (
                                            <Form className="space-y-4">
                                              <div className="text-sm font-medium text-white mb-2">
                                                {t("designer.materialConsumptionNorms")}
                                              </div>
                                              <FieldArray name="materials">
                                                {({ push, remove }) => (
                                                  <div className="space-y-3">
                                                    {values.materials.map((material: RequiredMaterialDto, index: number) => {
                                                      const selectedMaterial = allMaterials.find(m => m.id === material.materialId);
                                                      const availableBalance = selectedMaterial?.currentBalance ?? null;
                                                      const isInsufficient = materialErrors[index] !== undefined;
                                                      
                                                      return (
                                                        <div key={index} className="grid grid-cols-2 gap-3 p-3 bg-stone-900/50 rounded-lg border border-gray-700">
                                                          <div>
                                                            <label className="block text-xs text-gray-400 mb-1">
                                                              {t("designer.material")}
                                                            </label>
                                                            <Field
                                                              name={`materials.${index}.materialId`}
                                                              as="select"
                                                              className="w-full rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-2 text-sm text-white"
                                                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                                setFieldValue(`materials.${index}.materialId`, Number(e.target.value));
                                                              }}
                                                            >
                                                              <option value={0}>{t("designer.selectMaterial")}</option>
                                                              {allMaterials.map((mat) => (
                                                                <option key={mat.id} value={mat.id}>
                                                                  {mat.name} ({mat.unitOfMeasure})
                                                                </option>
                                                              ))}
                                                            </Field>
                                                            <ErrorMessage
                                                              name={`materials.${index}.materialId`}
                                                              component="div"
                                                              className="text-xs text-red-400 mt-1"
                                                            />
                                                            {selectedMaterial && (
                                                              <div className="text-xs text-gray-500 mt-1">
                                                                {t("designer.unitOfMeasure")}: {selectedMaterial.unitOfMeasure}
                                                                {availableBalance !== null && (
                                                                  <span className="ml-2 text-gray-400">
                                                                    (Доступно: {availableBalance} {selectedMaterial.unitOfMeasure})
                                                                  </span>
                                                                )}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs text-gray-400 mb-1">
                                                              {t("designer.amount")} {selectedMaterial && `(${selectedMaterial.unitOfMeasure})`}
                                                            </label>
                                                            <Field
                                                              name={`materials.${index}.amount`}
                                                              type="number"
                                                              step="0.01"
                                                              className={`w-full rounded-lg bg-stone-950/70 border px-3 py-2 text-sm text-white ${
                                                                isInsufficient ? 'border-red-500' : 'border-gray-700'
                                                              }`}
                                                              placeholder={t("designer.amountPlaceholder")}
                                                            />
                                                            <ErrorMessage
                                                              name={`materials.${index}.amount`}
                                                              component="div"
                                                              className="text-xs text-red-400 mt-1"
                                                            />
                                                            {isInsufficient && (
                                                              <div className="text-xs text-red-400 mt-1">
                                                                {materialErrors[index]}
                                                              </div>
                                                            )}
                                                          </div>
                                                        {values.materials.length > 1 && (
                                                          <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="col-span-2 flex items-center justify-center gap-1 text-red-400 hover:text-red-300 transition-colors text-xs"
                                                          >
                                                            <DeleteIcon fontSize="small" />
                                                            {t("designer.removeMaterial")}
                                                          </button>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                  <button
                                                    type="button"
                                                    onClick={() => push({ materialId: 0, amount: 0 })}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
                                                  >
                                                    <AddIcon fontSize="small" />
                                                    {t("designer.addMaterial")}
                                                  </button>
                                                </div>
                                              )}
                                            </FieldArray>
                                            {(!order.price || order.price === null) && (
                                              <div>
                                                <label className="block text-xs text-gray-400 mb-1">
                                                  {t("designer.price")} (₽)
                                                </label>
                                                <Field
                                                  name="price"
                                                  type="number"
                                                  step="0.01"
                                                  className="w-full rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-2 text-sm text-white"
                                                  placeholder={t("designer.pricePlaceholder") || "Введите цену"}
                                                />
                                                <ErrorMessage
                                                  name="price"
                                                  component="div"
                                                  className="text-xs text-red-400 mt-1"
                                                />
                                              </div>
                                            )}
                                            <div className="flex gap-3 pt-2">
                                              <button
                                                type="submit"
                                                disabled={isSubmitting || savingMaterials[order.id] || hasInsufficientMaterial}
                                                className="flex-1 rounded-full bg-emerald-500 text-white text-sm font-medium py-2.5 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                              >
                                                {savingMaterials[order.id] ? t("designer.saving") : t("designer.approve")}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setShowMaterialForm(prev => ({ ...prev, [order.id]: false }))}
                                                className="flex-1 rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors"
                                              >
                                                {t("cancel")}
                                              </button>
                                            </div>
                                          </Form>
                                        );
                                      }}
                                      </Formik>
                                    )}
                                  </div>
                                )}

                                {order.status !== "REWORK" && (order.status === "IN_PROGRESS" || order.status === "PENDING_APPROVAL") && (
                                  <div className="mt-4 pt-4 border-t border-gray-700">
                                    {!showReworkComment[order.id] ? (
                                      <button
                                        onClick={() => setShowReworkComment(prev => ({ ...prev, [order.id]: true }))}
                                        className="w-full rounded-full bg-orange-500 text-white text-sm font-medium py-2.5 hover:bg-orange-600 transition-colors"
                                      >
                                        {t("designer.sendForRework")}
                                      </button>
                                    ) : (
                                      <Formik
                                        initialValues={{ comment: "" }}
                                        validationSchema={Yup.object({
                                          comment: Yup.string().required(t("designer.commentRequired")),
                                        })}
                                        onSubmit={(values) => handleSendReworkComment(order.id, values.comment)}
                                      >
                                        {({ isSubmitting }) => (
                                          <Form className="space-y-4">
                                            <div className="text-sm font-medium text-white mb-2">
                                              {t("designer.reworkComment")}
                                            </div>
                                            <Field
                                              name="comment"
                                              as="textarea"
                                              rows={4}
                                              className="w-full rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500"
                                              placeholder={t("designer.commentPlaceholder")}
                                            />
                                            <ErrorMessage
                                              name="comment"
                                              component="div"
                                              className="text-xs text-red-400"
                                            />
                                            <div className="flex gap-3 pt-2">
                                              <button
                                                type="submit"
                                                disabled={isSubmitting || sendingRework[order.id]}
                                                className="flex-1 rounded-full bg-orange-500 text-white text-sm font-medium py-2.5 hover:bg-orange-600 transition-colors disabled:opacity-50"
                                              >
                                                {sendingRework[order.id] ? t("designer.sending") : t("designer.sendForRework")}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setShowReworkComment(prev => ({ ...prev, [order.id]: false }))}
                                                className="flex-1 rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 hover:bg-gray-900 transition-colors"
                                              >
                                                {t("cancel")}
                                              </button>
                                            </div>
                                          </Form>
                                        )}
                                      </Formik>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowChatModal(null)}>
          <div className="bg-stone-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{t("designer.chat")}</h2>
              <button
                onClick={() => setShowChatModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingChat[showChatModal] ? (
                <div className="text-center text-gray-400">{t("catalog.loading")}...</div>
              ) : chatMessages[showChatModal]?.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages[showChatModal].map((message) => (
                    <div key={message.id} className="bg-stone-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(message.sentAt).toLocaleString('ru-RU')}
                      </div>
                      <div className="text-sm text-white">{message.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">{t("order.noMessages")}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showApplicationModal && applications[showApplicationModal] && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowApplicationModal(null)}>
          <div className="bg-stone-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{t("designer.applicationDetails")}</h2>
              <button
                onClick={() => setShowApplicationModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">{t("application.description")}</div>
                <div className="text-sm text-white">{applications[showApplicationModal].description || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">{t("application.amount")}</div>
                <div className="text-sm text-white">{applications[showApplicationModal].amount || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DesignerDashboard;

