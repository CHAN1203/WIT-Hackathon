require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

app.post("/chat", async (req, res) => {
    try {
        const { message, context } = req.body;

        // Construct AI Prompt Using User Data
        const prompt = `
            User's Learning Objective: ${context.programmingObjective}
            User's Skill Level: ${context.skillLevel}
            User's Preferred Timeframe: ${context.timeframe} weeks

            Based on this, recommend the best programming courses and create a structured learning timeline.
            The response should include:
            1. A list of courses with brief descriptions
            2. A study plan split into weeks
            3. Keep the response short and structured.
        `;

        const response = await axios.post(
            API_URL,
            {
                model: "sonar-pro", // Optimized for structured responses
                messages: [
                    { role: "system", content: "You are a helpful AI that suggests learning paths based on user goals." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 300
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
