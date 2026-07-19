import { redirectToGithubLogin } from '../api';

export function LoginButton() {
  return (
    <button
      onClick={redirectToGithubLogin}
      type="button"
      className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
    >
      Sign in with GitHub
    </button>
  );
}
