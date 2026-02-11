import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${
      theme === 'dark'
        ? 'glass-effect border-gray-800'
        : 'bg-white/80 backdrop-blur-md border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-full px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Responsive */}
          <Link to="/admin" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Bodh Script Club Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className={`text-xl sm:text-2xl font-heading font-bold ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                ADMIN PANEL
              </h1>
              <p className={`text-xs font-mono ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>Bodh Script Club</p>
            </div>
            <div className="block sm:hidden">
              <h1 className={`text-lg font-heading font-bold ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                ADMIN
              </h1>
            </div>
          </Link>

          {/* Desktop Actions - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'glass-effect hover:bg-white/5'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>

            {/* Quick Link to Public Site */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'glass-effect hover:bg-white/5'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Home size={18} className={`transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-neon-cyan'
                  : 'text-gray-600 group-hover:text-blue-600'
              }`} />
              <span className={`text-sm font-body transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-white'
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                View Site
              </span>
            </Link>

            {/* Admin Info */}
            <div className={`rounded-xl px-3 xl:px-4 py-2 border ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-xs font-body ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>Logged in as</p>
              <p className={`text-sm font-heading font-bold truncate max-w-[150px] ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{user?.name}</p>
              <p className={`text-xs font-mono truncate max-w-[150px] ${
                theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'
              }`}>{user?.email}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 xl:px-4 py-2 border rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
              }`}
            >
              <LogOut size={18} className={`transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 group-hover:text-red-300'
                  : 'text-red-600 group-hover:text-red-700'
              }`} />
              <span className={`text-sm font-body transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 group-hover:text-red-300'
                  : 'text-red-600 group-hover:text-red-700'
              }`}>
                Logout
              </span>
            </button>
          </div>

          {/* Mobile/Tablet Actions - Compact */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Theme Switcher Mobile */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'glass-effect hover:bg-white/5'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-gray-700" />
              )}
            </button>

            {/* User indicator */}
            <div className={`hidden md:flex items-center gap-2 rounded-lg px-3 py-2 border ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <User size={16} className={theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'} />
              <span className={`text-sm font-body truncate max-w-[100px] ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{user?.name}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'glass-effect hover:bg-white/5'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              ) : (
                <Menu size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`lg:hidden mt-4 pb-4 border-t pt-4 space-y-3 animate-fade-in ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            {/* Mobile Admin Info */}
            <div className={`rounded-xl px-4 py-3 border ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  theme === 'dark'
                    ? 'bg-neon-cyan/20 border-neon-cyan/30'
                    : 'bg-blue-100 border-blue-300'
                }`}>
                  <User size={20} className={theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-body ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>Logged in as</p>
                  <p className={`text-sm font-heading font-bold truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{user?.name}</p>
                  <p className={`text-xs font-mono truncate ${
                    theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'
                  }`}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Mobile Quick Link */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'glass-effect hover:bg-white/5'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Home size={20} className={`transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-neon-cyan'
                  : 'text-gray-600 group-hover:text-blue-600'
              }`} />
              <span className={`text-sm font-body transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-white'
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                View Public Site
              </span>
            </Link>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 border rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
              }`}
            >
              <LogOut size={20} className={`transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 group-hover:text-red-300'
                  : 'text-red-600 group-hover:text-red-700'
              }`} />
              <span className={`text-sm font-body transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 group-hover:text-red-300'
                  : 'text-red-600 group-hover:text-red-700'
              }`}>
                Logout
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
