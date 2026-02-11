import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [showGalleryPlayer, setShowGalleryPlayer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Auto-play slideshow
  useEffect(() => {
    if (isPlaying && event?.gallery && event.gallery.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === event.gallery.length - 1 ? 0 : prev + 1
        );
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, event, currentImageIndex]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showGalleryPlayer) {
        closeGalleryPlayer();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showGalleryPlayer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (!showGalleryPlayer) return;
      
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [showGalleryPlayer, currentImageIndex, isPlaying]);

  const fetchEvent = async () => {
    try {
      const { data } = await eventsAPI.getOne(id);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGalleryPlayer = (index = 0) => {
    setCurrentImageIndex(index);
    setShowGalleryPlayer(true);
    setIsPlaying(false);
  };

  const closeGalleryPlayer = () => {
    setShowGalleryPlayer(false);
    setCurrentImageIndex(0);
    setIsPlaying(false);
  };

  const handleNextImage = () => {
    if (!event?.gallery) return;
    setCurrentImageIndex((prev) => 
      prev === event.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!event?.gallery) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? event.gallery.length - 1 : prev - 1
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRegisterClick = () => {
    // Allow registration without authentication
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
    const maxSize = event?.teamSettings?.maxTeamSize || 4;
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
      
      // For hackathons, validate team requirements
      if (event.eventType === 'hackathon') {
        const minSize = event.teamSettings?.minTeamSize || 1;
        const maxSize = event.teamSettings?.maxTeamSize || 4;
        const teamSize = dataToSubmit.teamMembers.length + 1; // +1 for the leader
        
        if (teamSize < minSize || teamSize > maxSize) {
          alert(`Team must have between ${minSize} and ${maxSize} members (including you)`);
          setSubmitting(false);
          return;
        }
        
        // Mark as team registration
        dataToSubmit.isTeamRegistration = true;
      }
      
      await eventsAPI.register(event._id, dataToSubmit);
      setRegistrationSuccess(true);
      
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
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-body text-gray-400">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Event Not Found</h2>
          <Link to="/events" className="text-neon-cyan hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link 
            to="/events" 
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span className="font-body">Back to Events</span>
          </Link>
        </div>
      </section>

      {/* Event Content */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Event Image */}
            <div className="relative h-96 lg:h-auto rounded-2xl overflow-hidden glass-effect border border-gray-800">
              <LazyImage
                src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Details */}
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-6">
                {event.title}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar size={20} className="text-neon-cyan" />
                  <span className="font-body">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                {event.time && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock size={20} className="text-neon-purple" />
                    <span className="font-body">{event.time}</span>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin size={20} className="text-neon-pink" />
                    <span className="font-body">{event.location}</span>
                  </div>
                )}
                
                {event.maxAttendees && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users size={20} className="text-neon-blue" />
                    <span className="font-body">Max: {event.maxAttendees} attendees</span>
                  </div>
                )}
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-cyan text-xs font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {event.status === 'upcoming' && (
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-xl font-body font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-neon-blue/50"
                >
                  Register Now
                </button>
              )}

              {event.status === 'completed' && (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-center">
                  <p className="text-gray-400 font-body">This event has ended</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Description */}
          <div className="mt-16">
            <h2 className="text-3xl font-heading font-bold text-white mb-6">About This Event</h2>
            <div 
              className="prose prose-invert max-w-none font-body text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {/* Event Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-heading font-bold text-white">
                  Event Gallery ({event.gallery.length} {event.gallery.length === 1 ? 'Photo' : 'Photos'})
                </h2>
                {event.gallery.length > 1 && (
                  <button
                    onClick={() => openGalleryPlayer(0)}
                    className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-body font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <Play size={18} />
                    <span className="hidden sm:inline">Play Slideshow</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {event.gallery.map((image, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-square rounded-xl overflow-hidden glass-effect border border-gray-800 group cursor-pointer"
                    onClick={() => openGalleryPlayer(idx)}
                  >
                    <LazyImage
                      src={image.url}
                      alt={image.caption || `Event photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play size={20} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white font-body text-sm line-clamp-2">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Player Modal */}
      {showGalleryPlayer && event?.gallery && event.gallery.length > 0 && (
        <div className="fixed inset-0 z-[9997] bg-black/95 backdrop-blur-lg animate-fadeIn flex flex-col">
          {/* Header with Controls */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 md:p-4 glass-effect border-b border-gray-800">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={closeGalleryPlayer}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all duration-300"
              >
                <X size={18} />
                <span className="font-body text-sm hidden sm:inline">Close</span>
              </button>
              
              {/* Play/Pause Button */}
              {event.gallery.length > 1 && (
                <button
                  onClick={togglePlayPause}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-body font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="text-right">
              <h2 className="text-sm md:text-lg font-heading font-bold gradient-text line-clamp-1">
                {event.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-400 font-body mt-1">
                {currentImageIndex + 1} / {event.gallery.length}
              </p>
            </div>
          </div>

          {/* Image Container - Adjusted height to leave room for thumbnails */}
          <div className="flex-1 flex items-center justify-center px-2 md:px-4 py-4 md:py-6 relative overflow-hidden">
            <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
              {/* Main Image */}
              <LazyImage
                src={event.gallery[currentImageIndex]?.url || event.gallery[currentImageIndex]}
                alt={event.gallery[currentImageIndex]?.caption || `Image ${currentImageIndex + 1}`}
                className="w-full h-full max-h-full object-contain rounded-xl mx-auto"
              />
              
              {/* Image Caption */}
              {event.gallery[currentImageIndex]?.caption && (
                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 md:px-6 md:py-3 glass-effect rounded-lg md:rounded-xl max-w-xs md:max-w-2xl">
                  <p className="text-white font-body text-center text-xs md:text-sm line-clamp-2">
                    {event.gallery[currentImageIndex].caption}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              {event.gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full glass-effect flex items-center justify-center hover:bg-neon-blue/20 transition-all duration-300"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full glass-effect flex items-center justify-center hover:bg-neon-blue/20 transition-all duration-300"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Strip - Fixed height with proper scrolling */}
          <div className="flex-shrink-0 p-3 md:p-4 glass-effect border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
              {/* Scrollable thumbnail container with visible scrollbar */}
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 thumbnail-scroll">
                  {event.gallery.map((img, idx) => {
                    const imgUrl = typeof img === 'string' ? img : img.url;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          idx === currentImageIndex
                            ? 'border-neon-blue scale-105 shadow-lg shadow-neon-blue/50'
                            : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <LazyImage
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
                
                {/* Scroll indicators */}
                {event.gallery.length > 5 && (
                  <div className="absolute -top-1 right-0 px-2 py-1 bg-gray-900/80 rounded text-xs text-gray-400 font-body">
                    Scroll →
                  </div>
                )}
              </div>

              {/* Keyboard Hints */}
              <div className="text-center mt-2 text-xs text-gray-500 font-body">
                Use ← → arrow keys to navigate • Space to play/pause • ESC to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect rounded-2xl border border-gray-800">
            {/* Modal content - same as Events.jsx */}
            <div className="sticky top-0 bg-black/50 backdrop-blur-md border-b border-gray-800 p-4 sm:p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold gradient-text">
                  Event Registration
                </h2>
                <p className="text-gray-400 font-body mt-1 text-sm sm:text-base">{event.title}</p>
              </div>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {registrationSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-gray-400 font-body">You're all set for the event.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  {/* Form fields - same as Events.jsx */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={registrationData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registrationNo"
                        value={registrationData.registrationNo}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="e.g., 21BCS001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={registrationData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={registrationData.whatsappNumber}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        disabled={registrationData.sameAsPhone}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500 disabled:opacity-50"
                        placeholder="10-digit WhatsApp number"
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sameAsPhone"
                          checked={registrationData.sameAsPhone}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-neon-blue"
                        />
                        <span className="text-xs text-gray-400 font-body">Same as phone number</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Course *
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={registrationData.course}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="e.g., B.Tech CSE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Section *
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={registrationData.section}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="e.g., A"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Year *
                      </label>
                      <select
                        name="year"
                        value={registrationData.year}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white"
                      >
                        <option value="">Select Year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">
                        Department *
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={registrationData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-blue focus:outline-none transition font-body text-white placeholder:text-gray-500"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>

                  {/* Team Registration for Hackathons */}
                  {event?.eventType === 'hackathon' && (
                    <div className="border-t border-gray-700 pt-4 mt-2">
                      <div className="mb-4 p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                        <h4 className="text-base font-heading font-bold text-neon-purple mb-1">
                          Team Registration
                        </h4>
                        <p className="text-sm text-gray-400">
                          Team size: {event.teamSettings?.minTeamSize || 1} - {event.teamSettings?.maxTeamSize || 4} members (including you)
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-heading font-semibold mb-2 text-neon-blue">Team Name *</label>
                        <input
                          type="text"
                          name="teamName"
                          value={registrationData.teamName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-neon-purple focus:outline-none transition font-body text-white placeholder:text-gray-500"
                          placeholder="Enter your team name"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-heading font-semibold text-neon-blue">
                            Team Members ({registrationData.teamMembers.length + 1}/{event.teamSettings?.maxTeamSize || 4})
                          </label>
                          {registrationData.teamMembers.length < (event.teamSettings?.maxTeamSize || 4) - 1 && (
                            <button
                              type="button"
                              onClick={addTeamMember}
                              className="text-sm px-4 py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/30 transition-colors"
                            >
                              + Add Member
                            </button>
                          )}
                        </div>

                        {/* Team Leader (You) */}
                        <div className="mb-3 p-4 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                          <p className="text-sm text-neon-cyan font-semibold mb-1">Team Leader (You)</p>
                          <p className="text-sm text-gray-400">{registrationData.name || 'Your name'} - {registrationData.registrationNo || 'Your reg. no.'}</p>
                        </div>

                        {/* Additional Team Members */}
                        {registrationData.teamMembers.map((member, index) => (
                          <div key={index} className="mb-3 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold text-gray-300">Member {index + 2}</p>
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                required
                                className="px-3 py-2 text-sm bg-black/50 border border-gray-700 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                                placeholder="Name *"
                              />
                              <input
                                type="text"
                                value={member.registrationNo}
                                onChange={(e) => updateTeamMember(index, 'registrationNo', e.target.value)}
                                required
                                className="px-3 py-2 text-sm bg-black/50 border border-gray-700 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                                placeholder="Reg. No. *"
                              />
                              <input
                                type="tel"
                                value={member.phoneNumber}
                                onChange={(e) => updateTeamMember(index, 'phoneNumber', e.target.value)}
                                required
                                className="px-3 py-2 text-sm bg-black/50 border border-gray-700 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                                placeholder="Phone *"
                              />
                              <input
                                type="text"
                                value={member.course}
                                onChange={(e) => updateTeamMember(index, 'course', e.target.value)}
                                required
                                className="px-3 py-2 text-sm bg-black/50 border border-gray-700 rounded-lg text-white focus:border-neon-purple focus:outline-none"
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
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;
