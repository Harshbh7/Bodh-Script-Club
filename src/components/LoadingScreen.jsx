import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';

const LoadingScreen = ({ isLoading, onComplete }) => {
  const loadingRef = useRef(null);
  const logoRef = useRef(null);
  const progressRef = useRef(null);
  const textRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      // Hide loading screen
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      tl.to(progressRef.current, {
        width: '100%',
        duration: 0.5,
        ease: 'power2.out'
      })
      .to(textRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3
      }, '-=0.2')
      .to(logoRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: 'back.in(1.7)'
      }, '-=0.1')
      .to(loadingRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2');

      return;
    }

    // Show loading screen animation
    const tl = gsap.timeline();
    
    tl.fromTo(loadingRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    )
    .fromTo(logoRef.current,
      { 
        scale: 0.5,
        opacity: 0,
        rotationY: 180
      },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 1,
        ease: 'back.out(1.7)'
      }
    )
    .fromTo(textRef.current,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      },
      '-=0.5'
    );

    // Animate progress bar
    gsap.to(progressRef.current, {
      width: '80%',
      duration: 2,
      ease: 'power2.out'
    });

    // Pulsing logo animation
    gsap.to(logoRef.current, {
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div
      ref={loadingRef}
      className={`loading-screen fixed inset-0 z-[10000] flex items-center justify-center ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="text-center">
        {/* Logo */}
        <div
          ref={logoRef}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Bodh Script Club Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className={`text-3xl font-heading font-bold ${
            theme === 'dark' ? 'gradient-text' : 'text-gray-900'
          }`}>
            Bodh Script Club
          </h1>
        </div>

        {/* Loading text */}
        <div ref={textRef} className="mb-8">
          <p className={`text-xl font-body mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading...
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-neon-blue' : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-neon-purple' : 'bg-purple-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-neon-pink' : 'bg-pink-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`w-64 h-1 rounded-full mx-auto overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div
            ref={progressRef}
            className={`h-full rounded-full ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
            }`}
            style={{ width: '0%' }}
          ></div>
        </div>

        {/* Loading percentage */}
        <p className={`text-sm font-mono mt-4 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Initializing Components...
        </p>
      </div>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full opacity-30 ${
              theme === 'dark' ? 'bg-neon-cyan' : 'bg-blue-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;