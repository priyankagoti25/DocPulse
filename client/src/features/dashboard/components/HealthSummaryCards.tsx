import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../api";

export function HealthSummaryCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading || !data) {
    return <div className="text-gray-500 text-sm" role="status">Loading summary...</div>;
  }

  const cards = [
    { label: "Repositories", value: data.totalRepos },
    { label: "Average score", value: data.averageScore },
    { label: "Critical repos", value: data.statusCounts.critical },
    {
      label: "Aging + Stale",
      value: data.statusCounts.aging + data.statusCounts.stale,
    },
  ];

  return (
    <dl className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4" aria-label="Repository health summary">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg bg-white p-3 shadow sm:p-4">
          <dt className="mb-1 text-xs text-gray-600">{card.label}</dt>
          <dd className="text-xl font-semibold text-gray-800 sm:text-2xl">{card.value}</dd>
        </div>
      ))}
    </dl>
  );
}
