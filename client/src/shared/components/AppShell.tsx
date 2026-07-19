import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { logout } from '../../features/auth/api';
import { useAuthStore } from '../../features/auth/store/authStore';

export function AppShell() {
  const { user, setUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const signOutButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) signOutButtonRef.current?.focus();
  }, [isMenuOpen]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setIsMenuOpen(false);
    }
  }

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a
        href="#main-content"
        className="fixed left-4 top-2 z-50 -translate-y-20 rounded-md bg-gray-900 px-4 py-2 text-sm text-white transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold text-gray-800 hover:text-gray-600 sm:text-2xl"
          >
            DocPulse
          </Link>

          {user && (
            <div ref={menuRef} className="relative">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-sm font-medium text-white ring-2 ring-transparent hover:ring-gray-300 focus:outline-none focus:ring-gray-400"
                aria-label="Open user menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-controls="user-menu"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.username}'s avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </button>

              {isMenuOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-medium text-gray-800">{user.username}</p>
                    {user.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
                  </div>
                  <button
                    ref={signOutButtonRef}
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col pt-16">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 text-center text-xs text-gray-500 sm:px-6 sm:text-sm">
        © {new Date().getFullYear()} DocPulse. Keep your documentation trustworthy.
      </footer>
    </div>
  );
}
