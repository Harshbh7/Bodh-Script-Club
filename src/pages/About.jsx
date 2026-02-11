import { useEffect, useState } from 'react';
import { Target, Lightbulb, Users, Rocket, Trophy } from 'lucide-react';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import { aboutAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      console.log('Fetching about data...');
      const { data } = await aboutAPI.get();
      console.log('About data received:', data);
      
      // Transform API data to match component structure if needed
      if (data && !data.whoWeAre) {
        // API returns flat structure, transform it
        const transformedData = {
          whoWeAre: {
            title: 'Who We Are',
            description: data.description || demoData.whoWeAre.description
          },
          whatWeDo: {
            title: 'What We Do',
            description: 'We organize workshops, hackathons, coding competitions, and tech talks to help students enhance their technical skills and stay updated with the latest technologies.'
          },
          ourMission: {
            title: 'Our Mission',
            description: data.mission || demoData.ourMission.description
          },
          vision: {
            title: 'Our Vision',
            description: data.vision || demoData.vision.description,
            points: demoData.vision.points
          },
          technologies: demoData.technologies,
          milestones: demoData.milestones
        };
        setAboutData(transformedData);
      } else {
        setAboutData(data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      // Set demo data as fallback
      setAboutData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const demoData = {
    whoWeAre: {
      title: 'Who We Are',
      description: 'Bodh Script Club is a vibrant community of tech enthusiasts, developers, and innovators dedicated to fostering a culture of learning and collaboration. We bring together passionate students who share a common goal: to excel in technology and create meaningful impact.'
    },
    whatWeDo: {
      title: 'What We Do',
      description: 'We organize workshops, hackathons, coding competitions, and tech talks to help students enhance their technical skills and stay updated with the latest technologies. Our hands-on approach ensures practical learning and real-world project experience.'
    },
    ourMission: {
      title: 'Our Mission',
      description: 'To empower students with cutting-edge technical knowledge and practical skills, preparing them for successful careers in the tech industry. We believe in learning by doing and creating opportunities for every member to grow.'
    },
    vision: {
      title: 'Our Vision',
      description: 'To become the leading tech community on campus, inspiring innovation and creating future tech leaders who will shape the digital world.',
      points: [
        { text: 'Foster a culture of continuous learning and innovation' },
        { text: 'Bridge the gap between academic knowledge and industry requirements' },
        { text: 'Create a supportive network of tech professionals and mentors' },
        { text: 'Promote open-source contribution and collaborative development' }
      ]
    },
    technologies: [
      { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', category: 'frontend' },
      { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', category: 'backend' },
      { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', category: 'backend' },
      { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'frontend' },
      { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', category: 'backend' },
      { name: 'TensorFlow', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', category: 'ai-ml' },
      { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'devops' },
      { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', category: 'devops' },
      { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', category: 'frontend' },
      { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', category: 'backend' },
      { name: 'C++', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', category: 'other' },
      { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', category: 'devops' },
    ],
    milestones: [
      { year: '2025', title: 'Founded', description: 'BodhScript Club was established to bring developers together.', order: 1 },
      { year: '2025', title: '10+ Members', description: 'Reached a milestone of 10+ active developers.', order: 2 },
      { year: '2025', title: 'CodeQuest', description: 'Successfully completed the first coding event with 100+ participants', order: 3 }
    ]
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className={`text-2xl font-body ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
      </div>
    );
  }

  const data = aboutData || demoData;

  // Ensure all required properties exist with fallbacks
  const safeData = {
    whoWeAre: data.whoWeAre || demoData.whoWeAre,
    whatWeDo: data.whatWeDo || demoData.whatWeDo,
    ourMission: data.ourMission || demoData.ourMission,
    vision: data.vision || demoData.vision,
    technologies: data.technologies || demoData.technologies,
    milestones: data.milestones || demoData.milestones
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-radial from-neon-purple/10 via-transparent to-transparent'
            : 'bg-gradient-radial from-purple-100/30 via-transparent to-transparent'
        }`}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className={`text-6xl md:text-8xl font-heading font-bold mb-6 animate-float ${
            theme === 'dark' ? 'gradient-text' : 'text-gray-900'
          }`}>
            About Us
          </h1>
          <p className={`text-xl md:text-2xl font-body max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Building the future, one line of code at a time
          </p>
        </div>
      </section>

      {/* First Component - Info Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Who We Are */}
            <div className={`rounded-2xl p-8 border card-hover group ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
            }`}>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users size={32} className="text-white" />
              </div>
              <h2 className={`text-3xl font-heading font-bold mb-4 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                {safeData.whoWeAre.title}
              </h2>
              <p className={`font-body leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {safeData.whoWeAre.description}
              </p>
            </div>

            {/* What We Do */}
            <div className={`rounded-2xl p-8 border card-hover group ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
            }`}>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket size={32} className="text-white" />
              </div>
              <h2 className={`text-3xl font-heading font-bold mb-4 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                {safeData.whatWeDo.title}
              </h2>
              <p className={`font-body leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {safeData.whatWeDo.description}
              </p>
            </div>

            {/* Our Mission */}
            <div className={`rounded-2xl p-8 border card-hover group ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
            }`}>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target size={32} className="text-white" />
              </div>
              <h2 className={`text-3xl font-heading font-bold mb-4 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                {safeData.ourMission.title}
              </h2>
              <p className={`font-body leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {safeData.ourMission.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Second Component - Vision */}
      <section className={`py-20 px-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent'
          : 'bg-gradient-to-b from-transparent via-blue-50 to-transparent'
      }`}>
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-3xl p-12 border relative overflow-hidden ${
            theme === 'dark'
              ? 'glass-effect border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-neon-blue/10' : 'bg-blue-200/30'
            }`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Lightbulb size={40} className="text-white" />
                </div>
                <h2 className={`text-5xl md:text-6xl font-heading font-bold ${
                  theme === 'dark' ? 'gradient-text' : 'text-gray-900'
                }`}>
                  {safeData.vision.title}
                </h2>
              </div>
              
              <p className={`text-xl font-body leading-relaxed mb-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {safeData.vision.description}
              </p>

              {safeData.vision.points && safeData.vision.points.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeData.vision.points.map((point, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-black/30 border-neon-blue/20'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        theme === 'dark' ? 'bg-neon-cyan' : 'bg-blue-600'
                      }`}></div>
                      <p className={`font-body ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{point.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Third Component - Technologies We Explore */}
      {safeData.technologies && safeData.technologies.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-5xl md:text-7xl font-heading font-bold mb-6 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                Technologies We Explore
              </h2>
              <p className={`text-xl font-body max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Mastering the tools that power modern innovation
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {safeData.technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 border card-hover group flex flex-col items-center justify-center gap-4 aspect-square ${
                    theme === 'dark'
                      ? 'glass-effect border-gray-800'
                      : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <LazyImage
                      src={tech.logo}
                      alt={tech.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className={`text-lg font-heading font-bold text-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {tech.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Note Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-5xl md:text-7xl font-heading font-bold mb-6 ${
              theme === 'dark' ? 'gradient-text' : 'text-gray-900'
            }`}>
              Key Note
            </h2>
            <p className={`text-xl font-body ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Words from our esteemed organizers
            </p>
          </div>

          <div className="space-y-8">
            {/* First Organizer - Prof. Anand Kumar Shukla */}
            <div className={`rounded-2xl p-8 md:p-12 border card-hover ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Text Content */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className={`text-3xl md:text-4xl font-heading font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Prof. (Dr.) Anand Kumar Shukla
                  </h3>
                  <p className={`text-xl font-body font-semibold ${
                    theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'
                  }`}>
                    Dean and HOS-SCA
                  </p>
                  <p className={`font-body leading-relaxed text-justify ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    The School of Computer Applications is dedicated to fostering excellence in the education of young minds, equipping them with the skills necessary to devise innovative, technology-driven solutions for societal, industrial, and global challenges. Our industry-oriented curricula are designed to be innovative, incorporating rich pedagogical initiatives such as Bring Your Own Device (BYOD) programs, capstone projects, case studies, and courses taught by industry experts. These initiatives empower students to evolve into the problem-solvers of tomorrow. With various pathways available, from application and product development to advanced studies, we prepare our students to excel as corporate professionals and entrepreneurs.
                  </p>
                </div>

                {/* Image */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative group">
                    <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-neon-blue to-neon-cyan'
                        : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                    }`}></div>
                    <LazyImage
                      src="https://i.ibb.co/ZbjKrkK/Dr-Anand.png"
                      alt="Prof. Anand Kumar Shukla"
                      className={`relative w-full max-w-[300px] h-auto rounded-2xl object-cover border-2 ${
                        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Organizer - Dr. Girish Kumar */}
            <div className={`rounded-2xl p-8 md:p-12 border card-hover ${
              theme === 'dark'
                ? 'glass-effect border-gray-800'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Text Content */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className={`text-3xl md:text-4xl font-heading font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Dr. Girish Kumar
                  </h3>
                  <p className={`text-xl font-body font-semibold ${
                    theme === 'dark' ? 'text-neon-cyan' : 'text-blue-600'
                  }`}>
                    Associate Professor & Organizer
                  </p>
                  <p className={`font-body leading-relaxed text-justify ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Dr. Girish Kumar holds a Ph.D. in Computer Applications, along with a PGDCA and an MIT, and is currently serving as an Associate Professor at Lovely Professional University. With over 23 years of teaching and research experience in the field of Computer Applications, his core expertise lies in Programming and Software Development, complemented by work in databases, artificial intelligence, networking, and cybersecurity. He has made notable contributions through 24 patents, 10 books in four languages, and over 40 research papers published in reputable national and international journals and conferences, as well as four books by leading publishers. He is also a Certified Academic Associate (IBM-DB2) and an active member of the International Association of Engineers (IAENG).
                  </p>
                </div>

                {/* Image */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative group">
                    <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                        : 'bg-gradient-to-r from-purple-400 to-pink-400'
                    }`}></div>
                    <LazyImage
                      src="https://i.ibb.co/MDrCF9yk/Dr-Girish.png"
                      alt="Dr. Girish Kumar"
                      className={`relative w-full max-w-[300px] h-auto rounded-2xl object-cover border-2 ${
                        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      {safeData.milestones && safeData.milestones.length > 0 && (
        <section className={`py-20 px-4 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent'
            : 'bg-gradient-to-b from-transparent via-purple-50 to-transparent'
        }`}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-5xl md:text-7xl font-heading font-bold mb-6 flex items-center justify-center gap-4 ${
                theme === 'dark' ? 'gradient-text' : 'text-gray-900'
              }`}>
                Our Achievements
              </h2>
              <p className={`text-xl font-body ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Milestones that define our journey
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-neon-blue via-neon-purple to-neon-pink'
                  : 'bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500'
              }`}></div>

              {/* Timeline Items */}
              <div className="space-y-12">
                {safeData.milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-8 ${
                      idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className={`rounded-2xl p-6 border card-hover inline-block ${
                        theme === 'dark'
                          ? 'glass-effect border-gray-800'
                          : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
                      }`}>
                        <h3 className={`text-2xl font-heading font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </h3>
                        <p className={`font-body mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {milestone.description}
                        </p>
                        <span className={`font-mono text-sm font-bold ${
                          theme === 'dark' ? 'text-neon-purple' : 'text-purple-600'
                        }`}>
                          {milestone.year}
                        </span>
                      </div>
                    </div>

                    {/* Center Dot */}
                    <div className="relative z-10">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 shadow-lg ${
                        theme === 'dark'
                          ? 'border-black shadow-neon-blue/50'
                          : 'border-white shadow-blue-500/50'
                      }`}></div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default About;
