(function () {
    function safeParse(raw, fallback) {
        if (typeof raw !== "string" || raw.trim() === "") return fallback;
        try {
            const parsed = JSON.parse(raw);
            return parsed === null ? fallback : parsed;
        } catch (error) {
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
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString().slice(0, 10);
    }

    function toDisplayDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString();
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function toSessionUser(user) {
        if (!user) return null;
        return {
            id: user.id || user.username,
            username: user.username,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || ""
        };
    }

    function getCurrentUser() {
        return getLS("currentUser", null);
    }

    function setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem("currentUser");
            return;
        }
        setLS("currentUser", toSessionUser(user));
    }

    function removeUserRelatedData(username) {
        const bookings = getLS("bookings", []).filter(function (b) {
            return b.userId !== username;
        });
        setLS("bookings", bookings);

        const reviews = getLS("reviews", []).filter(function (r) {
            return r.userId !== username && r.reviewerUsername !== username;
        });
        setLS("reviews", reviews);

        const hostReviews = getLS("hostReviews", []).filter(function (r) {
            return r.hostUsername !== username && r.reviewerUsername !== username;
        });
        setLS("hostReviews", hostReviews);

        const conversations = getLS("conversations", []).filter(function (c) {
            return c.userId !== username;
        });
        setLS("conversations", conversations);

        const payments = getLS("payments", []).filter(function (p) {
            return !p.bookingData || p.bookingData.userId !== username;
        });
        setLS("payments", payments);

        const properties = getLS("properties", []).filter(function (p) {
            return p.owner !== username;
        });
        setLS("properties", properties);
    }

    function removeProperty(propertyId) {
        // Delete property
        let properties = getLS("properties", []);
        properties = properties.filter(function (p) {
            return p.id != propertyId;
        });
        setLS("properties", properties);

        // Delete related bookings
        let bookings = getLS("bookings", []);
        bookings = bookings.filter(function (b) {
            return b.propertyId != propertyId;
        });
        setLS("bookings", bookings);

        // Delete related reviews
        let reviews = getLS("reviews", []);
        reviews = reviews.filter(function (r) {
            return r.propertyId != propertyId;
        });
        setLS("reviews", reviews);

        // Delete related conversations
        let conversations = getLS("conversations", []);
        conversations = conversations.filter(function (c) {
            return c.propertyId != propertyId;
        });
        setLS("conversations", conversations);
    }

    function escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function sanitizeInput(text) {
        if (!text) return "";
        // Remove HTML tags and escape special characters
        return text.replace(/[<>&"']/g, function (match) {
            var escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function checkDateOverlap(propertyId, checkIn, checkOut, existingBookings) {
        const newStart = new Date(checkIn);
        const newEnd = new Date(checkOut);
        
        return existingBookings.some(function (booking) {
            if (booking.propertyId !== propertyId) return false;
            if (booking.status === "cancelled" || booking.cancelled === true) return false;
            
            const existingStart = new Date(booking.checkInDate);
            const existingEnd = new Date(booking.checkOutDate);
            
            // Overlap if: new start before existing end AND new end after existing start
            return newStart < existingEnd && newEnd > existingStart;
        });
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const digest = await crypto.subtle.digest("SHA-256", data);
        const bytes = Array.from(new Uint8Array(digest));
        return bytes.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }

    async function verifyPassword(user, inputPassword) {
        if (!user || !inputPassword) return false;

        if (user.passwordHash) {
            const inputHash = await hashPassword(inputPassword);
            return user.passwordHash === inputHash;
        }

        if (typeof user.password === "string") {
            // For old plain-text passwords, also hash for comparison
            const inputHash = await hashPassword(inputPassword);
            return user.password === inputPassword || user.password === inputHash;
        }

        return false;
    }

    async function ensureUserHasPasswordHash(user) {
        if (!user || user.passwordHash || typeof user.password !== "string") {
            return user;
        }

        const passwordHash = await hashPassword(user.password);
        const updated = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt || nowISO(),
            passwordHash: passwordHash
        };

        return updated;
    }

    window.AppStorage = {
        safeParse: safeParse,
        getLS: getLS,
        setLS: setLS,
        getSS: getSS,
        setSS: setSS,
        toISODate: toISODate,
        toDisplayDate: toDisplayDate,
        nowISO: nowISO,
        toSessionUser: toSessionUser,
        getCurrentUser: getCurrentUser,
        setCurrentUser: setCurrentUser,
        removeUserRelatedData: removeUserRelatedData,
        removeProperty: removeProperty,
        hashPassword: hashPassword,
        verifyPassword: verifyPassword,
        ensureUserHasPasswordHash: ensureUserHasPasswordHash,
        escapeHtml: escapeHtml,
        sanitizeInput: sanitizeInput,
        validateEmail: validateEmail,
        checkDateOverlap: checkDateOverlap
    };
})();
