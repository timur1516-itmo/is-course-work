import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ordersService,
  conversationsService,
  clientsService,
  employeesService,
  filesService,
  applicationsService,
  extractApiError,
  chatWebSocket,
} from "../../../services/api";
import type {
  ClientOrderResponseDto,
  ConversationResponseDto,
  MessageResponseDto,
  ClientResponseDto,
  EmployeeResponseDto,
  FileMetadataResponseDto,
} from "../../../services/api/types";
import { IS_CLIENT, IS_STAFF } from "../../../config/app.ts";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

function OrderDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const orderId = id ? Number(id) : null;

  const [order, setOrder] = useState<ClientOrderResponseDto | null>(null);
  const [conversation, setConversation] = useState<ConversationResponseDto | null>(null);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientResponseDto | null>(null);
  const [managerInfo, setManagerInfo] = useState<EmployeeResponseDto | null>(null);
  const [authorNames, setAuthorNames] = useState<Record<number, string>>({});
  const [orderFiles, setOrderFiles] = useState<FileMetadataResponseDto[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is required");
      setLoading(false);
      return;
    }

    loadOrderData();
  }, [orderId]);

  useEffect(() => {
    if (conversation) {
      loadMessages();

      const token = localStorage.getItem('accessToken') || undefined;
      chatWebSocket.connect(conversation.id, token);

      const handleMessage = (data: unknown) => {
        if (data && typeof data === 'object' && 'message' in data) {
          const messageData = data as { message: MessageResponseDto };
          if (messageData.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === messageData.message.id)) {
                return prev;
              }
              return [...prev, messageData.message];
            });
            loadAuthorName(messageData.message.authorId);
          }
        }
      };

      chatWebSocket.on('message', handleMessage);

      return () => {
        chatWebSocket.off('message', handleMessage);
        chatWebSocket.disconnect();
      };
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const authorIds = new Set(messages.map((m) => m.authorId));
    authorIds.forEach((authorId) => {
      if (!authorNames[authorId]) {
        loadAuthorName(authorId);
      }
    });
  }, [messages]);

  const loadOrderData = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const [orderData, conversationData] = await Promise.all([
        ordersService.getOrderById(orderId),
        conversationsService.getConversationByOrderId(orderId).catch(() => null),
      ]);

      setOrder(orderData);
      setConversation(conversationData);

      if (orderData.clientApplicationId) {
        loadOrderFiles(orderData.clientApplicationId);
      }

      if (IS_CLIENT) {
        if (orderData.managerId) {
          try {
            const manager = await employeesService.getEmployeeById(orderData.managerId);
            setManagerInfo(manager);
          } catch (err) {
            console.error("Failed to load manager info:", err);
          }
        }
      } else if (IS_STAFF) {
        try {
          const applicationToClientMap: Record<number, number> = {
            801: 456,
            802: 457,
            803: 458,
            804: 459,
            805: 460,
          };
          const clientId = applicationToClientMap[orderData.clientApplicationId];
          if (clientId) {
            const client = await clientsService.getClientById(clientId);
            setClientInfo(client);
          }
        } catch (err) {
          console.error("Failed to load client info:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load order data:", err);
      const apiError = extractApiError(err);
      setError(apiError.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const loadOrderFiles = async (applicationId: number) => {
    try {
      setLoadingFiles(true);
      const files = await applicationsService.getApplicationAttachments(applicationId);
      setOrderFiles(files);
    } catch (err) {
      console.error("Failed to load order files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      await filesService.downloadFile(fileId, filename);
    } catch (err) {
      console.error("Failed to download file:", err);
      const apiError = extractApiError(err);
      setError(apiError.message || "Failed to download file");
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
      console.error("Failed to view file:", err);
      const apiError = extractApiError(err);
      setError(apiError.message || "Failed to view file");
    }
  };

  const loadAuthorName = async (authorId: number) => {
    if (authorNames[authorId]) return;

    try {
      const accountIdToClientId: Record<number, number> = {
        123: 456,
        124: 457,
        125: 458,
        126: 459,
        127: 460,
      };

      const accountIdToEmployeeId: Record<number, number> = {
        201: 101,
        202: 102,
      };

      const clientId = accountIdToClientId[authorId];
      if (clientId) {
        try {
          const client = await clientsService.getClientById(clientId);
          if (client) {
            setAuthorNames((prev) => ({
              ...prev,
              [authorId]: `${client.person.firstName} ${client.person.lastName}`,
            }));
            return;
          }
        } catch (err) {
          console.debug("Failed to load client:", err);
        }
      }

      const employeeId = accountIdToEmployeeId[authorId];
      if (employeeId) {
        try {
          const employee = await employeesService.getEmployeeById(employeeId);
          if (employee) {
            setAuthorNames((prev) => ({
              ...prev,
              [authorId]: `${employee.person.firstName} ${employee.person.lastName}`,
            }));
            return;
          }
        } catch (err) {
          console.debug("Failed to load employee:", err);
        }
      }

      if (authorId === 101 || authorId === 102) {
        try {
          const employee = await employeesService.getEmployeeById(authorId);
          if (employee) {
            setAuthorNames((prev) => ({
              ...prev,
              [authorId]: `${employee.person.firstName} ${employee.person.lastName}`,
            }));
            return;
          }
        } catch (err) {
          console.debug("Failed to load employee:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load author name:", err);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      const messagesData = await conversationsService.getMessages(conversation.id, {
        sort: ["sentAt,ASC"],
      });
      setMessages(messagesData);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newFiles = Array.from(files);
      const uploadedIds: number[] = [];

      for (const file of newFiles) {
        try {
          const fileMetadata = await filesService.uploadFile(file);
          uploadedIds.push(fileMetadata.id);
        } catch (err) {
          console.error("Failed to upload file:", err);
        }
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setUploadedFileIds((prev) => [...prev, ...uploadedIds]);
    } catch (err) {
      console.error("Failed to upload files:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedFileIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !messageText.trim() || sending) return;

    if (order?.status === "COMPLETED") {
      setError(t("order.cannotSendToCompleted"));
      return;
    }

    try {
      setSending(true);
      setError(null);

      const messageData = {
        content: messageText.trim(),
        attachmentFileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      };

      if (chatWebSocket.isConnected()) {
        chatWebSocket.send({ type: 'send_message', ...messageData });
      } else {
        await conversationsService.sendMessage(conversation.id, messageData);
        await loadMessages();
      }

      setMessageText("");
      setUploadedFiles([]);
      setUploadedFileIds([]);
    } catch (err) {
      console.error("Failed to send message:", err);
      const apiError = extractApiError(err);
      setError(apiError.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      CREATED: t("order.status.created"),
      IN_PROGRESS: t("order.status.inProgress"),
      PENDING_APPROVAL: t("order.status.pendingApproval"),
      REWORK: t("order.status.rework"),
      APPROVED: t("order.status.approved"),
      AWAITING_PAYMENT: t("order.status.awaitingPayment"),
      PAID: t("order.status.paid"),
      READY_FOR_PRODUCTION: t("order.status.readyForProduction"),
      IN_PRODUCTION: t("order.status.inProduction"),
      COMPLETED: t("order.status.completed"),
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status: string): string => {
    const styleMap: Record<string, string> = {
      CREATED: "bg-sky-500/10 text-sky-300 ring-sky-500/40",
      IN_PROGRESS: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/40",
      PENDING_APPROVAL: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
      REWORK: "bg-orange-500/10 text-orange-300 ring-orange-500/40",
      APPROVED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
      AWAITING_PAYMENT: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
      PAID: "bg-green-500/10 text-green-300 ring-green-500/40",
      READY_FOR_PRODUCTION: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/40",
      IN_PRODUCTION: "bg-purple-500/10 text-purple-300 ring-purple-500/40",
      COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
    };
    return styleMap[status] || "bg-gray-500/10 text-gray-300 ring-gray-500/40";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAuthorName = (authorId: number): string => {
    return authorNames[authorId] || `${t("order.messageAuthor")} #${authorId}`;
  };

  const canSendMessage = order?.status !== "COMPLETED";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">{t("order.loading")}</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">{error || t("order.notFound")}</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        <div className="w-1/3 flex-shrink-0">
          <div className="bg-stone-950/70 rounded-xl border border-gray-700 p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-6">
              {t("order.title")} #{order.id}
            </h1>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">
                  {t("order.statusLabel")}
                </label>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusStyle(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">
                  {t("order.price")}
                </label>
                <p className="text-white font-semibold">
                  {order.price.toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">
                  {t("order.createdAt")}
                </label>
                <p className="text-gray-300">{formatDate(order.createdAt)}</p>
              </div>

              {IS_CLIENT && managerInfo && (
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("order.manager")}
                  </label>
                  <p className="text-gray-300">
                    {managerInfo.person.firstName} {managerInfo.person.lastName}
                  </p>
                </div>
              )}

              {IS_STAFF && clientInfo && (
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("order.client")}
                  </label>
                  <p className="text-gray-300">
                    {clientInfo.person.firstName} {clientInfo.person.lastName}
                  </p>
                </div>
              )}

              {IS_STAFF && order.clientApplicationId && (
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("order.clientApplication")}
                  </label>
                  <Link
                    to={`/applications/${order.clientApplicationId}`}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    #{order.clientApplicationId}
                  </Link>
                </div>
              )}

              {IS_STAFF && order.productDesignId && (
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("order.productDesign")}
                  </label>
                  <Link
                    to={`/designs/${order.productDesignId}`}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    #{order.productDesignId}
                  </Link>
                </div>
              )}

              {orderFiles.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block">
                    {t("order.attachments")}
                  </label>
                  <div className="space-y-2">
                    {orderFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-stone-900/50 rounded-lg px-3 py-2 border border-gray-800"
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
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title={t("order.view")}
                            >
                              <VisibilityIcon className="text-lg" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadFile(file.id, file.filename)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title={t("order.download")}
                          >
                            <DownloadIcon className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loadingFiles && (
                <div className="text-xs text-gray-500">
                  {t("order.loadingFiles")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-stone-950/70 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              {t("order.chat")}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t("order.noMessages")}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-stone-900/50 rounded-lg p-4 border border-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400">
                      {getAuthorName(message.authorId)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.sentAt)}
                    </span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {conversation && (
            <form
              onSubmit={handleSendMessage}
              className="px-6 py-4 border-t border-gray-700 space-y-3"
            >
              {!canSendMessage && (
                <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/40 rounded-lg p-3">
                  {t("order.cannotSendToCompleted")}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-stone-900/50 rounded-lg px-3 py-2 text-sm"
                    >
                      <AttachFileIcon className="text-gray-400 text-lg" />
                      <span className="text-gray-300 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <DeleteIcon className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t("order.messagePlaceholder")}
                  className="flex-1 rounded-lg bg-stone-900/50 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  disabled={sending || !canSendMessage}
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    disabled={uploading || !canSendMessage}
                  />
                  <div
                    className={`px-4 py-2 rounded-lg border border-gray-700 transition-colors ${
                      uploading || !canSendMessage
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-stone-900/50 text-white hover:bg-stone-800"
                    }`}
                  >
                    <UploadFileIcon className="text-lg" />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={(!messageText.trim() && uploadedFileIds.length === 0) || sending || !canSendMessage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <SendIcon className="text-lg" />
                  {sending ? t("order.sending") : t("order.send")}
                </button>
              </div>
            </form>
          )}

          {!conversation && (
            <div className="px-6 py-4 border-t border-gray-700 text-center text-gray-500 text-sm">
              {t("order.conversationNotFound")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
