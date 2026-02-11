import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EventRegistrationForm = ({
  event,
  registrationData,
  handleInputChange,
  handleSubmitRegistration,
  submitting,
  registrationSuccess,
  setShowRegistrationModal,
  addTeamMember,
  removeTeamMember,
  updateTeamMember
}) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border ${
        theme === 'dark'
          ? 'glass-effect border-gray-800'
          : 'bg-white border-gray-200 shadow-2xl'
      }`}>
        {/* Modal Header */}
        <div className={`sticky top-0 backdrop-blur-md border-b p-4 sm:p-6 flex items-center justify-between z-10 ${
          theme === 'dark'
            ? 'bg-black/50 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl sm:text-3xl font-heading font-bold ${
              theme === 'dark' ? 'gradient-text' : 'text-gray-900'
            }`}>
              Event Registration
            </h2>
            <p className={`font-body mt-1 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{event.title}</p>
          </div>
          <button
            onClick={() => setShowRegistrationModal(false)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              theme === 'dark'
                ? 'hover:bg-gray-800 text-gray-400'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {registrationSuccess ? (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <svg className={`w-10 h-10 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-2xl font-heading font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Registration Successful!</h3>
              <p className={`font-body ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>You're all set for the event.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {/* Name and Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={registrationData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNo"
                    value={registrationData.registrationNo}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="e.g., 21BCS001"
                  />
                </div>
              </div>

              {/* Phone and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={registrationData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="10-digit WhatsApp number"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="sameAsPhone"
                      checked={registrationData.sameAsPhone}
                      onChange={handleInputChange}
                      className={theme === 'dark' ? 'w-4 h-4 accent-neon-blue' : 'w-4 h-4 accent-blue-600'}
                    />
                    <span className={`text-xs font-body ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Same as phone number</span>
                  </label>
                </div>
              </div>

              {/* Course and Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Course *
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={registrationData.course}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="e.g., B.Tech CSE"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Section *
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={registrationData.section}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="e.g., A"
                  />
                </div>
              </div>

              {/* Year and Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Year *
                  </label>
                  <select
                    name="year"
                    value={registrationData.year}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900'
                    }`}
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-heading font-semibold mb-2 ${
                    theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                  }`}>
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={registrationData.department}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 focus:border-neon-blue text-white placeholder:text-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              {/* Team Registration for Hackathons */}
              {event?.eventType === 'hackathon' && (
                <div className={`border-t pt-4 mt-2 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <div className={`mb-4 p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-neon-purple/10 border-neon-purple/30'
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <h4 className={`text-base font-heading font-bold mb-1 ${
                      theme === 'dark' ? 'text-neon-purple' : 'text-purple-700'
                    }`}>
                      Team Registration
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Team size: {event.teamSettings?.minTeamSize || 1} - {event.teamSettings?.maxTeamSize || 4} members (including you)
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-heading font-semibold mb-2 ${
                      theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                    }`}>Team Name *</label>
                    <input
                      type="text"
                      name="teamName"
                      value={registrationData.teamName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition font-body ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border-gray-700 focus:border-neon-purple text-white placeholder:text-gray-500'
                          : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900 placeholder:text-gray-400'
                      }`}
                      placeholder="Enter your team name"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-heading font-semibold ${
                        theme === 'dark' ? 'text-neon-blue' : 'text-blue-700'
                      }`}>
                        Team Members ({registrationData.teamMembers.length + 1}/{event.teamSettings?.maxTeamSize || 4})
                      </label>
                      {registrationData.teamMembers.length < (event.teamSettings?.maxTeamSize || 4) - 1 && (
                        <button
                          type="button"
                          onClick={addTeamMember}
                          className={`text-sm px-4 py-2 border rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30 hover:bg-neon-purple/30'
                              : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                          }`}
                        >
                          + Add Member
                        </button>
                      )}
                    </div>

                    {/* Team Leader */}
                    <div className={`mb-3 p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-neon-cyan/5 border-neon-cyan/20'
                        : 'bg-cyan-50 border-cyan-200'
                    }`}>
                      <p className={`text-sm font-semibold mb-1 ${
                        theme === 'dark' ? 'text-neon-cyan' : 'text-cyan-700'
                      }`}>Team Leader (You)</p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{registrationData.name || 'Your name'} - {registrationData.registrationNo || 'Your reg. no.'}</p>
                    </div>

                    {/* Team Members */}
                    {registrationData.teamMembers.map((member, index) => (
                      <div key={index} className={`mb-3 p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border-gray-700'
                          : 'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className={`text-sm font-semibold ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>Member {index + 2}</p>
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
                            className={`px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                              theme === 'dark'
                                ? 'bg-black/50 border-gray-700 text-white focus:border-neon-purple'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                            placeholder="Name *"
                          />
                          <input
                            type="text"
                            value={member.registrationNo}
                            onChange={(e) => updateTeamMember(index, 'registrationNo', e.target.value)}
                            required
                            className={`px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                              theme === 'dark'
                                ? 'bg-black/50 border-gray-700 text-white focus:border-neon-purple'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                            placeholder="Reg. No. *"
                          />
                          <input
                            type="tel"
                            value={member.phoneNumber}
                            onChange={(e) => updateTeamMember(index, 'phoneNumber', e.target.value)}
                            required
                            className={`px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                              theme === 'dark'
                                ? 'bg-black/50 border-gray-700 text-white focus:border-neon-purple'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                            placeholder="Phone *"
                          />
                          <input
                            type="text"
                            value={member.course}
                            onChange={(e) => updateTeamMember(index, 'course', e.target.value)}
                            required
                            className={`px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                              theme === 'dark'
                                ? 'bg-black/50 border-gray-700 text-white focus:border-neon-purple'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                            }`}
                            placeholder="Course *"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-body font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink hover:scale-105 hover:shadow-neon-blue/50'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-blue-500/50'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
