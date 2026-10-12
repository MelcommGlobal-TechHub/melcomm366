/* ==========================================
   AI AFRICA — DEMO AUTHENTICATION
   Uses localStorage and sessionStorage.
   Demo only; not suitable for production.
   ========================================== */

(() => {
    "use strict";

    const ACCOUNT_KEY = "aiAfricaDemoAccount";
    const SESSION_KEY = "aiAfricaDemoSession";

    const $ = id => document.getElementById(id);

    let initialized = false;

    const normalizeEmail = email =>
        String(email || "").trim().toLowerCase();

    function getAccount() {
        try {
            const account = JSON.parse(
                localStorage.getItem(ACCOUNT_KEY) || "null"
            );

            if (!account?.email) return null;

            return {
                ...account,
                email: normalizeEmail(account.email)
            };
        } catch {
            return null;
        }
    }

    function getCurrentUser() {
        try {
            const account = getAccount();
            const session = JSON.parse(
                sessionStorage.getItem(SESSION_KEY) || "null"
            );

            if (
                !account ||
                !session?.email ||
                normalizeEmail(session.email) !== account.email
            ) {
                return null;
            }

            return account;
        } catch {
            return null;
        }
    }

    function showMessage(message, type = "") {
        const element = $("authMessage");
        if (!element) return;

        element.textContent = message;
        element.className =
            "auth-message" + (type ? " " + type : "");
    }

    function openModal(mode = "signin") {
        const modal = $("authModal");
        if (!modal) {
            console.error("AI Africa: authModal is missing.");
            return;
        }

        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");

        const signup = $("demoSignUpForm");
        const signin = $("demoSignInForm");

        if (signup) signup.hidden = mode !== "signup";
        if (signin) signin.hidden = mode !== "signin";

        closeDropdown();
        showMessage("");

        setTimeout(() => {
            $(
                mode === "signup"
                    ? "signupFirstName"
                    : "signinEmail"
            )?.focus();
        }, 50);
    }

    function closeModal() {
        const modal = $("authModal");

        if (modal) {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
        }

        showMessage("");
    }

    function closeDropdown() {
        const dropdown = $("authDropdown");

        if (dropdown) dropdown.hidden = true;

        $("profileMenuButton")?.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    function updateNavigation() {
        const user = getCurrentUser();
        const signedIn = Boolean(user);

        if ($("signedOutControls")) {
            $("signedOutControls").hidden = signedIn;
        }

        if ($("signedInControls")) {
            $("signedInControls").hidden = !signedIn;
        }

        if ($("topProfileAvatar")) {
            $("topProfileAvatar").hidden = !signedIn;
        }

        if (user) {
            const initials = (
                (user.firstName || "").trim().charAt(0) +
                (user.lastName || "").trim().charAt(0)
            ).toUpperCase() || "U";

            const name = [
                user.firstName,
                user.lastName
            ].filter(Boolean).join(" ") || user.email;

            if ($("topAvatarInitials")) {
                $("topAvatarInitials").textContent = initials;
            }

            if ($("dropdownAvatar")) {
                $("dropdownAvatar").textContent = initials;
            }

            if ($("dropdownUserName")) {
                $("dropdownUserName").textContent = name;
            }

            if ($("sidebarAvatar")) {
                $("sidebarAvatar").textContent = initials;
            }

            if ($("sidebarUserName")) {
                $("sidebarUserName").textContent = name;
            }

            if ($("sidebarUserCaption")) {
                $("sidebarUserCaption").textContent = user.email;
            }
        } else {
            if ($("sidebarAvatar")) {
                $("sidebarAvatar").textContent = "A";
            }

            if ($("sidebarUserName")) {
                $("sidebarUserName").textContent = "AI Africa Learner";
            }

            if ($("sidebarUserCaption")) {
                $("sidebarUserCaption").textContent =
                    "Your learning journey";
            }
        }

        if (
            document.body.dataset.requiresAuth === "true" &&
            !user
        ) {
            window.location.replace("index.html?auth=signin");
        }

        return user;
    }

    function notifyAuthChanged() {
        window.dispatchEvent(
            new CustomEvent("aiAfricaAuthChanged", {
                detail: { user: getCurrentUser() }
            })
        );
    }

    function createSession(account) {
        try {
            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    email: normalizeEmail(account.email),
                    signedInAt: Date.now()
                })
            );

            updateNavigation();
            notifyAuthChanged();

            return true;
        } catch (error) {
            console.error("Session creation failed:", error);
            showMessage(
                "Your browser could not save the session. Check browser storage settings.",
                "error"
            );

            return false;
        }
    }

    function signOut() {
        sessionStorage.removeItem(SESSION_KEY);

        closeDropdown();
        closeModal();
        updateNavigation();
        notifyAuthChanged();

        window.location.replace("index.html");
    }

    function initialize() {
        if (initialized) return;
        initialized = true;

        // Profile dropdown — attach only once.
        $("profileMenuButton")?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const dropdown = $("authDropdown");
            if (!dropdown) return;

            dropdown.hidden = !dropdown.hidden;

            $("profileMenuButton").setAttribute(
                "aria-expanded",
                String(!dropdown.hidden)
            );
        });

        $("topProfileAvatar")?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const dropdown = $("authDropdown");
            if (dropdown) dropdown.hidden = false;

            $("profileMenuButton")?.setAttribute(
                "aria-expanded",
                "true"
            );
        });

        document.addEventListener("click", event => {
            const dropdown = $("authDropdown");
            const button = $("profileMenuButton");
            const avatar = $("topProfileAvatar");

            if (
                !dropdown?.contains(event.target) &&
                !button?.contains(event.target) &&
                !avatar?.contains(event.target)
            ) {
                closeDropdown();
            }
        });

        $("openSignIn")?.addEventListener("click", () => {
            openModal("signin");
        });

        $("openSignUp")?.addEventListener("click", () => {
            openModal("signup");
        });

        $("switchToSignIn")?.addEventListener("click", () => {
            openModal("signin");
        });

        $("switchToSignUp")?.addEventListener("click", () => {
            openModal("signup");
        });

        $("closeAuthModal")?.addEventListener("click", closeModal);

        $("authModal")?.addEventListener("click", event => {
            if (event.target === $("authModal")) closeModal();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeModal();
                closeDropdown();
            }
        });

        // Sign-up.
        $("demoSignUpForm")?.addEventListener("submit", event => {
            event.preventDefault();

            const firstName = ($("signupFirstName")?.value || "").trim();
            const lastName = ($("signupLastName")?.value || "").trim();
            const email = normalizeEmail($("signupEmail")?.value);
            const password = $("signupPassword")?.value || "";

            if (!firstName || !lastName || !email || !password) {
                showMessage("Please complete every field.", "error");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("Enter a valid email address.", "error");
                return;
            }

            if (password.length < 8) {
                showMessage(
                    "Your password must contain at least 8 characters.",
                    "error"
                );
                return;
            }

            const existing = getAccount();

            if (existing) {
                showMessage(
                    existing.email === email
                        ? "This account already exists. Please sign in."
                        : "This demo supports one account per browser. Clear the demo account before registering another.",
                    "error"
                );
                return;
            }

            // DEMO ONLY: plain-text passwords are not secure.
            const account = {
                firstName,
                lastName,
                email,
                demoPassword: password,
                createdAt: new Date().toISOString()
            };

            try {
                localStorage.setItem(
                    ACCOUNT_KEY,
                    JSON.stringify(account)
                );
            } catch (error) {
                console.error(error);
                showMessage(
                    "Could not save your account in this browser.",
                    "error"
                );
                return;
            }

            if (createSession(account)) {
                closeModal();
                showToast("Account created successfully.");
            }
        });

        // Sign-in.
        $("demoSignInForm")?.addEventListener("submit", event => {
            event.preventDefault();

            const email = normalizeEmail($("signinEmail")?.value);
            const password = $("signinPassword")?.value || "";
            const account = getAccount();

            if (!account) {
                showMessage(
                    "No demo account exists in this browser. Please create an account first.",
                    "error"
                );
                return;
            }

            if (
                account.email !== email ||
                account.demoPassword !== password
            ) {
                showMessage(
                    "Incorrect email or password. Please try again.",
                    "error"
                );
                return;
            }

            if (createSession(account)) {
                closeModal();
                showToast("Welcome back!");
            }
        });

        $("signOutButton")?.addEventListener("click", event => {
            event.preventDefault();
            signOut();
        });

        $("openLearningProgress")?.addEventListener("click", event => {
            event.preventDefault();
            closeDropdown();

            if (getCurrentUser()) {
                window.location.href = "learning-progress.html";
            } else {
                openModal("signin");
            }
        });

        updateNavigation();

        const params = new URLSearchParams(window.location.search);

        if (params.get("auth") === "signin" && !getCurrentUser()) {
            openModal("signin");
        }

        window.AIAfricaAuth = {
            getCurrentUser,
            updateNavigation,
            openModal,
            closeModal,
            signOut
        };

        console.info("AI Africa authentication ready.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();