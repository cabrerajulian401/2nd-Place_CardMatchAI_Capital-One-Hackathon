const BASE_URL = "http://localhost:8000"; // Updated to use port 3001

export async function startConversation() {
  try {
    console.log("Starting conversation with backend...");
    const res = await fetch(`${BASE_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      throw new Error(`Failed to start conversation: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Conversation started successfully:", data);
    return data;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
}

export async function sendChat(session_id, message) {
  try {
    console.log("Sending message to backend:", { session_id, message });
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, message }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      throw new Error(`Failed to send message: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function submitCompleteProfile(profileData) {
  try {
    console.log("Submitting complete profile to backend:", profileData);
    const res = await fetch(`${BASE_URL}/submit-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      throw new Error(`Failed to submit profile: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Profile submitted successfully:", data);
    return data;
  } catch (error) {
    console.error("Error submitting profile:", error);
    throw error;
  }
}

// Helper function to check backend health
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}
