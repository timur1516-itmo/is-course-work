import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  applicationsService,
  ordersService,
  conversationsService,
  clientsService,
  employeesService,
  filesService,
  extractApiError,
  chatWebSocket,
} from "../../../services/api";
import type {
  ClientApplicationResponseDto,
  ClientOrderResponseDto,
  ConversationResponseDto,
  MessageResponseDto,
  ClientResponseDto,
  FileMetadataResponseDto,
} from "../../../services/api/types";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

function ApplicationDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const applicationId = id ? Number(id) : null;

  const [application, setApplication] = useState<ClientApplicationResponseDto | null>(null);
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
  const [authorNames, setAuthorNames] = useState<Record<number, string>>({});
  const [applicationFiles, setApplicationFiles] = useState<FileMetadataResponseDto[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!applicationId) {
      setError("Application ID is required");
      setLoading(false);
      return;
    }

    loadApplicationData();
  }, [applicationId]);

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

  const loadApplicationData = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const applicationData = await applicationsService.getApplicationById(applicationId);
      setApplication(applicationData);

      try {
        const client = await clientsService.getClientById(applicationData.clientId);
        setClientInfo(client);
      } catch (err) {
        console.error("Failed to load client info:", err);
      }

      loadApplicationFiles(applicationId);

      try {
        const allOrders = await ordersService.getOrders({
        });
        const ordersArray = Array.isArray(allOrders) ? allOrders : [];
        const relatedOrder = ordersArray.find(o => o.clientApplicationId === applicationId);
        
        if (relatedOrder) {
          setOrder(relatedOrder);

          try {
            const conversationData = await conversationsService.getConversationByOrderId(relatedOrder.id);
            setConversation(conversationData);
          } catch (err) {
            console.error("Failed to load conversation:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message || apiError.detail || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationFiles = async (appId: number) => {
    if (loadingFiles || applicationFiles.length > 0) return;

    try {
      setLoadingFiles(true);
      const files = await applicationsService.getApplicationAttachments(appId);
      setApplicationFiles(files);
    } catch (err) {
      console.error("Failed to load application files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadAuthorName = async (authorId: number) => {
    if (authorNames[authorId]) return;

    try {
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
        console.error("Failed to load employee:", err);
      }

      if (clientInfo && clientInfo.accountId === authorId) {
        setAuthorNames((prev) => ({
          ...prev,
          [authorId]: `${clientInfo.person.firstName} ${clientInfo.person.lastName}`,
        }));
        return;
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
      setMessages(Array.isArray(messagesData) ? messagesData : []);
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
      setError(t("order.cannotSendToCompleted") || "Cannot send message to completed order");
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
      setError(apiError.message || apiError.detail || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    return authorNames[authorId] || `${t("order.messageAuthor") || "Author"} #${authorId}`;
  };

  const handleCreateOrder = async () => {
    if (!application || creatingOrder) return;

    if (order) {
      setError(t("manager.orderAlreadyExists") || "Order already exists for this application");
      return;
    }

    if (!window.confirm(t("manager.confirmCreateOrder") || "Create an order from this application?")) {
      return;
    }

    try {
      setCreatingOrder(true);
      setError(null);

      const createdOrder = await ordersService.createOrder({
        clientApplicationId: application.id,
      });

      setOrder(createdOrder);

      try {
        const conversationData = await conversationsService.getConversationByOrderId(createdOrder.id);
        setConversation(conversationData);
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError.detail?.includes("duplicate key") || apiError.detail?.includes("already exists")) {
        setError(t("manager.orderAlreadyExists") || "Order already exists for this application. Please refresh the page.");
        // Пытаемся загрузить существующий заказ
        try {
          const allOrders = await ordersService.getOrders();
          const ordersArray = Array.isArray(allOrders) ? allOrders : [];
          const existingOrder = ordersArray.find(o => o.clientApplicationId === application.id);
          if (existingOrder) {
            setOrder(existingOrder);
            try {
              const conversationData = await conversationsService.getConversationByOrderId(existingOrder.id);
              setConversation(conversationData);
            } catch (convErr) {
              console.error("Failed to load conversation:", convErr);
            }
          }
        } catch (loadErr) {
          console.error("Failed to load existing order:", loadErr);
        }
      } else {
        setError(apiError.message || apiError.detail || "Failed to create order");
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  const canSendMessage = !order || order.status !== "COMPLETED";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-gray-400">{t("catalog.loading")}</div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10">
      <div className="container mx-auto">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Левая панель с деталями заявки */}
          <div className="w-1/3 flex-shrink-0">
            <div className="bg-stone-900/80 rounded-xl border border-gray-800 p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                  {t("manager.application")} #{application.id}
                </h1>
                <Link
                  to="/applications"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← {t("order.back") || "Back"}
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("manager.client")}
                  </label>
                  <p className="text-white">
                    {clientInfo ? (
                      `${clientInfo.person.firstName} ${clientInfo.person.lastName}`
                    ) : (
                      <span className="text-gray-500">{t("catalog.loading")}</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("manager.applicationDate")}
                  </label>
                  <p className="text-gray-300">{formatDate(application.createdAt)}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("application.description")}
                  </label>
                  <p className="text-gray-300 whitespace-pre-wrap">{application.description}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">
                    {t("application.amount")}
                  </label>
                  <p className="text-white font-semibold">{application.amount}</p>
                </div>

                {order ? (
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-1 block">
                      {t("order.title")}
                    </label>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      #{order.id}
                    </Link>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleCreateOrder}
                      disabled={creatingOrder}
                      className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
                    >
                      {creatingOrder ? (t("manager.creating") || "Creating...") : (t("manager.createOrder") || "Create Order")}
                    </button>
                  </div>
                )}

                {applicationFiles.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-2 block">
                      {t("order.files") || "Files"}
                    </label>
                    <div className="space-y-2">
                      {applicationFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-stone-800/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-300 truncate flex-1">
                            {file.filename || `File #${file.id}`}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await filesService.downloadFile(file.id, file.filename || `file-${file.id}`);
                                } catch (err) {
                                  console.error("Failed to download file:", err);
                                }
                              }}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                              title={t("order.download") || "Download"}
                            >
                              <DownloadIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая панель с чатом */}
          <div className="flex-1 flex flex-col">
            <div className="bg-stone-900/80 rounded-xl border border-gray-800 p-6 h-full flex flex-col">
              {order && conversation ? (
                <>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    {t("order.chat") || "Chat"}
                  </h2>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        {t("order.noMessages") || "No messages yet"}
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.authorId === (clientInfo?.accountId || 0) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.authorId === (clientInfo?.accountId || 0)
                                ? 'bg-emerald-500/20 text-white'
                                : 'bg-stone-800/50 text-gray-300'
                            }`}
                          >
                            <div className="text-xs text-gray-400 mb-1">
                              {getAuthorName(message.authorId)} • {formatDate(message.sentAt)}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {canSendMessage && (
                    <form onSubmit={handleSendMessage} className="space-y-2">
                      {uploadedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-2 py-1 bg-stone-800/50 rounded text-sm"
                            >
                              <span className="text-gray-300 truncate max-w-[200px]">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder={t("order.messagePlaceholder") || "Type a message..."}
                          className="flex-1 rounded-lg bg-stone-950/70 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          disabled={sending}
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                            disabled={uploading || sending}
                          />
                          <div className="p-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 transition-colors">
                            {uploading ? (
                              <span className="text-gray-400">{t("order.uploading") || "Uploading..."}</span>
                            ) : (
                              <UploadFileIcon className="text-gray-400" />
                            )}
                          </div>
                        </label>
                        <button
                          type="submit"
                          disabled={!messageText.trim() && uploadedFileIds.length === 0 || sending}
                          className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <SendIcon className="text-white" />
                        </button>
                      </div>
                    </form>
                  )}

                  {!canSendMessage && (
                    <div className="text-center text-gray-500 py-4">
                      {t("order.cannotSendToCompleted") || "Cannot send messages to completed orders"}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="mb-2">{t("order.noOrderYet") || "No order created yet"}</p>
                    {!order && (
                      <p className="text-sm">{t("order.createOrderFromApplication") || "Create an order from this application to start chatting"}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetails;

