import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import type { Application } from "../../../types/orders";

const mockApplications: Application[] = [
  {
    id: "APP-2025-001",
    clientName: "Иван Петров",
    createdAt: "12.11.2025",
    status: "REQUEST",
  },
  {
    id: "APP-2025-002",
    clientName: "Мария Сидорова",
    createdAt: "18.11.2025",
    status: "REQUEST",
  },
  {
    id: "APP-2025-003",
    clientName: "Алексей Иванов",
    createdAt: "20.11.2025",
    status: "REQUEST",
  },
];

function ApplicationsList() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const [applications] = useState<Application[]>(mockApplications);

  // TODO: Загрузка данных с API
  // useEffect(() => {
  //   fetchApplications(filter).then(setApplications);
  // }, [filter]);

  const filteredApplications = useMemo(() => {
    if (filter === "new") {
      return applications.filter((app) => app.status === "REQUEST");
    }
    return applications;
  }, [filter, applications]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-stone-950 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("manager.applicationsList")}
          </h1>
        </div>

        <section className="rounded-3xl border border-gray-800 bg-stone-900/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {t("manager.applicationsList")}
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="text-left px-3 pb-2">
                    {t("manager.application")}
                  </th>
                  <th className="text-left px-3 pb-2">{t("manager.client")}</th>
                  <th className="text-left px-3 pb-2">
                    {t("manager.applicationDate")}
                  </th>
                  <th className="text-right px-3 pb-2">
                    {t("profile.orderActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      {t("manager.noApplications")}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium">
                          № {application.id}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-300">
                        {application.clientName}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-300">
                        {application.createdAt}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/manager/applications/${application.id}`}
                          className="text-xs rounded-full border border-gray-700 px-3 py-1 hover:bg-gray-800 transition-colors"
                        >
                          {t("manager.openApplication")}
                        </Link>
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

export default ApplicationsList;

