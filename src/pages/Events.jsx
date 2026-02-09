import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, X, IndianRupee } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import { eventsAPI, paymentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    registrationNo: '',
    phoneNumber: '',
    whatsappNumber: '',
    sameAsPhone: false,
    section: '',
    department: '',
    year: '',
    course: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-open registration modal if redirected from login/signup
  useEffect(() => {
    if (isAuthenticated && location.state?.eventId && events.length > 0) {
      const event = events.find(e => e._id === location.state.eventId);
      if (event) {
        setSelectedEvent(event);
        setShowRegistrationModal(true);
        // Clear the state
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [isAuthenticated, location.state, events, navigate, location.pathname]);

  const fetchEvents = async () => {
    try {
      const { data } = await eventsAPI.getAll();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('Events data is not an array:', data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // In production, we want to know if there's an error, but for now we'll set empty array
      // to avoid breaking the UI. You might want to show an error message state here.
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = Array.isArray(events) ? events.filter(e => e.status === 'upcoming') : [];
  const previousEvents = Array.isArray(events) ? events.filter(e => e.status === 'completed') : [];

  const handleRegisterClick = (event) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/events', eventId: event._id } });
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    setRegistrationSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'sameAsPhone') {
      setRegistrationData(prev => ({
        ...prev,
        sameAsPhone: checked,
        whatsappNumber: checked ? prev.phoneNumber : ''
      }));
    } else {
      setRegistrationData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'phoneNumber' && prev.sameAsPhone ? { whatsappNumber: value } : {})
      }));
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { sameAsPhone, ...dataToSubmit } = registrationData;
      
      // Check if event is paid
      if (selectedEvent.isPaid && selectedEvent.price > 0) {
        // Handle paid event - initiate Razorpay payment
        await handlePayment(dataToSubmit);
      } else {
        // Handle free event - direct registration
        await eventsAPI.register(selectedEvent._id, dataToSubmit);
        setRegistrationSuccess(true);
        
        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          setShowRegistrationModal(false);
          setRegistrationData({
            name: '',
            registrationNo: '',
            phoneNumber: '',
            whatsappNumber: '',
            sameAsPhone: false,
            section: '',
            department: '',
            year: '',
            course: ''
          });
          setRegistrationSuccess(false);
        }, 2000);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (registrationData) => {
    try {
      setProcessingPayment(true);

      // Create Razorpay order
      const { data: orderData } = await paymentAPI.createOrder({
        eventId: selectedEvent._id,
        amount: selectedEvent.price,
        registrationData
      });

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RhY9r0Btuo0gVQ',
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Bodh Script Club',
        description: `Registration for ${selectedEvent.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationData
            };

            await paymentAPI.verifyPayment(verifyData);
            
            setRegistrationSuccess(true);
            setProcessingPayment(false);

            // Reset form after 2 seconds and close modal
            setTimeout(() => {
              setShowRegistrationModal(false);
              setRegistrationData({
                name: '',
                registrationNo: '',
                phoneNumber: '',
                whatsappNumber: '',
                sameAsPhone: false,
                section: '',
                department: '',
                year: '',
                course: ''
              });
              setRegistrationSuccess(false);
            }, 2000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: registrationData.name,
          contact: registrationData.phoneNumber,
        },
        theme: {
          color: '#00D9FF'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
      setSubmitting(false);
    }
  };

  const EventCard = ({ event, showRegisterButton }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    return (
      <div className="glass-effect rounded-2xl overflow-hidden border border-gray-800 card-hover group">
        <div className="relative h-56 overflow-hidden bg-gray-900">
          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar size={48} className="text-gray-600" />
              </div>
            </div>
          )}
          
          <LazyImage
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'}
            alt={event.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          {/* Price Badge */}
          {event.isPaid && event.price > 0 && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <IndianRupee size={16} className="text-white" />
              <span className="text-white font-bold">{event.price}</span>
            </div>
          )}
          {!event.isPaid && (
            <div className="absolute top-4 right-4 bg-green-500/90 px-4 py-2 rounded-full shadow-lg">
              <span className="text-white font-bold text-sm">FREE</span>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-heading font-bold text-white mb-2">{event.title}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-300 font-body mb-6 line-clamp-3">{event.description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar size={18} className="text-neon-cyan" />
            <span className="font-body text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-3 text-gray-400">
              <Clock size={18} className="text-neon-purple" />
              <span className="font-body text-sm">{event.time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin size={18} className="text-neon-pink" />
              <span className="font-body text-sm">{event.location}</span>
            </div>
          )}
          {event.maxAttendees && (
            <div className="flex items-center gap-3 text-gray-400">
              <Users size={18} className="text-neon-blue" />
              <span className="font-body text-sm">Max: {event.maxAttendees} attendees</span>
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-cyan text-xs font-mono">
                {tag}
              </span>
            ))}
          </div>
        )}

        {showRegisterButton && (
          <button
            onClick={() => handleRegisterClick(event)}
            className="w-full py-3 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-xl font-body font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-neon-blue/50"
          >
            {event.isPaid && event.price > 0 ? `Register - ₹${event.price}` : 'Register Now'}
          </button>
        )}
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-body text-gray-400">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-heading font-bold mb-6 gradient-text animate-float">
            Events
          </h1>
          <p className="text-xl md:text-2xl font-body text-gray-400 max-w-3xl mx-auto">
            Join us for exciting workshops, hackathons, and tech talks
          </p>
        </div>
      </section>

      {/* No Events Message */}
      {!loading && events.length === 0 && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-6">
              <Calendar size={48} className="text-neon-blue" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              No Events Available
            </h2>
            <p className="text-gray-400 font-body mb-8">
              We're currently planning exciting events. Check back soon!
            </p>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-12 gradient-text">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <EventCard key={event._id} event={event} showRegisterButton={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Previous Events */}
      {previousEvents.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-12 gradient-text">
              Previous Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previousEvents.map(event => (
                <EventCard key={event._id} event={event} showRegisterButton={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="glass-effect rounded-2xl sm:rounded-3xl border border-gray-800 max-w-lg w-full my-4 sm:my-8 max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-black/50 backdrop-blur-md border-b border-gray-800 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-heading font-bold gradient-text">
                {registrationSuccess ? 'Success!' : 'Event Registration'}
              </h2>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {registrationSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle size={64} className="text-neon-green mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold text-white mb-2">
                    You're Registered!
                  </h3>
                  <p className="text-gray-400 font-body text-sm">
                    We'll send you event details via email.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 sm:p-4 rounded-xl bg-neon-blue/10 border border-neon-blue/30">
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-1">
                      {selectedEvent?.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-body">
                      {new Date(selectedEvent?.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={registrationData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Registration No. *</label>
                        <input
                          type="text"
                          name="registrationNo"
                          value={registrationData.registrationNo}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                          placeholder="e.g., 12345678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={registrationData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="sameAsPhone"
                        id="sameAsPhone"
                        checked={registrationData.sameAsPhone}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-neon-blue"
                      />
                      <label htmlFor="sameAsPhone" className="text-xs sm:text-sm font-body text-gray-400 cursor-pointer">
                        WhatsApp number is same as phone number
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">WhatsApp Number *</label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={registrationData.whatsappNumber}
                        onChange={handleInputChange}
                        required
                        disabled={registrationData.sameAsPhone}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Course *</label>
                        <input
                          type="text"
                          name="course"
                          value={registrationData.course}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                          placeholder="B.Tech"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Section *</label>
                        <input
                          type="text"
                          name="section"
                          value={registrationData.section}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                          placeholder="A"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Department *</label>
                        <input
                          type="text"
                          name="department"
                          value={registrationData.department}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                          placeholder="CSE"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Year *</label>
                        <select
                          name="year"
                          value={registrationData.year}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-blue focus:outline-none transition-colors"
                        >
                          <option value="">Select</option>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      </div>
                    </div>

                    {selectedEvent?.isPaid && selectedEvent?.price > 0 && (
                      <div className="p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-body">Event Fee:</span>
                          <span className="text-xl font-heading font-bold text-neon-cyan flex items-center gap-1">
                            <IndianRupee size={18} />
                            {selectedEvent.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Secure payment via Razorpay
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || processingPayment}
                      className="w-full py-3 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg font-body font-semibold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-neon-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {processingPayment ? 'Processing...' : submitting ? 'Submitting...' : selectedEvent?.isPaid && selectedEvent?.price > 0 ? `Pay ₹${selectedEvent.price} & Register` : 'Submit Registration'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Events;
