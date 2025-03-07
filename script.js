const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

window.addEventListener('load', () => {
    document.getElementById('ai1').click();
});

document.getElementById('ai1').addEventListener('click', function() {
    document.querySelector('.chatbot').classList.add('open');
});

function openNewPage() {
    window.location.href = "popup.html"; 
}

document.getElementById("popupBtn").addEventListener("click", openNewPage);
  
let userMessage = null; 
// Choose one API key based on which service you want to use
const GROQ_API_KEY = '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';
const inputInitHeight = chatInput.scrollHeight;

const aiButtons = document.querySelectorAll(".sidebar a");

aiButtons.forEach(button => {
    button.addEventListener("click", () => document.body.classList.add("show-chatbot"));
});

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    
   
 
    // Option 2: Groq API
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [{role: "user", content: userMessage}],
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
        })
    };
   

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            messageElement.textContent = data.choices[0].message.content.trim();
        })
        .catch((error) => {
            console.error('Error:', error);
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

// Speech recognition setup
let recognition;
let isListening = false;
const micButton = document.createElement('span');
micButton.id = 'mic-btn';
micButton.className = 'material-symbols-rounded';
micButton.textContent = 'mic';
document.querySelector('.chat-input').insertBefore(micButton, sendChatBtn);

// Initialize speech recognition
const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            isListening = true;
            micButton.textContent = 'mic';
            micButton.classList.add('listening');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            
            // Auto-resize the textarea
            chatInput.style.height = `${inputInitHeight}px`;
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        };
        
        recognition.onend = () => {
            isListening = false;
            micButton.textContent = 'mic';
            micButton.classList.remove('listening');
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            micButton.textContent = 'mic';
            micButton.classList.remove('listening');
        };
    } else {
        console.error('Speech recognition not supported in this browser');
        micButton.style.display = 'none';
    }
};

// Toggle speech recognition on mic button click
micButton.addEventListener('click', () => {
    if (!recognition) {
        initSpeechRecognition();
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Initialize speech recognition on page load
document.addEventListener('DOMContentLoaded', initSpeechRecognition);