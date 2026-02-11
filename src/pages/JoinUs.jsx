import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import Footer from '../components/Footer';
import { submissionsAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    phone: '',
    whatsapp: '',
    course: '',
    section: '',
    year: '',
    batch: '',
    github: '',
  });
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { theme } = useTheme();

  useEffect(() => {
    gsap.fromTo('.form-container',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    if (sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameAsPhone, formData.phone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'phone' && sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Starting form submission...');
      console.log('Form data:', formData);

      console.log('Submitting form data...');
      const response = await submissionsAPI.create(formData);
      console.log('Submission response:', response);
      
      setMessage({ 
        type: 'success', 
        text: 'Application submitted successfully! We will review your application soon.' 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        registrationNumber: '',
        phone: '',
        whatsapp: '',
        course: '',
        section: '',
        year: '',
        batch: '',
        github: '',
      });
      setSameAsPhone(false);
      
      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const responseData = error.response.data;
        
        // Handle duplicate registration/email errors with detailed info
        if (responseData?.error === 'DUPLICATE_REGISTRATION') {
          const existing = responseData.existingSubmission;
          errorMessage = `Registration number ${existing.registrationNumber} is already registered by ${existing.name}. Status: ${existing.status}. Submitted on: ${new Date(existing.submittedAt).toLocaleDateString()}`;
        } else if (responseData?.error === 'DUPLICATE_EMAIL') {
          const existing = responseData.existingSubmission;
          errorMessage = `Email ${existing.email} is already registered. You have already submitted an application with registration number ${existing.registrationNumber}. Status: ${existing.status}.`;
        } else {
          errorMessage = responseData?.message || errorMessage;
        }
        
        console.error('Server error status:', error.response.status);
        console.error('Server error data:', error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
        console.error('No response received:', error.request);
      } else {
        // Error in request setup
        errorMessage = error.message || errorMessage;
        console.error('Request setup error:', error.message);
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-radial from-neon-purple/10 via-transparent to-transparent'
            : 'bg-gradient-radial from-purple-100/30 via-transparent to-transparent'
        }`}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">            
            <h1 className={`text-6xl md:text-8xl font-heading font-bold animate-float ${
              theme === 'dark' ? 'gradient-text' : 'text-gray-900'
            }`}>
              Join The Team
            </h1>
          </div>
          <p className={`text-xl md:text-2xl font-body max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Become a part of Bodh Script Club and shape the future of technology
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto form-container">
          <div className={`rounded-3xl p-8 md:p-12 border ${
            theme === 'dark'
              ? 'glass-effect border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                message.type === 'success' 
                  ? theme === 'dark'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-green-50 border-green-300'
                  : theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-red-50 border-red-300'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className={theme === 'dark' ? 'text-green-500' : 'text-green-600'} size={24} />
                ) : (
                  <AlertCircle className={theme === 'dark' ? 'text-red-500' : 'text-red-600'} size={24} />
                )}
                <p className={`font-body ${
                  message.type === 'success' 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className={`block text-sm font-body font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-body font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Registration Number */}
              <div>
                <label className={`block text-sm font-body font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Registration Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="Enter your registration number"
                />
                <p className={`text-xs mt-1 font-body ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Each registration number can only be used once
                </p>
              </div>

              {/* Phone and WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-body font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } focus:outline-none`}
                    placeholder="10-digit phone number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-body font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    WhatsApp Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    disabled={sameAsPhone}
                    className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } focus:outline-none`}
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              {/* Same as Phone Checkbox */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-900/30 border-gray-800'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  id="sameAsPhone"
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                  className={`w-5 h-5 rounded cursor-pointer ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-900 text-neon-cyan focus:ring-neon-cyan'
                      : 'border-gray-300 bg-white text-blue-600 focus:ring-blue-500'
                  } focus:ring-offset-0`}
                />
                <label htmlFor="sameAsPhone" className={`text-sm font-body cursor-pointer select-none ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  WhatsApp number is same as phone number
                </label>
              </div>

              {/* Course, Section, Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-body font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Course <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } focus:outline-none`}
                    placeholder="e.g., B.Tech CSE"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-body font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Section <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } focus:outline-none`}
                    placeholder="e.g., A"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-body font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-neon-cyan focus:bg-gray-900/70'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } focus:outline-none`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-400'}>Select</option>
                    <option value="1st" className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>1st Year</option>
                    <option value="2nd" className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>2nd Year</option>
                    <option value="3rd" className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>3rd Year</option>
                    <option value="4th" className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>4th Year</option>
                  </select>
                </div>
              </div>

              {/* Batch */}
              <div>
                <label className={`block text-sm font-body font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Batch Year <span className="text-red-400">*</span>
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white focus:border-neon-cyan focus:bg-gray-900/70'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-400'}>Select batch year</option>
                  {batchYears.map(year => (
                    <option key={year} value={year} className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>{year}</option>
                  ))}
                </select>
              </div>

              {/* GitHub Link */}
              <div>
                <label className={`block text-sm font-body font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  GitHub Profile (Optional)
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl font-body transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:bg-gray-900/70'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="https://github.com/username"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-heading font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <span className="text-xl">→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinUs;
