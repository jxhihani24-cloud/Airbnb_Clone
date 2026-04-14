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
            return user.password === inputPassword;
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
        hashPassword: hashPassword,
        verifyPassword: verifyPassword,
        ensureUserHasPasswordHash: ensureUserHasPasswordHash
    };
})();
