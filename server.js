require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, "public")));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            API_URL,
            {
                model: "sonar-pro", // Updated model
                messages: [
                    { role: "system", content: "You are a friendly chatbot. Keep responses short and conversational." },
                    { role: "user", content: message }
                ],
                temperature: 0.7, // Adjust for randomness
                max_tokens: 150   // Limit response length
            },
            {
                headers: {
                    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ reply: response.data.choices?.[0]?.message?.content || "No response from AI" });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Chatbot running at http://localhost:${PORT}`));
