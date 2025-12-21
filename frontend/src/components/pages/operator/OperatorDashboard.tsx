import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { productionService, extractApiError, authService } from "../../../services/api";
import type { ProductionTaskResponseDto } from "../../../services/api/production.service";

function OperatorDashboard() {
  const { t } = useTranslation();
  const [currentTask, setCurrentTask] = useState<ProductionTaskResponseDto | null>(null);
  const [taskQueue, setTaskQueue] = useState<ProductionTaskResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const employeeId = authService.getEmployeeId();
        if (!employeeId) {
          throw new Error('Employee ID not found');
        }

        const tasks = await productionService.getProductionTasks({
          cncOperatorId: employeeId,
        });

        const inProgress = tasks.find(t => t.status === 'IN_PROGRESS');
        setCurrentTask(inProgress || null);

        const queued = tasks.filter(t => t.status === 'QUEUED');
        setTaskQueue(queued);
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);

  const handleStartWork = async () => {
    if (currentTask) {
      try {
        await productionService.startTask(currentTask.id);
        setCurrentTask({ ...currentTask, status: 'IN_PROGRESS' });
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка начала работы');
      }
    }
  };

  const handleCompleteTask = async () => {
    if (currentTask) {
      try {
        await productionService.finishTask(currentTask.id);
        setCurrentTask(null);
        const employeeId = authService.getEmployeeId();
        if (employeeId) {
          const tasks = await productionService.getProductionTasks({
            cncOperatorId: employeeId,
          });
          const inProgress = tasks.find(t => t.status === 'IN_PROGRESS');
          setCurrentTask(inProgress || null);
          const queued = tasks.filter(t => t.status === 'QUEUED');
          setTaskQueue(queued);
        }
      } catch (err) {
        const apiError = extractApiError(err);
        setError(apiError.message || 'Ошибка завершения задачи');
      }
    }
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
            {t("operator.dashboard")}
          </h1>
        </div>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("operator.currentTask")}
          </h2>

          {currentTask ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t("manager.order")}
                  </div>
                  <div className="text-sm font-medium text-white">
                    Заказ #{currentTask.clientOrderId}
                  </div>
                  <div className="text-xs text-gray-500">Задача #{currentTask.id}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t("operator.status")}
                  </div>
                  <div className="text-sm text-white">
                    {currentTask.status === 'IN_PROGRESS' ? t("operator.inProgress") : t("operator.queued")}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {currentTask.status === "QUEUED" && (
                  <button
                    onClick={handleStartWork}
                    className="flex-1 rounded-full bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 transition-colors"
                  >
                    {t("operator.startWork")}
                  </button>
                )}
                {currentTask.status === "IN_PROGRESS" && (
                  <button
                    onClick={handleCompleteTask}
                    className="flex-1 rounded-full bg-emerald-600 text-white text-sm font-medium py-2.5 hover:bg-emerald-700 transition-colors"
                  >
                    {t("operator.completeTask")}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("operator.noCurrentTask")}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t("operator.taskQueue")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
              <tr className="text-xs uppercase text-gray-500">
                <th className="text-left px-3 pb-2">{t("operator.task")}</th>
                <th className="text-left px-3 pb-2">
                  {t("operator.material")}
                </th>
                <th className="text-left px-3 pb-2">
                  {t("operator.priority")}
                </th>
              </tr>
              </thead>
              <tbody>
              {taskQueue.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    {t("operator.noTasks")}
                  </td>
                </tr>
              ) : (
                taskQueue.map((task) => (
                  <tr key={task.id}>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium">Задача #{task.id}</div>
                      <div className="text-xs text-gray-500">Заказ #{task.clientOrderId}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      —
                    </td>
                    <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                            "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
                          ].join(" ")}
                        >
                          {t("operator.queued")}
                        </span>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OperatorDashboard;
