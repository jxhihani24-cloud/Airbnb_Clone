(function () {
    function safeParse(raw, fallback) {
        if (typeof raw !== "string" || raw.trim() === "") {
            return fallback;
        }

        try {
            const parsed = JSON.parse(raw);
            return parsed === null ? fallback : parsed;
        } catch {
            return fallback;
        }
    }

    function getJSON(storage, key, fallback) {
        return safeParse(storage.getItem(key), fallback);
    }

    function setJSON(storage, key, value) {
        storage.setItem(key, JSON.stringify(value));
    }

    function getLS(key, fallback) {
        return getJSON(localStorage, key, fallback);
    }

    function setLS(key, value) {
        setJSON(localStorage, key, value);
    }

    function getSS(key, fallback) {
        return getJSON(sessionStorage, key, fallback);
    }

    function setSS(key, value) {
        setJSON(sessionStorage, key, value);
    }

    function toISODate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toISOString().slice(0, 10);
    }

    function toDisplayDate(value) {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString();
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function toSessionUser(user) {
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            gender: user.gender || "",
            dateOfBirth: user.dateOfBirth || "",
            country: user.country || "",
            phoneNumber: user.phoneNumber || ""
        };
    }

    function getCurrentUser() {
        return getLS("currentUser", null);
    }

    function setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("token");
            return;
        }

        setLS("currentUser", toSessionUser(user));
    }

    function getToken() {
        return localStorage.getItem("token");
    }

    function setToken(token) {
        if (!token) {
            localStorage.removeItem("token");
            return;
        }

        localStorage.setItem("token", token);
    }

    function clearSession() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        sessionStorage.removeItem("pendingBooking");
        sessionStorage.removeItem("paymentConfirmation");
    }

    function escapeHtml(text) {
        if (!text) {
            return "";
        }

        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function sanitizeInput(text) {
        if (!text) {
            return "";
        }

        return String(text)
            .replace(/[<>]/g, "")
            .trim();
    }

    window.AppStorage = {
        safeParse,
        getJSON,
        setJSON,

        getLS,
        setLS,
        getSS,
        setSS,

        toISODate,
        toDisplayDate,
        nowISO,

        toSessionUser,
        getCurrentUser,
        setCurrentUser,

        getToken,
        setToken,
        clearSession,

        escapeHtml,
        sanitizeInput
    };
})();