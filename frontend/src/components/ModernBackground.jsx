import React, { useState, useEffect } from 'react';

const ModernBackground = ({ children }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden transition-colors duration-300"
         style={{ background: isDark
           ? 'linear-gradient(145deg, #0f172a 0%, #1a1f35 40%, #141c2e 100%)'
           : 'linear-gradient(145deg, #f0f4ff 0%, #f5f0ff 40%, #f0f7ff 100%)'
         }}>

      {/* Floating blobs — large ambient glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top-left Cyan blob */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(8,145,178,0.04) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(8,145,178,0.06) 50%, transparent 75%)',
            filter: 'blur(60px)',
            opacity: isDark ? 0.4 : 0.4,
            animationDelay: '0s',
          }}
        />
        {/* Right-center Emerald blob */}
        <div
          className="absolute top-[15%] -right-[8%] w-[55%] h-[70%] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.03) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.05) 50%, transparent 75%)',
            filter: 'blur(80px)',
            opacity: isDark ? 0.35 : 0.35,
            animationDelay: '-7s',
          }}
        />
        {/* Bottom-center Slate blob */}
        <div
          className="absolute -bottom-[10%] left-[20%] w-[60%] h-[55%] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(71,85,105,0.1) 0%, rgba(51,65,85,0.05) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(71,85,105,0.15) 0%, rgba(51,65,85,0.08) 50%, transparent 75%)',
            filter: 'blur(70px)',
            opacity: isDark ? 0.35 : 0.3,
            animationDelay: '-14s',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.03 : 0.015,
            backgroundImage: `
              linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ModernBackground;
