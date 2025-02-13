async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    addUserMessage(userInput);
    document.getElementById("userInput").value = "";

    // Show bot thinking message
    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerText = "Thinking...";
    document.getElementById("chatBox").appendChild(botMessage);
    
    try {
        // Step 1: Validate User Input
        const validationResponse = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput, validateOnly: true })
        });

        const validationData = await validationResponse.json();
        const isValid = validationData.validation === "Valid";

        if (!isValid) {
            botMessage.innerText = "I didn't understand that. Could you please rephrase your response?";
            return;
        }

        // Step 2: Proceed with Conversation
        if (!userResponses.programmingObjective) {
            userResponses.programmingObjective = userInput;
            setTimeout(() => askSkillLevel(), 1000);
        } else if (!userResponses.skillLevel) {
            userResponses.skillLevel = userInput;
            setTimeout(() => askTimeframe(), 1000);
        } else if (!userResponses.timeframe) {
            const weeks = userInput.match(/\d+/);
            if (weeks) {
                userResponses.timeframe = weeks[0];
                setTimeout(() => generateCoursePlan(), 1000);
            } else {
                botMessage.innerText = "Please enter a valid number of weeks (e.g. '8').";
            }
        }

    } catch (error) {
        botMessage.innerText = "Error: Unable to connect to server.";
    }
}


// Listen for Enter key in input field
document.getElementById("userInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior
        sendMessage(); // Trigger message sending
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chatBox");

    addBotMessage(`
        <span class="bot-text">
            May I know what is your goal for learning programming?
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
    // First bot message (question)
    addBotMessage(`<span class="bot-text">I see! What is your proficiency level?</span>`);

    // Delay to show the next message separately
    setTimeout(() => {
        addBotMessage(`
            <div class="button-container">
                <button onclick="selectSkillLevel('Beginner')">Beginner</button>
                <button onclick="selectSkillLevel('Intermediate')">Intermediate</button>
                <button onclick="selectSkillLevel('Advanced')">Advanced</button>
                <button onclick="selectSkillLevel('Expert')">Expert</button>
            </div>
        `);
    }, 1000); // 1-second delay for better UX
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

