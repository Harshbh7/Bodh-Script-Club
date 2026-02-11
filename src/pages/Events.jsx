import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import { eventsAPI } from '../utils/api';
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
    course: '',
    // Team fields for hackathons
    teamName: '',
    teamMembers: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
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
    // Allow registration without authentication
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

  const addTeamMember = () => {
    const maxSize = selectedEvent?.teamSettings?.maxTeamSize || 4;
    if (registrationData.teamMembers.length >= maxSize - 1) {
      alert(`Maximum ${maxSize} members allowed (including you)`);
      return;
    }
    
    setRegistrationData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', registrationNo: '', phoneNumber: '', course: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    setRegistrationData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { sameAsPhone, ...dataToSubmit } = registrationData;
      
      console.log('📝 Submitting registration for event:', selectedEvent.slug || selectedEvent._id);
      console.log('📝 Registration data:', dataToSubmit);
      
      // For hackathons, validate team requirements
      if (selectedEvent.eventType === 'hackathon') {
        const minSize = selectedEvent.teamSettings?.minTeamSize || 1;
        const maxSize = selectedEvent.teamSettings?.maxTeamSize || 4;
        const teamSize = dataToSubmit.teamMembers.length + 1; // +1 for the leader
        
        if (teamSize < minSize || teamSize > maxSize) {
          alert(`Team must have between ${minSize} and ${maxSize} members (including you)`);
          setSubmitting(false);
          return;
        }
        
        // Mark as team registration
        dataToSubmit.isTeamRegistration = true;
      }
      
      // Use slug if available, otherwise use _id
      const eventIdentifier = selectedEvent.slug || selectedEvent._id;
      console.log('🔑 Using event identifier:', eventIdentifier);
      
      // Register for event (backend will check for duplicates by registration number)
      const response = await eventsAPI.register(eventIdentifier, dataToSubmit);
      console.log('✅ Registration successful:', response.data);
      
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
          course: '',
          teamName: '',
          teamMembers: []
        });
        setRegistrationSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      // Show more detailed error message
      if (error.response?.data?.missingFields) {
        alert(`Please fill in all required fields: ${error.response.data.missingFields.join(', ')}`);
      } else if (error.response?.data?.error === 'DUPLICATE_REGISTRATION') {
        alert('You have already registered for this event with this registration number.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const EventCard = ({ event, showRegisterButton }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    return (
      <Link 
        to={`/events/${event.slug || event._id}`}
        className="glass-effect rounded-2xl overflow-hidden border border-gray-800 card-hover group block"
      >
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
            className={`w-full h-full object-contain bg-gray-900 group-hover:scale-105 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-heading font-bold text-white mb-2 drop-shadow-lg">{event.title}</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-300 font-body mb-6 line-clamp-3">
            {event.shortDescription || event.description?.substring(0, 150) || 'No description available'}
          </p>

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
        </div>
      </Link>
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

                    {/* Team Registration for Hackathons */}
                    {selectedEvent?.eventType === 'hackathon' && (
                      <div className="border-t border-gray-700 pt-4 mt-2">
                        <div className="mb-3 p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                          <h4 className="text-sm font-heading font-bold text-neon-purple mb-1">
                            Team Registration
                          </h4>
                          <p className="text-xs text-gray-400">
                            Team size: {selectedEvent.teamSettings?.minTeamSize || 1} - {selectedEvent.teamSettings?.maxTeamSize || 4} members (including you)
                          </p>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs sm:text-sm font-body text-gray-400 mb-1.5">Team Name *</label>
                          <input
                            type="text"
                            name="teamName"
                            value={registrationData.teamName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-black/50 border border-gray-700 rounded-lg text-white font-body focus:border-neon-purple focus:outline-none transition-colors"
                            placeholder="Enter your team name"
                          />
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-body text-gray-400">
                              Team Members ({registrationData.teamMembers.length + 1}/{selectedEvent.teamSettings?.maxTeamSize || 4})
                            </label>
                            {registrationData.teamMembers.length < (selectedEvent.teamSettings?.maxTeamSize || 4) - 1 && (
                              <button
                                type="button"
                                onClick={addTeamMember}
                                className="text-xs px-3 py-1 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/30 transition-colors"
                              >
                                + Add Member
                              </button>
                            )}
                          </div>

                          {/* Team Leader (You) */}
                          <div className="mb-2 p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                            <p className="text-xs text-neon-cyan font-semibold mb-1">Team Leader (You)</p>
                            <p className="text-xs text-gray-400">{registrationData.name || 'Your name'} - {registrationData.registrationNo || 'Your reg. no.'}</p>
                          </div>

                          {/* Additional Team Members */}
                          {registrationData.teamMembers.map((member, index) => (
                            <div key={index} className="mb-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-300">Member {index + 2}</p>
                                <button
                                  type="button"
                                  onClick={() => removeTeamMember(index)}
                                  className="text-xs text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                  required
                                  className="px-2 py-1.5 text-xs bg-black/50 border border-gray-700 rounded text-white focus:border-neon-purple focus:outline-none"
                                  placeholder="Name *"
                                />
                                <input
                                  type="text"
                                  value={member.registrationNo}
                                  onChange={(e) => updateTeamMember(index, 'registrationNo', e.target.value)}
                                  required
                                  className="px-2 py-1.5 text-xs bg-black/50 border border-gray-700 rounded text-white focus:border-neon-purple focus:outline-none"
                                  placeholder="Reg. No. *"
                                />
                                <input
                                  type="tel"
                                  value={member.phoneNumber}
                                  onChange={(e) => updateTeamMember(index, 'phoneNumber', e.target.value)}
                                  required
                                  className="px-2 py-1.5 text-xs bg-black/50 border border-gray-700 rounded text-white focus:border-neon-purple focus:outline-none"
                                  placeholder="Phone *"
                                />
                                <input
                                  type="text"
                                  value={member.course}
                                  onChange={(e) => updateTeamMember(index, 'course', e.target.value)}
                                  required
                                  className="px-2 py-1.5 text-xs bg-black/50 border border-gray-700 rounded text-white focus:border-neon-purple focus:outline-none"
                                  placeholder="Course *"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg font-body font-semibold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-neon-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitting ? 'Submitting...' : 'Submit Registration'}
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
