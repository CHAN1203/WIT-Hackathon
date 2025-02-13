require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to extract courses and durations
function extractCoursesAndDurations(text) {
    const courseRegex = /["'](.*?)["']/g;  // Matches text inside quotes
    const durationRegex = /\[(.*?)\]/g;   // Matches text inside square brackets

    let courses = [];
    let durations = [];

    let match;
    
    // Extract courses
    while ((match = courseRegex.exec(text)) !== null) {
        courses.push(match[1]);
    }

    // Extract durations
    while ((match = durationRegex.exec(text)) !== null) {
        durations.push(match[1]);
    }

    return { courses, durations };
}

// Function to store courses in Supabase
async function storeCoursesInSupabase(courses, durations) {

    let courseEntries = courses.map((course, index) => ({
        course_name: course,
        duration: durations[index]
    }));

    // Insert data into Supabase
    const { data, error } = await supabase.from("courses").insert(courseEntries);

    if (error) {
        console.error("Error inserting courses into Supabase:", error);
        return false;
    }

    console.log("✅ Courses successfully stored in Supabase:", data);
    return true;
}

app.post("/chat", async (req, res) => {
    try {
        const { message, context, validateOnly } = req.body;

        if (validateOnly) {
            const validationPrompt = `Does this message make sense in the context of learning programming? 
                Respond with "Valid" if yes, or "Invalid" if not.
                Message: "${message}"`;

            const validationResponse = await axios.post(
                API_URL,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an AI that checks if a user input makes sense." },
                        { role: "user", content: validationPrompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 50
                },
                {
                    headers: {
                        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const aiValidation = validationResponse.data.choices?.[0]?.message?.content.trim() || "Invalid";

            return res.json({ validation: aiValidation.includes("Valid") ? "Valid" : "Invalid" });
        }

        // Generate Course Recommendations
        const prompt = `
            User's Learning Objective: ${context.programmingObjective}
            User's Skill Level: ${context.skillLevel}
            User's Preferred Timeframe: ${context.timeframe} weeks
            Based on this, recommend 3 to 5 Coursera courses within the user's timeframe.
            Always quote the course names, and bracket the duration.
            Answer directly.
        `;

        const response = await axios.post(
            API_URL,
            {
                model: "sonar-pro",
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

        const botReply = response.data.choices?.[0]?.message?.content || "No response from AI";

        console.log("\n🤖 Chatbot Response:\n", botReply, "\n");

        // Extract courses and durations
        const { courses, durations } = extractCoursesAndDurations(botReply);

        console.log(courses,durations);
        // Store in Supabase
        const success = await storeCoursesInSupabase(courses, durations);

        res.json({ reply: botReply, courses, durations, stored: success });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Chatbot running at http://localhost:${PORT}`));
