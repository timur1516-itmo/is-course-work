import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { MachineTask, TaskPriority } from "../../../types/orders";
import DownloadIcon from "@mui/icons-material/Download";

const priorityLabelKeys: Record<TaskPriority, string> = {
  HIGH: "operator.high",
  MEDIUM: "operator.medium",
  LOW: "operator.low",
};

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: "bg-red-500/10 text-red-300 ring-red-500/40",
  MEDIUM: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/40",
  LOW: "bg-green-500/10 text-green-300 ring-green-500/40",
};

const mockCurrentTask: MachineTask | null = {
  id: "TASK-2025-001",
  name: "Комплект панелей для стенда",
  upFile: "task-001.nc",
  material: "Нержавеющая сталь 2мм",
  quantity: 10,
  priority: "HIGH",
  status: "IN_PROGRESS",
};

const mockTaskQueue: MachineTask[] = [
  {
    id: "TASK-2025-002",
    name: "Логотип из нержавейки",
    upFile: "task-002.nc",
    material: "Алюминий 3мм",
    quantity: 5,
    priority: "MEDIUM",
    status: "PENDING",
  },
  {
    id: "TASK-2025-003",
    name: "Декоративные панели",
    upFile: "task-003.nc",
    material: "Пластик 5мм",
    quantity: 20,
    priority: "LOW",
    status: "PENDING",
  },
  {
    id: "TASK-2025-004",
    name: "Таблички на двери",
    upFile: "task-004.nc",
    material: "Нержавеющая сталь 1мм",
    quantity: 15,
    priority: "HIGH",
    status: "PENDING",
  },
];

function OperatorDashboard() {
  const { t } = useTranslation();
  const [currentTask, setCurrentTask] = useState<MachineTask | null>(mockCurrentTask);
  const [taskQueue] = useState<MachineTask[]>(mockTaskQueue);

  // TODO: Загрузка данных с API
  // useEffect(() => {
  //   fetchCurrentTask().then(setCurrentTask);
  //   fetchTaskQueue().then(setTaskQueue);
  // }, []);

  const handleStartWork = () => {
    if (currentTask) {
      // TODO: Отправка запроса на сервер о начале работы
      setCurrentTask({ ...currentTask, status: "IN_PROGRESS" });
      console.log(`Starting work on task ${currentTask.id}`);
    }
  };

  const handleCompleteTask = () => {
    if (currentTask) {
      // TODO: Отправка запроса на сервер о завершении задачи
      console.log(`Completing task ${currentTask.id}`);
      setCurrentTask(null);
    }
  };

  const handleFileDownload = (fileName: string) => {
    // TODO: Реализовать скачивание файла
    console.log(`Downloading file: ${fileName}`);
  };

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
                    {currentTask.name}
                  </div>
                  <div className="text-xs text-gray-500">№ {currentTask.id}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t("operator.upFile")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      {currentTask.upFile}
                    </span>
                    <button
                      onClick={() => handleFileDownload(currentTask.upFile)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <DownloadIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t("operator.material")}
                  </div>
                  <div className="text-sm text-white">
                    {currentTask.material}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t("operator.quantity")}
                  </div>
                  <div className="text-sm text-white">
                    {currentTask.quantity}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {currentTask.status === "PENDING" && (
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
                      <div className="text-sm font-medium">{task.name}</div>
                      <div className="text-xs text-gray-500">№ {task.id}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {task.material}
                    </td>
                    <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                            priorityStyles[task.priority],
                          ].join(" ")}
                        >
                          {t(priorityLabelKeys[task.priority])}
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
