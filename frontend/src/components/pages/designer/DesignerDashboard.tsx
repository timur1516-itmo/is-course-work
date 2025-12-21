import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ordersService, applicationsService, filesService, designsService, extractApiError } from "../../../services/api";
import type { ClientOrderResponseDto, ClientApplicationResponseDto, FileMetadataResponseDto } from "../../../services/api/types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachFileIcon from "@mui/icons-material/AttachFile";

function DesignerDashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ClientOrderResponseDto[]>([]);
  const [applications, setApplications] = useState<Record<number, ClientApplicationResponseDto>>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [applicationFiles, setApplicationFiles] = useState<Record<number, FileMetadataResponseDto[]>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const allOrders = await ordersService.getOrders();
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
              const appResponse = await applicationsService.getApplications({
                page: 0,
                size: 1,
              });
              const app = appResponse.content?.find(a => a.id === order.clientApplicationId);
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
        setError(apiError.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const toggleOrder = async (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(orderId);
      
      if (isExpanding) {
        newSet.add(orderId);
        // Загружаем файлы при раскрытии заказа
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
      // Загружаем файл
      const fileMetadata = await filesService.uploadFile(file);
      const fileId = fileMetadata.id;

      // Получаем информацию о заказе для названия продукта
      const application = order.clientApplicationId ? applications[order.clientApplicationId] : null;
      const productName = application 
        ? `Заказ #${order.id} - ${application.description?.substring(0, 50) || 'Без описания'}`
        : `Заказ #${order.id}`;

      if (order.productDesignId) {
        // Если дизайн уже существует, обновляем его, добавляя новый файл
        const existingDesign = await designsService.getDesignById(order.productDesignId);
        const existingFileIds = existingDesign.files.map(f => f.id);
        const updatedFileIds = [...existingFileIds, fileId];

        await designsService.updateDesign(order.productDesignId, {
          productName: existingDesign.productName,
          fileIds: updatedFileIds,
          requiredMaterials: existingDesign.requiredMaterials,
        });
      } else {
        // Если дизайна нет, создаем новый
        await designsService.createDesign({
          productName,
          fileIds: [fileId],
          requiredMaterials: [],
        });
        // Примечание: связь дизайна с заказом должна быть установлена через обновление заказа менеджером
        // или автоматически на бэкенде. Здесь мы только создаем дизайн.
      }

      // Обновляем список заказов, чтобы отобразить изменения
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-gray-400">{t("catalog.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
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
                                      accept=".stl,.obj,.3ds,.step,.iges"
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
                                      accept=".nc,.cnc,.tap"
                                      onChange={(e) => handleUPGenerate(order, e)}
                                      className="hidden"
                                    />
                                    <span className="block w-full rounded-full bg-stone-950 text-white border border-gray-700 text-sm font-medium py-2.5 text-center hover:bg-gray-900 transition-colors cursor-pointer">
                                      {t("designer.generateUP")}
                                    </span>
                                  </label>
                                </div>
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

