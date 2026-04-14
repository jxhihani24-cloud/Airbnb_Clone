// ===== GLOBAL VARIABLES =====
let currentConversation = null;
let currentUser = null;

// ===== INITIALIZE PAGE =====
document.addEventListener("DOMContentLoaded", () => {
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
        alert("Please log in to view messages.");
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    
    loadConversations();
    setupEventListeners();
});

// ===== LOAD CONVERSATIONS =====
function loadConversations() {
    const storage = window.AppStorage;
    const conversations = storage
        ? storage.getLS("conversations", [])
        : JSON.parse(localStorage.getItem("conversations") || "[]");
    const userConversations = conversations.filter(c => c.userId === currentUser.username);
    
    const conversationsList = document.getElementById("conversationsList");
    const noMsg = document.getElementById("noConversationsMsg");

    if (!userConversations || userConversations.length === 0) {
        conversationsList.innerHTML = "";
        noMsg.style.display = "flex";
        return;
    }

    noMsg.style.display = "none";
    conversationsList.innerHTML = "";

    userConversations.forEach(conversation => {
        const lastMsg = conversation.messages[conversation.messages.length - 1];
        const preview = lastMsg ? lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? "..." : "") : "No messages yet";

        const item = document.createElement("div");
        item.className = "conversation-item";
        item.innerHTML = `
            <div class="conversation-avatar">${getInitials(conversation.hostName)}</div>
            <div class="conversation-info">
                <div class="conversation-name">${conversation.hostName} - ${conversation.propertyTitle}</div>
                <div class="conversation-preview">${preview}</div>
            </div>
        `;

        item.addEventListener("click", (e) => openConversation(conversation, e.currentTarget));
        conversationsList.appendChild(item);
    });
}

// ===== OPEN CONVERSATION =====
function openConversation(conversation, clickedItem) {
    currentConversation = conversation;
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display = "block";

    // Update chat header
    document.getElementById("chatHostName").textContent = conversation.hostName;
    document.getElementById("chatPropertyName").textContent = conversation.propertyTitle;

    // Load messages
    loadChatMessages();

    // Highlight conversation in list
    document.querySelectorAll(".conversation-item").forEach(item => {
        item.classList.remove("active");
    });
    if (clickedItem) clickedItem.classList.add("active");
}

// ===== LOAD CHAT MESSAGES =====
function loadChatMessages() {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    if (!currentConversation || !currentConversation.messages) {
        return;
    }

    currentConversation.messages.forEach(msg => {
        const msgEl = document.createElement("div");
        msgEl.className = `message ${msg.sender === currentUser.username ? "sent" : "received"}`;
        msgEl.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(msg.text)}</div>
                <div class="message-time">${msg.timestamp}</div>
            </div>
        `;
        chatMessages.appendChild(msgEl);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== SEND MESSAGE =====
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message || !currentConversation) {
        return;
    }

    // Add message to conversation
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessage = {
        sender: currentUser.username,
        text: message,
        timestamp: timestamp,
        date: new Date().toISOString()
    };

    currentConversation.messages.push(newMessage);

    // Update in localStorage
    const storage = window.AppStorage;
    const conversations = storage
        ? storage.getLS("conversations", [])
        : JSON.parse(localStorage.getItem("conversations") || "[]");
    const index = conversations.findIndex(c => c.id === currentConversation.id);
    if (index !== -1) {
        conversations[index] = currentConversation;
        if (storage) storage.setLS("conversations", conversations);
        else localStorage.setItem("conversations", JSON.stringify(conversations));
    }

    // Clear input and reload
    input.value = "";
    autoResizeTextarea();
    loadChatMessages();
}

// ===== CLOSE CHAT WINDOW =====
function closeChatWindow() {
    if (window.innerWidth <= 992) {
        document.getElementById("chatContainer").style.display = "none";
        document.querySelectorAll(".conversation-item").forEach(item => {
            item.classList.remove("active");
        });
    }
}

// ===== OPEN NEW MESSAGE MODAL =====
function openNewMessageModal() {
    const modal = document.getElementById("newMessageModal");
    modal.classList.add("show");

    // Load bookings
    const storage = window.AppStorage;
    const user = storage
        ? storage.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser") || "null");
    const bookings = storage
        ? storage.getLS("bookings", [])
        : JSON.parse(localStorage.getItem("bookings") || "[]");
    const userBookings = bookings.filter(b => b.userId === user.username);

    const select = document.getElementById("bookingSelect");
    select.innerHTML = '<option value="" disabled selected hidden>Choose a booking...</option>';

    userBookings.forEach(booking => {
        const option = document.createElement("option");
        option.value = JSON.stringify(booking);
        option.textContent = `${booking.propertyTitle} - ${booking.city}`;
        select.appendChild(option);
    });
}

// ===== START CONVERSATION =====
function startConversation() {
    const select = document.getElementById("bookingSelect");
    const selectedValue = select.value;

    if (!selectedValue) {
        alert("Please select a booking");
        return;
    }

    const booking = JSON.parse(selectedValue);
    const initialMsg = document.getElementById("initialMessage").value.trim();

    if (!initialMsg) {
        alert("Please write an initial message");
        return;
    }

    // Check if conversation already exists
    const storage = window.AppStorage;
    const conversations = storage
        ? storage.getLS("conversations", [])
        : JSON.parse(localStorage.getItem("conversations") || "[]");
    const existingConv = conversations.find(
        c => c.userId === currentUser.username && c.propertyId === booking.propertyId
    );

    if (existingConv) {
        // Add message to existing conversation
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        existingConv.messages.push({
            sender: currentUser.username,
            text: initialMsg,
            timestamp: timestamp,
            date: new Date().toISOString()
        });

        conversations.splice(conversations.indexOf(existingConv), 1);
        conversations.unshift(existingConv);
    } else {
        // Create new conversation
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const newConversation = {
            id: Date.now(),
            userId: currentUser.username,
            propertyId: booking.propertyId,
            hostName: booking.owner,
            propertyTitle: booking.propertyTitle,
            messages: [{
                sender: currentUser.username,
                text: initialMsg,
                timestamp: timestamp,
                date: new Date().toISOString()
            }]
        };

        conversations.unshift(newConversation);
    }

    if (storage) storage.setLS("conversations", conversations);
    else localStorage.setItem("conversations", JSON.stringify(conversations));

    // Close modal
    document.getElementById("newMessageModal").classList.remove("show");
    document.getElementById("bookingSelect").value = "";
    document.getElementById("initialMessage").value = "";

    // Reload conversations
    loadConversations();
    alert("✅ Conversation started!");
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // New message button
    document.getElementById("newMessageBtn").addEventListener("click", openNewMessageModal);

    // Send button
    document.getElementById("sendBtn").addEventListener("click", sendMessage);

    // Enter to send
    document.getElementById("messageInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    document.getElementById("messageInput").addEventListener("input", autoResizeTextarea);

    // Modal close buttons
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".modal-overlay");
            if (modal) {
                modal.classList.remove("show");
                document.getElementById("bookingSelect").value = "";
                document.getElementById("initialMessage").value = "";
            }
        });
    });

    // Modal overlay click
    document.getElementById("newMessageModal").addEventListener("click", (e) => {
        if (e.target.id === "newMessageModal") {
            e.target.classList.remove("show");
        }
    });

    // Start conversation button
    document.getElementById("startConversationBtn").addEventListener("click", startConversation);
}

// ===== HELPER FUNCTIONS =====
function getInitials(name) {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function autoResizeTextarea() {
    const textarea = document.getElementById("messageInput");
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}
