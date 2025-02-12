const courses = {
    "Data Analysis": {
        Beginner: [
            { name: "Intro to Data Analysis", duration: 2 },
            { name: "Excel for Data Analysis", duration: 2 },
            { name: "SQL Basics", duration: 2 }
        ],
        Intermediate: [
            { name: "Python for Data Science", duration: 3 },
            { name: "Advanced Excel Techniques", duration: 3 }
        ],
        Advanced: [
            { name: "Machine Learning Fundamentals", duration: 4 },
            { name: "Deep Dive into SQL", duration: 3 }
        ],
        Expert: [
            { name: "Big Data Processing with Spark", duration: 5 },
            { name: "Advanced Machine Learning", duration: 4 }
        ]
    },
    "Web Development": {
        Beginner: [
            { name: "HTML & CSS Basics", duration: 2 },
            { name: "JavaScript Fundamentals", duration: 3 }
        ],
        Intermediate: [
            { name: "React.js Basics", duration: 4 },
            { name: "Node.js and Express", duration: 4 }
        ],
        Advanced: [
            { name: "Full-Stack Web Development", duration: 6 }
        ],
        Expert: [
            { name: "Building Scalable Web Apps", duration: 5 }
        ]
    }
};

async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput.trim()) return;

    const chatBox = document.getElementById("chatBox");

    // Add User Message
    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.innerText = userInput;
    chatBox.appendChild(userMessage);

    // Scroll to Bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clear Input
    document.getElementById("userInput").value = "";

    // Show Bot Thinking
    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerText = "Thinking...";
    chatBox.appendChild(botMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Send Request to Server
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        botMessage.innerText = data.reply || "I couldn't understand that.";

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        botMessage.innerText = "Error: Unable to connect to server.";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chatBox");

    addBotMessage(`
        <span class="bot-icon">🤖</span> 
        <span class="bot-text">
            Hello, I am Zaneta! I will ask a few questions to get to know you better so that I can understand your goals and recommend courses and create a personalized schedule!<br><br>
            May I know what do you wish to achieve from learning programming?
        </span>
    `);
});

// Store user responses
const userResponses = {
    programmingObjective: null,
    skillLevel: null,
    timeframe: null
};

function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    addUserMessage(userInput);
    document.getElementById("userInput").value = "";

    // Save User Response Based on Conversation Flow
    if (!userResponses.programmingObjective) {
        userResponses.programmingObjective = userInput;
        setTimeout(() => askSkillLevel(), 1000);
    } else if (!userResponses.skillLevel) {
        userResponses.skillLevel = userInput;
        setTimeout(() => askTimeframe(), 1000);
    } else if (!userResponses.timeframe) {
        userResponses.timeframe = userInput;
        setTimeout(() => generateCoursePlan(), 1000);
    }
}

function askSkillLevel() {
    addBotMessage(`
        <span class="bot-text">I see! What is your proficiency level in ${userResponses.programmingObjective}? Please select one:</span>
        <div class="button-container">
            <button onclick="selectSkillLevel('Beginner')">Beginner</button>
            <button onclick="selectSkillLevel('Intermediate')">Intermediate</button>
            <button onclick="selectSkillLevel('Advanced')">Advanced</button>
            <button onclick="selectSkillLevel('Expert')">Expert</button>
        </div>
    `);
}

function selectSkillLevel(level) {
    addUserMessage(level);
    userResponses.skillLevel = level;
    setTimeout(() => askTimeframe(), 1000);
}

function askTimeframe() {
    addBotMessage(`
        <span class="bot-text">Great! How long do you plan to complete these courses?</span>
        <div class="button-container">
            <button onclick="selectTimeframe('4')">1 Month</button>
            <button onclick="selectTimeframe('8')">2 Months</button>
            <button onclick="selectTimeframe('12')">3 Months</button>
        </div>
    `);
}

function selectTimeframe(time) {
    addUserMessage(`${time} weeks`);
    userResponses.timeframe = time;
    setTimeout(() => generateCoursePlan(), 1000);
}

function generateCoursePlan() {
    addBotMessage("Analyzing your responses and generating your learning plan...");

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Generate course recommendations", context: userResponses })
    })
    .then(response => response.json())
    .then(data => addBotMessage(data.reply))
    .catch(error => addBotMessage("Error: Unable to fetch recommendations."));
}

function addUserMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.innerText = message;
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerHTML = message;
    chatBox.appendChild(botMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}
