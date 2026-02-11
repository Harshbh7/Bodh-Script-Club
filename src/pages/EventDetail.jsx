import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import EventRegistrationForm from '../components/EventRegistrationForm';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
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
      
      console.log('📝 Submitting registration for event:', event.slug || event._id);
      console.log('📝 Registration data:', dataToSubmit);
      
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
      
      // Use slug if available, otherwise use _id
      const eventIdentifier = event.slug || event._id;
      console.log('🔑 Using event identifier:', eventIdentifier);
      
      const response = await eventsAPI.register(eventIdentifier, dataToSubmit);
      console.log('✅ Registration successful:', response.data);
      
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
            theme === 'dark' ? 'border-neon-blue' : 'border-blue-600'
          }`}></div>
          <div className={`text-2xl font-body ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <div className="text-center">
          <h2 className={`text-3xl font-heading font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Event Not Found</h2>
          <Link to="/events" className={`transition-colors ${
            theme === 'dark' ? 'text-neon-cyan hover:underline' : 'text-blue-600 hover:underline'
          }`}>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-radial from-neon-blue/10 via-transparent to-transparent'
            : 'bg-gradient-radial from-blue-100/30 via-transparent to-transparent'
        }`}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link 
            to="/events" 
            className={`inline-flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'text-neon-cyan hover:text-white'
                : 'text-blue-600 hover:text-blue-700'
            }`}
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
            <div className={`relative h-96 lg:h-auto rounded-2xl overflow-hidden border ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <LazyImage
                src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Details */}
            <div>
              <h1 className={`text-4xl md:text-5xl font-heading font-bold mb-6 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                {event.title}
              </h1>

              <div className="space-y-4 mb-8">
                <div className={`flex items-center gap-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Calendar size={20} className={theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'} />
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
                  <div className={`flex items-center gap-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Clock size={20} className={theme === 'dark' ? 'text-neon-purple' : 'text-purple-600'} />
                    <span className="font-body">{event.time}</span>
                  </div>
                )}
                
                {event.location && (
                  <div className={`flex items-center gap-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <MapPin size={20} className={theme === 'dark' ? 'text-neon-pink' : 'text-pink-600'} />
                    <span className="font-body">{event.location}</span>
                  </div>
                )}
                
                {event.maxAttendees && (
                  <div className={`flex items-center gap-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Users size={20} className={theme === 'dark' ? 'text-neon-blue' : 'text-blue-600'} />
                    <span className="font-body">Max: {event.maxAttendees} attendees</span>
                  </div>
                )}
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`px-3 py-1 rounded-full text-xs font-mono ${
                        theme === 'dark'
                          ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-cyan'
                          : 'bg-blue-100 border border-blue-300 text-blue-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {event.status === 'upcoming' && (
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl font-body font-semibold text-lg text-white hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Register Now
                </button>
              )}

              {event.status === 'completed' && (
                <div className={`p-4 border rounded-xl text-center ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-100 border-gray-300'
                }`}>
                  <p className={`font-body ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>This event has ended</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Description */}
          <div className="mt-16">
            <h2 className={`text-3xl font-heading font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>About This Event</h2>
            <div 
              className={`prose max-w-none font-body leading-relaxed ${
                theme === 'dark' ? 'prose-invert text-gray-300' : 'prose-gray text-gray-700'
              }`}
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {/* Event Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-heading font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Event Gallery ({event.gallery.length} {event.gallery.length === 1 ? 'Photo' : 'Photos'})
                </h2>
                {event.gallery.length > 1 && (
                  <button
                    onClick={() => openGalleryPlayer(0)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-body font-semibold text-white hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
                    className={`relative aspect-square rounded-xl overflow-hidden border group cursor-pointer ${
                      theme === 'dark'
                        ? 'glass-effect border-gray-800'
                        : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
                    }`}
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
        <EventRegistrationForm
          event={event}
          registrationData={registrationData}
          handleInputChange={handleInputChange}
          handleSubmitRegistration={handleSubmitRegistration}
          submitting={submitting}
          registrationSuccess={registrationSuccess}
          setShowRegistrationModal={setShowRegistrationModal}
          addTeamMember={addTeamMember}
          removeTeamMember={removeTeamMember}
          updateTeamMember={updateTeamMember}
        />
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;
