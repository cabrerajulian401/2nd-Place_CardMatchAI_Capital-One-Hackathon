import { useState } from "react";
import { startConversation, sendChat } from "../api/agent";

export default function ConnectionTest() {
  const [status, setStatus] = useState("Testing connection...");
  const [sessionId, setSessionId] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [response, setResponse] = useState("");

  const testConnection = async () => {
    try {
      setStatus("Starting conversation...");
      const data = await startConversation();
      setSessionId(data.session_id);
      setStatus(`✅ Connected! Session ID: ${data.session_id}`);
      setResponse(data.initial_question);
    } catch (error) {
      setStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  const sendTestMessage = async () => {
    if (!sessionId || !testMessage.trim()) return;
    
    try {
      setStatus("Sending message...");
      const res = await sendChat(sessionId, testMessage);
      setResponse(res.response);
      setStatus(`✅ Message sent! Complete: ${res.is_complete}`);
    } catch (error) {
      setStatus(`❌ Message failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">🔗 Backend Connection Test</h2>
      
      <div className="mb-4">
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">{status}</p>
      </div>
      
      {sessionId && (
        <div className="mb-4">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a test message..."
            className="w-full px-3 py-2 border rounded"
          />
          <button
            onClick={sendTestMessage}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Send Message
          </button>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Response:</h3>
          <p className="text-sm">{response}</p>
        </div>
      )}
    </div>
  );
} 