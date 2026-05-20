let currentConversation = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    currentUser = requireLogin();

    if (!currentUser) {
        return;
    }

    await loadConversations();
    setupEventListeners();
});

async function loadConversations() {
    const conversationsList = document.getElementById("conversationsList");
    const noMsg = document.getElementById("noConversationsMsg");

    try {
        const conversations = await apiRequest(`/Messages/mine/${currentUser.id}`);

        conversationsList.innerHTML = "";

        if (!conversations || conversations.length === 0) {
            noMsg.style.display = "flex";
            return;
        }

        noMsg.style.display = "none";

        conversations.forEach(conversation => {
            const item = document.createElement("div");
            item.className = "conversation-item";

            item.innerHTML = `
                <div class="conversation-avatar">${getInitials(conversation.propertyTitle)}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.propertyTitle}</div>
                    <div class="conversation-preview">Open conversation</div>
                </div>
            `;

            item.addEventListener("click", (e) => openConversation(conversation, e.currentTarget));

            conversationsList.appendChild(item);
        });

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function openConversation(conversation, clickedItem) {
    currentConversation = conversation;

    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display = "block";

    document.getElementById("chatHostName").textContent = "Conversation";
    document.getElementById("chatPropertyName").textContent = conversation.propertyTitle;

    await loadChatMessages();

    document.querySelectorAll(".conversation-item").forEach(item => {
        item.classList.remove("active");
    });

    if (clickedItem) {
        clickedItem.classList.add("active");
    }
}

async function loadChatMessages() {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    if (!currentConversation) {
        return;
    }

    try {
        const messages = await apiRequest(`/Messages/conversation/${currentConversation.id}`);

        messages.forEach(msg => {
            const msgEl = document.createElement("div");

            msgEl.className = `message ${msg.senderId === currentUser.id ? "sent" : "received"}`;

            msgEl.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${escapeHtml(msg.text)}</div>
                    <div class="message-time">
                        ${new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </div>
                </div>
            `;

            chatMessages.appendChild(msgEl);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message || !currentConversation) {
        return;
    }

    try {
        await apiRequest("/Messages/send", "POST", {
            conversationId: currentConversation.id,
            senderId: currentUser.id,
            text: message
        });

        input.value = "";
        autoResizeTextarea();

        await loadChatMessages();

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function openNewMessageModal() {
    const modal = document.getElementById("newMessageModal");
    modal.classList.add("show");

    const select = document.getElementById("bookingSelect");
    select.innerHTML = '<option value="" disabled selected hidden>Choose a booking...</option>';

    try {
        const bookings = await apiRequest(`/Bookings/mine/${currentUser.id}`);

        bookings.forEach(booking => {
            const option = document.createElement("option");
            option.value = JSON.stringify(booking);
            option.textContent = `${booking.propertyTitle} - ${booking.city}`;
            select.appendChild(option);
        });

    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function startConversation() {
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

    try {
        const conversationResult = await apiRequest("/Messages/conversation/create", "POST", {
            userId: currentUser.id,
            propertyId: booking.propertyId
        });

        await apiRequest("/Messages/send", "POST", {
            conversationId: conversationResult.conversationId,
            senderId: currentUser.id,
            text: initialMsg
        });

        document.getElementById("newMessageModal").classList.remove("show");
        document.getElementById("bookingSelect").value = "";
        document.getElementById("initialMessage").value = "";

        await loadConversations();

        alert("✅ Conversation started!");

    } catch (error) {
        alert("❌ " + error.message);
    }
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

function closeChatWindow() {
    if (window.innerWidth <= 992) {
        document.getElementById("chatContainer").style.display = "none";

        document.querySelectorAll(".conversation-item").forEach(item => {
            item.classList.remove("active");
        });
    }
}

function getInitials(name) {
    return String(name || "H")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function autoResizeTextarea() {
    const textarea = document.getElementById("messageInput");
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}