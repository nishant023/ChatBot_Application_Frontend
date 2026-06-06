// src/services/api.js

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://chatbot-application-backednd.onrender.com";

export const chatAPI = {
  sendMessage: async (message) => {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from server");
    }

    return response.json();
  },
};