let currentConversation = null;
let currentUser = null;

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

function openConversation(conversation, clickedItem) {
    currentConversation = conversation;
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display = "block";

    document.getElementById("chatHostName").textContent = conversation.hostName;
    document.getElementById("chatPropertyName").textContent = conversation.propertyTitle;

    loadChatMessages();

    document.querySelectorAll(".conversation-item").forEach(item => {
        item.classList.remove("active");
    });
    if (clickedItem) clickedItem.classList.add("active");
}

function loadChatMessages() {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    if (!currentConversation || !currentConversation.messages) {
        return;
    }

    currentConversation.messages.forEach(msg => {
        const msgEl = document.createElement("div");
        msgEl.className = `message ${msg.sender === currentUser.username ? "sent" : "received"}`;
        const storage = window.AppStorage;
        const escapedText = storage && storage.escapeHtml ? storage.escapeHtml(msg.text) : msg.text;
        msgEl.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapedText}</div>
                <div class="message-time">${msg.timestamp}</div>
            </div>
        `;
        chatMessages.appendChild(msgEl);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message || !currentConversation) {
        return;
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessage = {
        sender: currentUser.username,
        text: message,
        timestamp: timestamp,
        date: new Date().toISOString()
    };

    currentConversation.messages.push(newMessage);

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

    input.value = "";
    autoResizeTextarea();
    loadChatMessages();
}

function closeChatWindow() {
    if (window.innerWidth <= 992) {
        document.getElementById("chatContainer").style.display = "none";
        document.querySelectorAll(".conversation-item").forEach(item => {
            item.classList.remove("active");
        });
    }
}

function openNewMessageModal() {
    const modal = document.getElementById("newMessageModal");
    modal.classList.add("show");

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

    const storage = window.AppStorage;
    const conversations = storage
        ? storage.getLS("conversations", [])
        : JSON.parse(localStorage.getItem("conversations") || "[]");
    const existingConv = conversations.find(
        c => c.userId === currentUser.username && c.propertyId === booking.propertyId
    );

    if (existingConv) {
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

    document.getElementById("newMessageModal").classList.remove("show");
    document.getElementById("bookingSelect").value = "";
    document.getElementById("initialMessage").value = "";

    loadConversations();
    alert("✅ Conversation started!");
}

function setupEventListeners() {
    document.getElementById("newMessageBtn").addEventListener("click", openNewMessageModal);

    document.getElementById("sendBtn").addEventListener("click", sendMessage);

    document.getElementById("messageInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById("messageInput").addEventListener("input", autoResizeTextarea);

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

    document.getElementById("newMessageModal").addEventListener("click", (e) => {
        if (e.target.id === "newMessageModal") {
            e.target.classList.remove("show");
        }
    });

    document.getElementById("startConversationBtn").addEventListener("click", startConversation);
}

function getInitials(name) {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function autoResizeTextarea() {
    const textarea = document.getElementById("messageInput");
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}
