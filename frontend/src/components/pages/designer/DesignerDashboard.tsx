import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { ordersService, applicationsService, filesService, designsService, materialsService, extractApiError } from "../../../services/api";
import type { ClientOrderResponseDto, ClientApplicationResponseDto, FileMetadataResponseDto, RequiredMaterialDto, MaterialResponseDto } from "../../../services/api/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

function DesignerDashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ClientOrderResponseDto[]>([]);
  const [applications, setApplications] = useState<Record<number, ClientApplicationResponseDto>>({});
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
        for (const order of designerOrders) {
          if (order.clientApplicationId && !applicationsMap[order.clientApplicationId]) {
            try {
              const app = await applicationsService.getApplicationById(order.clientApplicationId);
              if (app) {
                applicationsMap[order.clientApplicationId] = app;
              }
            } catch (err) {
              console.error(`Failed to load application ${order.clientApplicationId}:`, err);
            }
          }
        }
        setApplications(applicationsMap);
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
        if (order && order.clientApplicationId && !applicationFiles[order.clientApplicationId]) {
          loadApplicationFiles(order.clientApplicationId);
        }
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
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
        ? `Заказ #${order.id} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : `Заказ #${order.id}`;

      if (order.productDesignId) {
        const existingDesign = await designsService.getDesignById(order.productDesignId);
        const existingFileIds = existingDesign.files.map(f => f.id);
        const updatedFileIds = [...existingFileIds, fileId];

        await designsService.updateDesign(order.productDesignId, {
          productName: existingDesign.productName,
          fileIds: updatedFileIds,
          requiredMaterials: existingDesign.requiredMaterials,
        });
      } else {
        await designsService.createDesign({
          productName,
          fileIds: [fileId],
          requiredMaterials: [],
        });
      }

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
        ? `Заказ #${order.id} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : `Заказ #${order.id}`;

      if (order.productDesignId) {
        const existingDesign = await designsService.getDesignById(order.productDesignId);
        const existingFileIds = existingDesign.files.map(f => f.id);
        const updatedFileIds = [...existingFileIds, fileId];

        await designsService.updateDesign(order.productDesignId, {
          productName: existingDesign.productName,
          fileIds: updatedFileIds,
          requiredMaterials: existingDesign.requiredMaterials,
        });
      } else {
        await designsService.createDesign({
          productName,
          fileIds: [fileId],
          requiredMaterials: [],
        });
      }

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

  const handleSaveMaterials = async (orderId: number, materials: RequiredMaterialDto[]) => {
    try {
      setSavingMaterials(prev => ({ ...prev, [orderId]: true }));
      setError(null);

      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Заказ не найден');
      }

      for (const mat of materials) {
        await loadMaterial(mat.materialId);
      }

      const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
      const productName = application 
        ? `Заказ #${order.id} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : `Заказ #${order.id}`;

      if (order.productDesignId) {
        const existingDesign = await designsService.getDesignById(order.productDesignId);
        await designsService.updateDesign(order.productDesignId, {
          productName: existingDesign.productName,
          fileIds: existingDesign.files.map(f => f.id),
          requiredMaterials: materials,
        });
      } else {
        await designsService.createDesign({
          productName,
          fileIds: [],
          requiredMaterials: materials,
        });
      }

      await ordersService.changeOrderStatus(orderId, "PENDING_APPROVAL");

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
                            <div className="text-sm font-medium">Заказ #{order.id}</div>
                            <div className="text-xs text-gray-500">ID: {order.id}</div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-300">
                            {application ? `Клиент #${application.clientId}` : `Заявка #${order.clientApplicationId}`}
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
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {t("designer.expectedDate")}
                                    </div>
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

                                <div className="flex gap-4 pt-2">
                                  <label className="flex-1">
                                    <input
                                      type="file"
                                      // accept=".stl,.obj,.3ds,.step,.iges"
                                      onChange={(e) => handle3DModelUpload(order, e)}
                                      className="hidden"
                                    />
                                    <span className="block w-full rounded-full bg-white text-black text-sm font-medium py-2.5 text-center hover:bg-gray-200 transition-colors cursor-pointer">
                                      {t("designer.upload3DModel")}
                                    </span>
                                  </label>
                                  <label className="flex-1">
                                    <input
                                      type="file"
                                      // accept=".nc,.cnc,.tap"
                                      onChange={(e) => handleUPGenerate(order, e)}
                                      className="hidden"
                                    />
                                    <span className="block w-full rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 text-center hover:bg-gray-900 transition-colors cursor-pointer">
                                      {t("designer.generateUP")}
                                    </span>
                                  </label>
                                </div>

                                {order.status === "IN_PROGRESS" && (
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
                                        })}
                                        onSubmit={(values) => handleSaveMaterials(order.id, values.materials)}
                                      >
                                        {({ values, isSubmitting }) => (
                                          <Form className="space-y-4">
                                            <div className="text-sm font-medium text-white mb-2">
                                              {t("designer.materialConsumptionNorms")}
                                            </div>
                                            <FieldArray name="materials">
                                              {({ push, remove }) => (
                                                <div className="space-y-3">
                                                  {values.materials.map((material: RequiredMaterialDto, index: number) => {
                                                    const selectedMaterial = allMaterials.find(m => m.id === material.materialId);
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
                                                            className="w-full rounded-lg bg-stone-950/70 border border-gray-700 px-3 py-2 text-sm text-white"
                                                            placeholder={t("designer.amountPlaceholder")}
                                                          />
                                                          <ErrorMessage
                                                            name={`materials.${index}.amount`}
                                                            component="div"
                                                            className="text-xs text-red-400 mt-1"
                                                          />
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
                                            <div className="flex gap-3 pt-2">
                                              <button
                                                type="submit"
                                                disabled={isSubmitting || savingMaterials[order.id]}
                                                className="flex-1 rounded-full bg-emerald-500 text-white text-sm font-medium py-2.5 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                              >
                                                {savingMaterials[order.id] ? t("designer.saving") : t("designer.saveAndSendForApproval")}
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
                                        )}
                                      </Formik>
                                    )}
                                  </div>
                                )}

                                {order.status === "IN_PROGRESS" && (
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
    </div>
  );
}

export default DesignerDashboard;

