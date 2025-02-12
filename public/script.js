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
        <span class="bot-text">I see! What is your proficiency? Please select one:</span>
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
        <span class="bot-text">
            Great! How long do you plan to complete these courses? (Enter the number of weeks, e.g., "8 weeks")
        </span>
    `);
}

function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    addUserMessage(userInput);
    document.getElementById("userInput").value = "";

    // Check conversation stage
    if (!userResponses.programmingObjective) {
        userResponses.programmingObjective = userInput;
        setTimeout(() => askSkillLevel(), 1000);
    } else if (!userResponses.skillLevel) {
        userResponses.skillLevel = userInput;
        setTimeout(() => askTimeframe(), 1000);
    } else if (!userResponses.timeframe) {
        // Validate if user input is a number (for weeks)
        const weeks = userInput.match(/\d+/); // Extract number from input
        if (weeks) {
            userResponses.timeframe = weeks[0]; // Store only the number of weeks
            setTimeout(() => generateCoursePlan(), 1000);
        } else {
            addBotMessage("Please enter a valid number of weeks (e.g., '8 weeks').");
        }
    }
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

function printChat() {
    let chatContent = document.getElementById("chatBox").innerHTML;
    let printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Chatbot Conversation</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bot-message { background: #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 5px; }
                .user-message { background: #6a11cb; color: white; padding: 10px; margin: 5px 0; border-radius: 5px; text-align: right; }
            </style>
        </head>
        <body>
            <h2>Chatbot Conversation</h2>
            ${chatContent}
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
