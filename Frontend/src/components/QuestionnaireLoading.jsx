import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { startConversation } from '../api/agent';

export default function QuestionnaireLoading() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const steps = [
    "Initializing AI System...",
    "Loading Credit Card Database...",
    "Preparing Questionnaire...",
    "Setting Up Conversation...",
    "Ready to Start!"
  ];

  useEffect(() => {
    const initializeQuestionnaire = async () => {
      try {
        // Step 1: Initialize AI System
        setCurrentStep(0);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Loading Credit Card Database
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Step 3: Preparing Questionnaire
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 4: Setting Up Conversation
        setCurrentStep(3);
        console.log("Starting conversation with backend...");
        const data = await startConversation();
        setSessionData(data);
        console.log("Conversation started successfully:", data);
        
        // Step 5: Ready to Start
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setIsComplete(true);
        
        // Navigate to questionnaire with session data
        setTimeout(() => {
          navigate("/questionnaire", { 
            state: { 
              preInitializedSession: data,
              sessionId: data.session_id,
              initialQuestion: data.initial_question
            }
          });
        }, 800);
        
      } catch (error) {
        console.error(" Failed to initialize questionnaire:", error);
        setError(error.message);
      }
    };

    initializeQuestionnaire();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-2">
              CardMatch <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-gray-400 font-light">Something went wrong</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-red-800 rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-900/50 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2">
            CardMatch <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-400 font-light">Loading up questionnaire...</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl shadow-2xl p-8">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Initializing</span>
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
            {/* AI System Animation */}
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
            Preparing your personalized questionnaire...
          </p>
        </div>
      </div>
    </div>
  );
} 