import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startConversation, sendChat, submitCompleteProfile } from "../api/agent";
import LoadingAnimation from '../components/LoadingAnimation';

export default function Questionnaire() {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [fade, setFade] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [profileData, setProfileData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(false);

  // Question configurations with options
  const questionConfigs = {
    primary_goal: {
      question: "What is your primary goal when using a credit card?",
      options: [
        "Maximizing travel rewards (miles, hotel points)",
        "Earning cash back",
        "Building or rebuilding credit",
        "Financing purchases with a 0% intro APR",
        "Earning benefits with a specific brand/store (e.g. Amazon, Apple, Costco)"
      ],
      multiSelect: false
    },
    top_spend_category: {
      question: "Which spending category do you spend most on each month?",
      options: [
        "Dining & restaurants",
        "Groceries",
        "Gas or transportation",
        "Streaming, entertainment, subscriptions",
        "Online or retail shopping",
        "General purchases spread evenly across categories"
      ],
      multiSelect: false
    },
    brand_preferences: {
      question: "Do you regularly shop or spend with any of the following brands or chains?",
      options: [
        "Amazon",
        "Apple or Apple Pay",
        "Costco",
        "Walmart",
        "Airlines or hotel loyalty programs",
        "Other big-name retailers (e.g. Ulta, Sephora, Best Buy)",
        "None of these"
      ],
      multiSelect: true
    },
    travel_frequency: {
      question: "How often do you travel by air each year?",
      options: [
        "> 10 times",
        "3–10 times",
        "< 3 times or rarely"
      ],
      multiSelect: false
    },
    monthly_spending: {
      question: "Approximately how much do you charge on credit cards per month?",
      options: [
        "< $500",
        "$500–$1,000",
        "$1,000–$3,000",
        "> $3,000"
      ],
      multiSelect: false
    },
    payment_behavior: {
      question: "Do you typically pay your balance in full each month, or carry a balance?",
      options: [
        "I usually pay in full (avoid interest)",
        "I often carry a balance (would prefer no-interest intro offers)"
      ],
      multiSelect: false
    },
    income: {
      question: "What is your gross annual income (before taxes)?",
      options: [
        "< $25K",
        "$25K–$50K",
        "$50K–$75K",
        "$75K–$120K",
        "> $120K"
      ],
      multiSelect: false
    },
    credit_score: {
      question: "What is your credit score range?",
      options: [
        "Excellent (740+)",
        "Good (670–739)",
        "Fair (580–669)",
        "Poor (< 580)",
        "I don't know"
      ],
      multiSelect: false
    },
    credit_situation: {
      question: "Which of these best describes your current credit situation?",
      options: [
        "I'm a student with little or no credit history",
        "I'm trying to build or rebuild my credit (e.g., low score, no credit, or recent issues)",
        "Neither — I already have established credit"
      ],
      multiSelect: false
    }
  };

  const questionOrder = [
    'primary_goal',
    'top_spend_category', 
    'brand_preferences',
    'travel_frequency',
    'monthly_spending',
    'payment_behavior',
    'income',
    'credit_score',
    'credit_situation'
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // Clear any previous session data to ensure fresh start
    console.log("Clearing previous session data...");
    localStorage.removeItem("creditCardRecommendations");
    localStorage.removeItem("conversationSummary");
    
    // Reset all state to ensure fresh start
    setSessionId(null);
    setQuestion("");
    setCurrentQuestionType("");
    setSelectedOptions([]);
    setFade(true);
    setIsComplete(false);
    setRecommendations("");
    setIsLoading(false);
    setConversationHistory([]);
    setProfileData({});
    setShowLoading(false);
    setCurrentQuestionIndex(0);
    
    // Start with the first question immediately without backend initialization
    showQuestion(0);
  }, []);

  const showQuestion = (index) => {
    if (index >= questionOrder.length) {
      // All questions completed
      setIsComplete(true);
      return;
    }

    const questionKey = questionOrder[index];
    const config = questionConfigs[questionKey];
    
    setCurrentQuestionIndex(index);
    setCurrentQuestionType(questionKey);
    setQuestion(config.question);
    setSelectedOptions([]);
    setFade(true);
  };

  const handleOptionSelect = (option) => {
    const config = questionConfigs[currentQuestionType];
    
    if (config.multiSelect) {
      // Toggle selection for multi-select
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
    } else {
      // Single selection
      setSelectedOptions([option]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOptions.length === 0 || isLoading) return;

    console.log("User selected options:", selectedOptions);
    setIsLoading(true);
    setFade(false);
    
    // Format answer based on question type
    let answer;
    if (questionConfigs[currentQuestionType].multiSelect) {
      answer = selectedOptions.join(", ");
    } else {
      answer = selectedOptions[0];
    }
    
    // Check if this is the first answer (no sessionId yet)
    const isFirstAnswer = !sessionId;
    
    // Add user's answer to conversation history
    const updatedHistory = [...conversationHistory, { role: "user", content: answer }];
    setConversationHistory(updatedHistory);
    console.log("Updated conversation history:", updatedHistory);
    
    // Check if this is the last question
    const isLastQuestion = currentQuestionIndex === questionOrder.length - 1;
    
    if (isLastQuestion) {
      // For the last question, show loading animation immediately
      console.log("Last question submitted! Showing loading animation immediately...");
      setShowLoading(true);
      
      // Continue with the API call in the background
      setTimeout(async () => {
        try {
          let res;
          
          if (isFirstAnswer) {
            // Start the conversation with the backend for the first answer
            console.log("Starting conversation with backend for first answer...");
            const startData = await startConversation();
            setSessionId(startData.session_id);
            
            // Send the first answer
            console.log("Sending first message to backend...");
            res = await sendChat(startData.session_id, answer);
          } else {
            // For subsequent answers, use existing session
            console.log("Sending final message to backend...");
            res = await sendChat(sessionId, answer);
          }
          
          setIsComplete(res.is_complete);
          
          // Add assistant's response to conversation history
          const newHistory = [...updatedHistory, { role: "assistant", content: res.response }];
          setConversationHistory(newHistory);
          console.log("Received final response from backend:", {
            response: res.response,
            isComplete: res.is_complete,
            sessionId: res.session_id
          });
          
          // Extract profile data from the conversation
          const currentProfileData = extractProfileData(newHistory);
          setProfileData(currentProfileData);
          console.log(" Extracted profile data:", currentProfileData);
          
          // Submit complete profile for recommendations and wait for it to complete
          await submitCompleteProfileAndGetRecommendations(currentProfileData);
          
          // Only after recommendations are ready, allow the loading animation to complete
          console.log("All API calls completed, loading animation can now finish");
          
          // Signal to the loading animation that it can complete
          if (window.signalLoadingComplete) {
            window.signalLoadingComplete();
          }
          
        } catch (error) {
          console.error("Failed to send final message:", error);
          // If there's an error, hide loading and show error
          setShowLoading(false);
          setQuestion("Sorry, there was an error processing your response. Please try again.");
          setFade(true);
          setIsLoading(false);
        }
      }, 300);
    } else {
      // For non-last questions, use asynchronous flow
      setSelectedOptions([]);
      setFade(true);
      
      // Move to next question immediately
      showQuestion(currentQuestionIndex + 1);
      
      // Send message to backend asynchronously (don't wait for response)
      setTimeout(async () => {
        try {
          let res;
          
          if (isFirstAnswer) {
            // Start the conversation with the backend for the first answer
            console.log("Starting conversation with backend for first answer...");
            const startData = await startConversation();
            setSessionId(startData.session_id);
            
            // Send the first answer
            console.log("Sending first message to backend...");
            res = await sendChat(startData.session_id, answer);
          } else {
            // For subsequent answers, use existing session
            console.log("Sending message to backend...");
            res = await sendChat(sessionId, answer);
          }
          
          setIsComplete(res.is_complete);
          
          // Add assistant's response to conversation history
          const newHistory = [...updatedHistory, { role: "assistant", content: res.response }];
          setConversationHistory(newHistory);
          console.log("Received response from backend:", {
            response: res.response,
            isComplete: res.is_complete,
            sessionId: res.session_id
          });
          
          // Extract profile data from the conversation
          const currentProfileData = extractProfileData(newHistory);
          setProfileData(currentProfileData);
          console.log("Extracted profile data:", currentProfileData);
          
          if (res.is_complete) {
            console.log("Conversation complete! Submitting profile for recommendations...");
            await submitCompleteProfileAndGetRecommendations(currentProfileData);
          }
          
        } catch (error) {
          console.error("Failed to send message:", error);
          // Don't show error to user since we've already moved to next question
          // Just log it for debugging
        } finally {
          setIsLoading(false);
        }
      }, 100); // Reduced delay since we're not waiting for response
    }
  };

  const extractProfileData = (history) => {
    console.log("Extracting profile data from conversation history...");
    const profile = {
      session_id: sessionId || "pending",
      primary_goal: "",
      top_spend_category: "",
      brand_preferences: "",
      travel_frequency: "",
      monthly_spending: "",
      payment_behavior: "",
      income: "",
      credit_score: "",
      credit_situation: ""
    };

    // Extract answers from conversation history
    history.forEach((entry, index) => {
      if (entry.role === "user") {
        const answer = entry.content;
        
        // Map based on question order (adjust for first answer)
        const questionIndex = Math.floor(index / 2);
        if (questionIndex < questionOrder.length) {
          const fieldName = questionOrder[questionIndex];
          profile[fieldName] = answer;
          console.log(`Mapped to ${fieldName}:`, answer);
        }
      }
    });

    console.log(" Final extracted profile:", profile);
    return profile;
  };

  const submitCompleteProfileAndGetRecommendations = async (profileData) => {
    try {
      console.log("Submitting complete profile to backend:", profileData);
      
      const res = await submitCompleteProfile(profileData);
              console.log("Received recommendations from backend:", {
        response: res.response,
        sessionId: res.session_id,
        isComplete: res.is_complete,
        conversationSummary: res.conversation_summary
      });
      
      // Store recommendations in localStorage for the Results page
      localStorage.setItem("creditCardRecommendations", res.response);
      if (res.conversation_summary) {
        localStorage.setItem("conversationSummary", JSON.stringify(res.conversation_summary));
      }
      console.log("💾 Stored recommendations in localStorage");
      
      // Store recommendations in component state for navigation
      setRecommendations(res.response);
      
      // Loading animation is already shown, so we don't need to set it again
              console.log("Loading animation already active, waiting for completion...");
      
    } catch (error) {
      console.error(" Failed to submit complete profile:", error);
      // If there's an error, hide loading and show error
      setShowLoading(false);
      setQuestion("Sorry, there was an error getting your recommendations. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    console.log("Loading complete, navigating to results...");
    
    // Get recommendations from component state or localStorage as fallback
    const recommendationsToPass = recommendations || localStorage.getItem("creditCardRecommendations");
    const conversationSummaryToPass = localStorage.getItem("conversationSummary");
    
    console.log("📤 Passing recommendations to results:", {
      recommendations: recommendationsToPass ? "Present" : "Missing",
      conversationSummary: conversationSummaryToPass ? "Present" : "Missing"
    });
    
    navigate("/results", { 
      state: { 
        recommendations: recommendationsToPass,
        conversationSummary: conversationSummaryToPass
      }
    });
  };

  // Show loading animation if active
  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} waitForSignal={true} />;
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questionOrder.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2">
            CardMatch <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-400 font-light">Let's find your perfect match</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl shadow-2xl p-8 transition-all duration-300"
             style={{ opacity: fade ? 1 : 0.7 }}>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {questionOrder.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {isComplete && recommendations ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-900/50 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Analysis Complete!</h2>
                <p className="text-gray-400">Preparing your recommendations...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Question */}
              <div className="mb-6">
                <h2 className="text-xl font-light text-white leading-relaxed mb-4">
                  {question}
                </h2>
                
                {/* Options */}
                <div className="space-y-3">
                  {questionConfigs[currentQuestionType]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        selectedOptions.includes(option)
                          ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                          : 'border-gray-600 bg-blue-900/20 hover:border-blue-500 hover:bg-blue-800/30 text-gray-200'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          questionConfigs[currentQuestionType]?.multiSelect
                            ? 'border-gray-400' // Checkbox style
                            : 'border-gray-400' // Radio style
                        }`}>
                          {selectedOptions.includes(option) && (
                            <div className={`w-2 h-2 rounded-full mx-auto mt-0.5 ${
                              questionConfigs[currentQuestionType]?.multiSelect
                                ? 'bg-blue-400' // Checkbox
                                : 'bg-blue-400' // Radio
                            }`}></div>
                          )}
                        </div>
                        <span className="font-light">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              {!isComplete && (
                <button
                  onClick={handleSubmit}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                    isLoading || selectedOptions.length === 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'border border-white text-white hover:bg-gray-200 hover:text-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                  disabled={isLoading || selectedOptions.length === 0}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    selectedOptions.length === 0 ? 'Select an option' : 'Continue'
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 font-light">
            Your data is secure and will only be used for recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
