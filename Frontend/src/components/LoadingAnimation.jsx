import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingAnimation({ onComplete, waitForSignal = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const steps = [
    "AI Agents Searching Database...",
    "Analyzing Credit Profiles...",
    "Matching Card Features...",
    "Generating Recommendations...",
    "Search & Analysis Complete!"
  ];

  useEffect(() => {
    // Only reset state if we haven't reached the end yet
    if (!hasReachedEnd) {
      setCurrentStep(0);
      setIsComplete(false);
      setCanFinish(false);
    }
    
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsComplete(true);
          setHasReachedEnd(true);
          
          // If we need to wait for a signal, don't call onComplete yet
          if (waitForSignal && !canFinish) {
            console.log("⏳ Loading animation complete, waiting for API signal...");
            return prev;
          }
          
          // Otherwise, proceed normally
          setTimeout(() => {
            onComplete();
          }, 1500);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onComplete, waitForSignal, canFinish, hasReachedEnd]);

  // Listen for the signal that API calls are complete
  useEffect(() => {
    if (isComplete && canFinish) {
      console.log("✅ API signal received, completing loading animation...");
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [isComplete, canFinish, onComplete]);

  // Function to signal that API calls are complete
  const signalComplete = () => {
    console.log("🚀 Signaling API completion to loading animation...");
    setCanFinish(true);
  };

  // Expose the signal function to parent component
  useEffect(() => {
    if (window.signalLoadingComplete) {
      window.signalLoadingComplete = signalComplete;
    } else {
      window.signalLoadingComplete = signalComplete;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2">
            Credit Card <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">Finder</span>
          </h1>
          <p className="text-gray-400 font-light">Processing your profile...</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl shadow-2xl p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Processing</span>
              <span>{currentStep + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Loading Content */}
          <div className="text-center">
            {/* AI Agents Animation */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-900/30 border border-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Current Step Text */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-xl font-light text-white leading-relaxed mb-4">
                {steps[currentStep]}
              </h2>
              
              {/* Step-specific animations */}
              {currentStep === 0 && (
                <motion.div
                  animate={{ 
                    x: [-10, 10, -10],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex justify-center space-x-2"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </motion.div>
              )}
              
              {currentStep === 1 && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto opacity-60"
                />
              )}
              
              {currentStep === 2 && (
                <motion.div
                  animate={{ 
                    rotateY: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto opacity-60"
                />
              )}
              
              {currentStep === 3 && (
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto opacity-60"
                />
              )}
              
              {currentStep === 4 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.div>

            {/* Loading Dots */}
            {!isComplete && (
              <div className="flex justify-center space-x-2">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 font-light">
            Please wait while we analyze your profile...
          </p>
        </div>
      </div>
    </div>
  );
} 