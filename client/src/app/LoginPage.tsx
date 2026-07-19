import { useSearchParams } from 'react-router-dom';
import { LoginButton } from '../features/auth/components/LoginButton';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-gray-800 sm:text-3xl">DocPulse</h1>
      <p className="mb-6 max-w-sm text-gray-500">Know which of your docs you can still trust.</p>
      {error && (
        <p className="mb-4 text-sm text-red-700" role="alert">
          Sign-in failed. Please try again.
        </p>
      )}
      <LoginButton />
    </div>
  );
}
