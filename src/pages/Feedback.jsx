import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, Star, CheckCircle, Send } from 'lucide-react';
import Footer from '../components/Footer';
import { testimonialsAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const Feedback = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
    rating: 5,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo('.feedback-form',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await testimonialsAPI.submit(formData);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', role: '', message: '', rating: 5 });
      }, 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 feedback-form">
            <div className="inline-flex items-center gap-3 mb-6">
              <MessageSquare size={48} className={theme === 'dark' ? 'text-neon-blue' : 'text-blue-600'} />
              <h1 className={`text-5xl md:text-7xl font-heading font-bold ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                FEEDBACK
              </h1>
            </div>
            <p className={`text-xl font-body ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Share your experience with Bodh Script Club
            </p>
          </div>

          {submitted ? (
            <div className="feedback-form text-center py-20">
              <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
              <h2 className={`text-3xl font-heading font-bold mb-4 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>Thank You!</h2>
              <p className={`text-xl font-body mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your feedback has been submitted successfully.
              </p>
              <p className={`font-body ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Our team will review it and it will appear on our website soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`feedback-form rounded-2xl p-8 md:p-12 border ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition font-body focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition font-body focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Your Role/Position *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition font-body focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                    placeholder="e.g., Student, Alumni, Faculty"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-3 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={star <= formData.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Your Feedback *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg transition font-body resize-none focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-blue'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                    placeholder="Share your experience with us..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-body font-semibold text-lg text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Feedback
                    </>
                  )}
                </button>

                <p className={`text-sm text-center font-body ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your feedback will be reviewed by our team before being published.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Feedback;
