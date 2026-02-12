import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';
  const eventId = location.state?.eventId;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
      navigate(from, { state: { eventId }, replace: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || 'Signup failed. Please try again.';
      const code = data?.error;
      if (code === 'JWT_SECRET_MISSING' || code === 'MONGODB_URI_MISSING' || code === 'DB_CONNECTION_FAILED') {
        setError(`${msg} Add MONGODB_URI and JWT_SECRET in Vercel → Project Settings → Environment Variables, then redeploy.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center px-4 py-20 ${theme === 'dark' ? 'bg-black' : 'bg-white'
        }`}>
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-heading font-bold mb-2 ${theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
              Create Account
            </h1>
            <p className={`font-body ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Join Bodh Script Club today
            </p>
          </div>

          {/* Signup Form */}
          <div className={`rounded-2xl p-8 border ${theme === 'dark'
              ? 'glass-effect border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
            }`}>
            {error && (
              <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-red-50 border-red-300'
                }`}>
                <AlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-red-500' : 'text-red-600'
                  }`} />
                <p className={`text-sm font-body ${theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-body mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl font-body transition-colors ${theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      } focus:outline-none`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-body mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl font-body transition-colors ${theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      } focus:outline-none`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-body mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl font-body transition-colors ${theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      } focus:outline-none`}
                    placeholder="Create a password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors focus:outline-none ${theme === 'dark'
                        ? 'text-gray-500 hover:text-neon-cyan'
                        : 'text-gray-400 hover:text-blue-600'
                      }`}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-body mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl font-body transition-colors ${theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      } focus:outline-none`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors focus:outline-none ${theme === 'dark'
                        ? 'text-gray-500 hover:text-neon-cyan'
                        : 'text-gray-400 hover:text-blue-600'
                      }`}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-body font-semibold hover:scale-105 transition-all duration-300 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                  }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 font-body ${theme === 'dark' ? 'bg-black text-gray-500' : 'bg-white text-gray-500'
                  }`}>or</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className={`font-body text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={{ from, eventId }}
                  className={`font-semibold transition-colors ${theme === 'dark'
                      ? 'text-neon-cyan hover:text-neon-blue'
                      : 'text-blue-600 hover:text-blue-700'
                    }`}
                >
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className={`font-body text-sm transition-colors ${theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-400'
                  : 'text-gray-500 hover:text-gray-600'
                }`}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
