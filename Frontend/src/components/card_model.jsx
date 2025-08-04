import React, { useState, useEffect } from 'react';

export function CreditCardModel({ mobile = false, ...props }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsClicked(false);
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div 
      {...props} 
      className={`${mobile ? 'w-72 h-48' : 'w-96 h-64'} rounded-lg shadow-2xl cursor-pointer overflow-hidden relative`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        transform: `perspective(1200px) rotateY(${35 + mousePosition.x * 10}deg) rotateX(${8 + mousePosition.y * 5}deg) scale(${isHovered ? 1.08 : 1}) translateZ(${isHovered ? 40 : 0}px)`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isHovered 
          ? '0 25px 50px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        animation: mobile ? 'rotate3DMobile 4s ease-in-out infinite' : 'rotate3D 4s ease-in-out infinite',
        position: mobile ? 'relative' : 'absolute',
        right: mobile ? 'auto' : '50px',
        top: mobile ? 'auto' : '50%',
        transform: mobile ? 'perspective(1200px) rotateY(35deg) rotateX(8deg)' : 'translateY(-50%) perspective(1200px) rotateY(35deg) rotateX(8deg)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Credit Card Design */}
      <div className={`absolute inset-0 ${mobile ? 'p-6' : 'p-10'} text-white`}>
        <div className={`flex justify-between items-start ${mobile ? 'mb-4' : 'mb-8'}`}>
          <div className={`${mobile ? 'text-lg' : 'text-3xl'} font-light tracking-wider`}>CREDIT CARD</div>
          <div className={`${mobile ? 'w-12 h-8' : 'w-20 h-12'} bg-white/20 rounded`}></div>
        </div>
        
        <div className={`${mobile ? 'mb-4' : 'mb-8'}`}>
          <div className={`${mobile ? 'text-xs' : 'text-base'} font-light opacity-70 ${mobile ? 'mb-2' : 'mb-4'} tracking-wide`}>Card Number</div>
          <div className={`${mobile ? 'text-sm' : 'text-xl'} font-mono font-light tracking-widest`}>**** **** **** 1234</div>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <div className={`${mobile ? 'text-xs' : 'text-base'} font-light opacity-70 ${mobile ? 'mb-1' : 'mb-2'} tracking-wide`}>Card Holder</div>
            <div className={`${mobile ? 'text-sm' : 'text-lg'} font-light tracking-wide`}>JOHN DOE</div>
          </div>
          <div>
            <div className={`${mobile ? 'text-xs' : 'text-base'} font-light opacity-70 ${mobile ? 'mb-1' : 'mb-2'} tracking-wide`}>Expires</div>
            <div className={`${mobile ? 'text-sm' : 'text-lg'} font-light tracking-wide`}>12/25</div>
          </div>
        </div>
      </div>

      {/* Interactive Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />
      )}
      
      {/* Click Effect */}
      {isClicked && (
        <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />
      )}

      {/* Shine Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          transform: `translateX(${mousePosition.x * 100}px)`,
        }}
      />

      {/* CSS Animation for faster 3D rotation - shifted even more to the left */}
      <style jsx>{`
        @keyframes rotate3D {
          0% {
            transform: translateY(-50%) perspective(1200px) rotateY(-50deg) rotateX(8deg) scale(1);
          }
          20% {
            transform: translateY(-50%) perspective(1200px) rotateY(-35deg) rotateX(12deg) scale(1.03);
          }
          40% {
            transform: translateY(-50%) perspective(1200px) rotateY(-20deg) rotateX(6deg) scale(1);
          }
          60% {
            transform: translateY(-50%) perspective(1200px) rotateY(-5deg) rotateX(10deg) scale(1.03);
          }
          80% {
            transform: translateY(-50%) perspective(1200px) rotateY(10deg) rotateX(8deg) scale(1);
          }
          100% {
            transform: translateY(-50%) perspective(1200px) rotateY(-50deg) rotateX(8deg) scale(1);
          }
        }
        
        @keyframes rotate3DMobile {
          0% {
            transform: perspective(1200px) rotateY(-30deg) rotateX(8deg) scale(1);
          }
          20% {
            transform: perspective(1200px) rotateY(-20deg) rotateX(12deg) scale(1.02);
          }
          40% {
            transform: perspective(1200px) rotateY(-10deg) rotateX(6deg) scale(1);
          }
          60% {
            transform: perspective(1200px) rotateY(0deg) rotateX(10deg) scale(1.02);
          }
          80% {
            transform: perspective(1200px) rotateY(10deg) rotateX(8deg) scale(1);
          }
          100% {
            transform: perspective(1200px) rotateY(-30deg) rotateX(8deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
