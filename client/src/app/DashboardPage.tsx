import { HealthSummaryCards } from '../features/dashboard/components/HealthSummaryCards';
import { RepoList } from '../features/repositories/components/RepoList';
import { ConnectRepoModal } from '../features/repositories/components/ConnectRepoModal';

export function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <h1 className="sr-only">Dashboard</h1>
      <HealthSummaryCards />
      <RepoList />
      <ConnectRepoModal />
    </div>
  );
}
