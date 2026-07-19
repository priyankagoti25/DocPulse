import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAvailableRepos, connectRepository } from '../api';
import { useRepoStore } from '../store/repoStore';

export function ConnectRepoModal() {
  const { isConnectModalOpen, closeConnectModal } = useRepoStore();
  const queryClient = useQueryClient();

  const { data: availableRepos, isLoading } = useQuery({
    queryKey: ['available-repos'],
    queryFn: fetchAvailableRepos,
    enabled: isConnectModalOpen,
  });

  const connectMutation = useMutation({
    mutationFn: connectRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      closeConnectModal();
    },
  });

  if (!isConnectModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Connect a repository</h2>
          <button onClick={closeConnectModal} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-4">
          {isLoading && <p className="text-gray-500">Loading your repositories...</p>}

          {availableRepos?.map((repo) => (
            <div
              key={repo.githubRepoId}
              className="flex items-center justify-between gap-3 border-b py-3 last:border-0"
            >
              <div>
                <p className="break-all text-sm font-medium text-gray-800">{repo.fullName}</p>
                <p className="text-xs text-gray-400">{repo.private ? 'Private' : 'Public'}</p>
              </div>
              <button
                onClick={() => connectMutation.mutate(repo.fullName)}
                disabled={connectMutation.isPending}
                className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
