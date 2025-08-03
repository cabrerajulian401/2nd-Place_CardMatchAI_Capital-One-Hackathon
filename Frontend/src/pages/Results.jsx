import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState("");
  const [parsedCards, setParsedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Results page loaded");
    console.log(" Location state:", location.state);
    
    // Get recommendations from location state or localStorage
    const storedRecommendations = localStorage.getItem("creditCardRecommendations");
    console.log("💾 Stored recommendations from localStorage:", storedRecommendations);
    
    // Check if the stored recommendations are valid (not empty or just whitespace)
    const isValidRecommendations = storedRecommendations && storedRecommendations.trim().length > 0;
    const isValidLocationState = location.state?.recommendations && location.state.recommendations.trim().length > 0;
    
    if (isValidLocationState) {
              console.log("Using recommendations from location state");
      setRecommendations(location.state.recommendations);
      parseRecommendations(location.state.recommendations);
      setIsLoading(false);
    } else if (isValidRecommendations) {
              console.log("Using recommendations from localStorage");
      setRecommendations(storedRecommendations);
      parseRecommendations(storedRecommendations);
      setIsLoading(false);
    } else {
              console.log("No valid recommendations found, clearing localStorage and redirecting to questionnaire");
      // Clear any stale data
      localStorage.removeItem("creditCardRecommendations");
      localStorage.removeItem("conversationSummary");
      navigate("/questionnaire");
    }
  }, [location.state, navigate]);

  const parseRecommendations = (text) => {
          console.log("Parsing recommendations text:", text);
    console.log(" Text length:", text.length);
    
    const cards = [];
    
    // Split by numbered items (1., 2., 3.)
    const cardBlocks = text.split(/(?=\d+\.\s+\*\*)/).filter(block => block.trim());
    console.log(" Found card blocks:", cardBlocks.length);
    
    cardBlocks.forEach((block, index) => {
              console.log(`Processing block ${index + 1}:`, block.substring(0, 200) + "...");
      
      const lines = block.split('\n').filter(line => line.trim());
      
      // Extract card name (first line after the number)
      const nameMatch = block.match(/\*\*([^*]+)\*\*/);
      const cardName = nameMatch ? nameMatch[1].trim() : '';
      
      console.log(` New card found: ${cardName}`);
      
      if (!cardName) {
                  console.log("No card name found in block");
        return;
      }
      
      const card = {
        id: index + 1,
        name: cardName,
        details: [],
        reasoning: ""
      };
      
      let inReasoning = false;
      let reasoningText = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and the card name line
        if (!line || line.includes(cardName)) {
          continue;
        }
        
        console.log(`Line ${i}: "${line}"`);
        
        // Check if we're entering reasoning section - "**Reasoning** information"
        if (line.startsWith('**Reasoning**')) {
          inReasoning = true;
          reasoningText = line.replace('**Reasoning**', '').trim();
          console.log(`🧠 Found reasoning start: "${reasoningText}"`);
          continue;
        }
        
        // If we're in reasoning, collect all lines
        if (inReasoning) {
          reasoningText += ' ' + line;
          console.log(` Extended reasoning: "${line}"`);
          continue;
        }
        
        // Parse card details - "- **attribute:** information" format
        const detailMatch = line.match(/-\s*\*\*([^:]+):\*\*\s*(.+)/);
        if (detailMatch) {
          const [_, key, value] = detailMatch;
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();
          
          if (trimmedValue && trimmedValue !== '') {
            card.details.push({
              key: trimmedKey,
              value: trimmedValue
            });
            console.log(`Added detail: ${trimmedKey} = ${trimmedValue}`);
          }
        }
        
        // Also check for regular bold format without bullet: "**attribute:** information"
        const boldMatch = line.match(/\*\*([^:]+):\*\*\s*(.+)/);
        if (boldMatch && !line.startsWith('-') && !line.startsWith('**Reasoning**')) {
          const [_, key, value] = boldMatch;
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();
          
          if (trimmedValue && trimmedValue !== '') {
            card.details.push({
              key: trimmedKey,
              value: trimmedValue
            });
            console.log(`Added bold detail: ${trimmedKey} = ${trimmedValue}`);
          }
        }
      }
      
      // Add reasoning if found
      if (reasoningText) {
        card.reasoning = reasoningText.trim();
                    console.log(`Added reasoning: ${reasoningText.trim()}`);
      }
      
              console.log(`Adding card:`, card);
      cards.push(card);
    });
    
    console.log(" Final parsed cards:", cards);
          console.log("Number of cards found:", cards.length);
    
    setParsedCards(cards);
  };

  const handleStartOver = () => {
            console.log("Starting over - clearing localStorage and navigating to questionnaire");
    localStorage.removeItem("creditCardRecommendations");
    localStorage.removeItem("conversationSummary");
    navigate("/questionnaire");
  };

  const handleGoHome = () => {
    console.log("🏠 Going home - clearing localStorage and navigating to landing page");
    localStorage.removeItem("creditCardRecommendations");
    localStorage.removeItem("conversationSummary");
    navigate("/");
  };

  if (isLoading) {
    console.log(" Results page is loading...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-light">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

      console.log("Rendering results with parsed cards:", parsedCards);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-light text-white mb-2">
              Your Personalized <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">Credit Cards</span>
            </h1>
            <p className="text-gray-400 font-light max-w-2xl mx-auto">
              Based on your responses, here are the credit cards that best match your lifestyle and financial goals.
            </p>
          </motion.div>

          {/* Cards Grid */}
          {parsedCards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {parsedCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-light leading-tight">{card.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold">#{card.id}</div>
                        <div className="text-xs opacity-90 font-light">Top Pick</div>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 font-light">Recommended for your profile</p>
                  </div>

                  {/* Card Details */}
                  <div className="p-6">
                    {card.details.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {card.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="py-2 border-b border-gray-700 last:border-b-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-light text-purple-400 flex-shrink-0 mr-4">{detail.key}</span>
                            </div>
                            <div className="text-sm text-gray-200 font-light leading-relaxed">
                              {detail.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-light">Loading card details...</p>
                      </div>
                    )}

                    {/* Reasoning */}
                    {card.reasoning && (
                      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2 font-light">Why This Card?</h4>
                        <p className="text-sm text-blue-200 leading-relaxed font-light">{card.reasoning}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Fallback: Show raw text if parsing failed */}
          {parsedCards.length === 0 && recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-8 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-4 font-light">Your Recommendations</h3>
              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-700">
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-light">
                    {recommendations}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <button
              onClick={handleStartOver}
              className="px-8 py-3 border border-white text-white rounded-xl hover:bg-gray-200 hover:text-black transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Over
            </button>
            <button
              onClick={handleGoHome}
              className="px-8 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Go Home
            </button>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-300 font-light">Important Information</span>
              </div>
              <p className="text-sm text-gray-400 mb-2 font-light">
                Always read the full terms and conditions before applying for any credit card.
              </p>
              <p className="text-sm text-gray-400 font-light">
                Recommendations are based on your provided information and may vary based on your actual credit profile.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 