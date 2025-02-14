document.addEventListener("DOMContentLoaded", function () {
    askProgrammingGoal();
});

const userResponses = {
    programmingObjective: null,
    skillLevel: null,
    timeframe: null
};

// Function to send user input to the server for validation
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
        // Determine the expected type of response
        let expectedAnswerType = determineExpectedAnswerType();

        // Step 1: Validate User Input with the Server
        const validationResponse = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userInput,
                validateOnly: true,
                expectedAnswerType
            })
        });

        const validationData = await validationResponse.json();
        const isValid = validationData.validation === "Valid";

        if (!isValid) {
            botMessage.innerText = "I didn't quite understand that. Could you please clarify your response?";
            return;
        }

        // Step 2: Proceed Based on Conversation Flow
        botMessage.remove(); // Remove "Thinking..." message

        if (!userResponses.programmingObjective) {
            userResponses.programmingObjective = userInput;
            setTimeout(() => askSkillLevel(), 500);
        } else if (!userResponses.skillLevel) {
            userResponses.skillLevel = userInput;
            setTimeout(() => askTimeframe(), 500);
        } else if (!userResponses.timeframe) {
            const weeks = userInput.match(/\d+/);
            if (weeks) {
                userResponses.timeframe = weeks[0];
                setTimeout(() => generateCoursePlan(), 500);
            } else {
                addBotMessage("Please enter a valid number of weeks (e.g., '8 weeks').");
            }
        }

    } catch (error) {
        botMessage.innerText = "Error: Unable to connect to server.";
    }
}

// Function to determine what type of response is expected
function determineExpectedAnswerType() {
    if (!userResponses.programmingObjective) {
        return "programming learning goal (e.g., Web Development, AI, Cybersecurity, Data Science, Data Analytics, Machine Learning)";
    } else if (!userResponses.skillLevel) {
        return "skill level (e.g. Beginner, Intermediate, Advanced, Expert)";
    } else if (!userResponses.timeframe) {
        return "timeframe in weeks (e.g. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)";
    }
}

// Ask for programming goal
function askProgrammingGoal() {
    setTimeout(() => {
        addBotMessage("May I know what is your goal for learning programming?");
        showTextInput(sendMessage);
    }, 500);
}

// Ask for skill level
function askSkillLevel() {
    addBotMessage("What is your current proficiency level in programming?");
    setTimeout(() => {
        addBotMessage(`
            <div class="button-container">
                <button onclick="selectSkillLevel('Beginner')">Beginner</button>
                <button onclick="selectSkillLevel('Intermediate')">Intermediate</button>
                <button onclick="selectSkillLevel('Advanced')">Advanced</button>
                <button onclick="selectSkillLevel('Expert')">Expert</button>
            </div>
        `);
    }, 500);
}

function selectSkillLevel(level) {
    addUserMessage(level);
    userResponses.skillLevel = level;
    setTimeout(() => askTimeframe(), 1000);
}

// Ask for timeframe
function askTimeframe() {
    setTimeout(() => {
        addBotMessage("How long do you plan to complete these courses? (Enter the number of weeks, e.g., '8 weeks')");
    }, 500);
}

// Generate course plan
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

// Show text input for free-text questions
function showTextInput(callbackFunction) {
    const inputContainer = document.getElementById("buttonContainer");
    inputContainer.innerHTML = `
        <input type="text" id="userInput" placeholder="Type your answer here...">
        <button onclick="${callbackFunction.name}()">Send</button>
    `;
}

// Display user message in chat
function addUserMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.innerText = message;
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Display bot message in chat
function addBotMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerHTML = message;
    chatBox.appendChild(botMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for Enter key in text input
document.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && document.getElementById("userInput")) {
        event.preventDefault(); // Prevent default form submission behavior
        sendMessage();
    }
});