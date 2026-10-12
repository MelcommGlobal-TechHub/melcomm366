/* ==========================================
   AI AFRICA — LEARNING PROGRESS CORE
   Updated with Gamification Events

   Features:
   - Authentication integration
   - Lesson access protection
   - User-specific progress storage
   - Watched-time tracking
   - Lesson completion tracking
   - Learning statistics
   - Gamification completion events
   ========================================== */

(() => {
    "use strict";

    const PREFIX = "aiAfricaLearningHub_v1:";
    let lessonProtectionInstalled = false;

    /* ==========================================
       AUTHENTICATION
    ========================================== */

    function getCurrentUser() {
        return window.AIAfricaAuth?.getCurrentUser?.() || null;
    }

    function isAuthenticated() {
        const user = getCurrentUser();

        return Boolean(
            user &&
            typeof user.email === "string" &&
            user.email.trim()
        );
    }

    /* ==========================================
       OPEN AUTHENTICATION INTERFACE
    ========================================== */

    function openAuthentication(mode = "signin") {
        const signInButton =
            document.getElementById("openSignIn");

        const signUpButton =
            document.getElementById("openSignUp");

        const authModal =
            document.getElementById("authModal");

        const trigger = mode === "signup"
            ? signUpButton
            : signInButton;

        if (trigger) {
            trigger.click();
            return;
        }

        if (authModal) {
            authModal.hidden = false;
            authModal.removeAttribute("hidden");
            authModal.setAttribute("aria-hidden", "false");

            const requestedForm = document.getElementById(
                mode === "signup"
                    ? "signUpForm"
                    : "signInForm"
            );

            if (requestedForm) {
                requestedForm.hidden = false;
                requestedForm.removeAttribute("hidden");
            }

            return;
        }

        console.warn(
            "AI Africa: Authentication interface not found. " +
            "Check auth.js and the authentication modal."
        );
    }

    /* ==========================================
       ACCESS MODAL
    ========================================== */

    function showAccessModal(options = {}) {
        document
            .getElementById("aiAfricaAccessModal")
            ?.remove();

        const title = options.title ||
            "Your Learning Journey Starts Here";

        const message = options.message ||
            "Create your free account or sign in to continue learning.";

        const overlay = document.createElement("div");

        overlay.id = "aiAfricaAccessModal";
        overlay.className = "aa-access-overlay";

        overlay.innerHTML = `
            <section
                class="aa-access-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aaAccessTitle"
                aria-describedby="aaAccessMessage"
                tabindex="-1"
            >
                <button
                    type="button"
                    class="aa-access-close"
                    aria-label="Close dialog"
                >&times;</button>

                <div class="aa-access-logo">
                    <span class="aa-logo-symbol">AI</span>
                    <span class="aa-logo-text">AFRICA</span>
                </div>

                <div class="aa-access-icon">
                    <svg
                        viewBox="0 0 24 24"
                        width="32"
                        height="32"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <rect
                            x="4"
                            y="10"
                            width="16"
                            height="11"
                            rx="2"
                        />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        <path d="M12 14v3" />
                    </svg>
                </div>

                <div class="aa-access-badge">
                    <span class="aa-status-dot"></span>
                    LEARNER ACCESS
                </div>

                <h2 id="aaAccessTitle"></h2>

                <p id="aaAccessMessage"></p>

                <div class="aa-access-benefits">
                    <div class="aa-benefit">
                        <span class="aa-benefit-check">✓</span>
                        <span>Access lessons and video tutorials</span>
                    </div>

                    <div class="aa-benefit">
                        <span class="aa-benefit-check">✓</span>
                        <span>Take assessments and view your scores</span>
                    </div>

                    <div class="aa-benefit">
                        <span class="aa-benefit-check">✓</span>
                        <span>Track your learning progress</span>
                    </div>
                </div>

                <button
                    type="button"
                    class="aa-access-primary"
                    data-auth-action="signup"
                >
                    <span class="aa-primary-label">
                        Create Free Account
                    </span>
                    <span aria-hidden="true">&rarr;</span>
                </button>

                <button
                    type="button"
                    class="aa-access-secondary"
                    data-auth-action="signin"
                >
                    I already have an account
                </button>

                <div class="aa-access-footer">
                    <span class="aa-footer-line"></span>
                    <span>YOUR FUTURE. YOUR KNOWLEDGE.</span>
                    <span class="aa-footer-line"></span>
                </div>
            </section>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector("#aaAccessTitle").textContent =
            title;

        overlay.querySelector("#aaAccessMessage").textContent =
            message;

        const card = overlay.querySelector(".aa-access-card");
        const closeButton =
            overlay.querySelector(".aa-access-close");

        let closed = false;

        function closeModal() {
            if (closed) return;

            closed = true;

            document.removeEventListener(
                "keydown",
                handleKeydown
            );

            overlay.classList.remove("aa-access-visible");

            window.setTimeout(() => {
                overlay.remove();
            }, 220);
        }

        function handleKeydown(event) {
            if (event.key === "Escape") {
                closeModal();
            }

            if (event.key === "Tab" && !closed) {
                const focusable = [
                    ...card.querySelectorAll(
                        'button:not([disabled]), a[href], input:not([disabled])'
                    )
                ];

                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (
                    event.shiftKey &&
                    document.activeElement === first
                ) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        closeButton.addEventListener("click", closeModal);

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeModal();
            }
        });

        overlay
            .querySelectorAll("[data-auth-action]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const mode = button.dataset.authAction;

                    closeModal();

                    window.setTimeout(() => {
                        openAuthentication(mode);
                    }, 230);
                });
            });

        document.addEventListener("keydown", handleKeydown);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (closed) return;

                overlay.classList.add("aa-access-visible");
                card.focus();
            });
        });
    }

    /* ==========================================
       REQUIRE AUTHENTICATION FOR SCORING
    ========================================== */

    function requireScoringAccess() {
        if (isAuthenticated()) {
            return true;
        }

        showAccessModal({
            title: "Unlock Your Learning Potential",
            message:
                "Sign up or sign in to access scoring, " +
                "view your results, and track your progress."
        });

        return false;
    }

    /* ==========================================
       PROTECT LESSON ACCESS
    ========================================== */

    function protectLessonAccess() {
        if (lessonProtectionInstalled) {
            return;
        }

        lessonProtectionInstalled = true;

        document.addEventListener("click", function (event) {
            const target = event.target instanceof Element
                ? event.target.closest(
                    "button, a, [role='button'], " +
                    'input[type="button"], input[type="submit"]'
                )
                : null;

            if (!target) return;

            if (
                target.closest("#authModal") ||
                target.closest("#aiAfricaAccessModal") ||
                target.id === "openSignIn" ||
                target.id === "openSignUp" ||
                target.id === "profileMenuButton" ||
                target.id === "signOutButton"
            ) {
                return;
            }

            const text = [
                target.textContent || "",
                target.getAttribute("aria-label") || "",
                target.getAttribute("title") || "",
                target.getAttribute("data-action") || "",
                target.getAttribute("data-testid") || "",
                target.getAttribute("href") || ""
            ]
                .join(" ")
                .toLowerCase()
                .replace(/\s+/g, " ");

            const identity = [
                typeof target.className === "string"
                    ? target.className
                    : "",
                target.id || "",
                target.getAttribute("data-action") || ""
            ]
                .join(" ")
                .toLowerCase();

            const isLessonAction =
                /\bwatch\s+(?:the\s+)?video\b/.test(text) ||
                /\bstart\s+(?:a\s+|the\s+)?lessons?\b/.test(text) ||
                /\bstart\s+learning\b/.test(text) ||
                /\bplay\s+(?:the\s+)?video\b/.test(text) ||
                /\bopen\s+(?:the\s+)?lesson\b/.test(text) ||
                /\bcontinue\s+learning\b/.test(text) ||
                /\bresume\s+(?:the\s+)?lesson\b/.test(text) ||
                /\bwatch-video\b/.test(identity) ||
                /\bstart-lesson\b/.test(identity) ||
                /\blesson-player\b/.test(identity) ||
                /\bplay-video\b/.test(identity);

            if (!isLessonAction) return;

            if (isAuthenticated()) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            showAccessModal({
                title: "Your Next Lesson Awaits",
                message:
                    "Join AI Africa Learning Hub to watch videos, " +
                    "start lessons, take assessments, and track " +
                    "your learning progress."
            });
        }, true);
    }

    /* ==========================================
       USER-SPECIFIC STORAGE
    ========================================== */

    function getStorageKey() {
        const user = getCurrentUser();

        if (
            !user ||
            typeof user.email !== "string" ||
            !user.email.trim()
        ) {
            return null;
        }

        return PREFIX + user.email.trim().toLowerCase();
    }

    function blankState() {
        return {
            opened: [],
            completed: [],
            activities: [],
            lessons: {},
            lastLesson: null
        };
    }

    /* ==========================================
       LOAD PROGRESS
    ========================================== */

    function load() {
        const key = getStorageKey();

        if (!key) {
            return blankState();
        }

        try {
            const parsed = JSON.parse(
                localStorage.getItem(key) || "null"
            );

            if (!parsed || typeof parsed !== "object") {
                return blankState();
            }

            return {
                ...blankState(),
                ...parsed,

                opened: Array.isArray(parsed.opened)
                    ? parsed.opened
                    : [],

                completed: Array.isArray(parsed.completed)
                    ? parsed.completed
                    : [],

                activities: Array.isArray(parsed.activities)
                    ? parsed.activities
                    : [],

                lessons:
                    parsed.lessons &&
                    typeof parsed.lessons === "object" &&
                    !Array.isArray(parsed.lessons)
                        ? parsed.lessons
                        : {}
            };
        } catch (error) {
            console.error(
                "AI Africa: Could not load progress:",
                error
            );

            return blankState();
        }
    }

    /* ==========================================
       SAVE PROGRESS
    ========================================== */

    function save(state) {
        const key = getStorageKey();

        if (!key) {
            console.warn(
                "AI Africa: Sign in to save learning progress."
            );

            return false;
        }

        try {
            localStorage.setItem(key, JSON.stringify(state));
            return true;
        } catch (error) {
            console.error(
                "AI Africa: Could not save progress:",
                error
            );

            return false;
        }
    }

    /* ==========================================
       COURSE AND ACTIVITY HELPERS
    ========================================== */

    function getLesson(id) {
        return window.AIAfricaCourses?.getById?.(id) || null;
    }

    function addActivity(state, type, lesson) {
        state.activities.unshift({
            type,
            lessonId: lesson.id,
            title: lesson.title,
            description: lesson.description,
            date: new Date().toISOString()
        });

        state.activities = state.activities.slice(0, 100);
    }

    function createLessonProgress() {
        return {
            watchedSeconds: 0,
            duration: 0,
            completed: false,
            lastPosition: 0
        };
    }

    /* ==========================================
       DISPATCH NEW COMPLETION EVENT
    ========================================== */

    function dispatchLessonCompleted(lesson) {
        if (!lesson) return;

        window.dispatchEvent(
            new CustomEvent("aiafrica:lessonCompleted", {
                detail: {
                    lessonId: lesson.id,
                    title: lesson.title,
                    stats: getStats()
                }
            })
        );
    }

    /* ==========================================
       RECORD LESSON OPENING
    ========================================== */

    function recordOpen(lessonId) {
        if (!isAuthenticated()) {
            requireScoringAccess();
            return false;
        }

        const lesson = getLesson(lessonId);

        if (!lesson) return false;

        const state = load();

        if (!state.opened.includes(lessonId)) {
            state.opened.push(lessonId);
            addActivity(state, "opened", lesson);
        }

        if (!state.lessons[lessonId]) {
            state.lessons[lessonId] = createLessonProgress();
        }

        state.lastLesson = lessonId;

        return save(state);
    }

    /* ==========================================
       RECORD WATCHED TIME
    ========================================== */

    function recordWatchedSeconds(
        lessonId,
        seconds,
        duration
    ) {
        if (!isAuthenticated()) return false;

        const lesson = getLesson(lessonId);

        if (
            !lesson ||
            !lesson.videoId ||
            !Number.isFinite(seconds) ||
            seconds <= 0
        ) {
            return false;
        }

        const state = load();

        if (!state.lessons[lessonId]) {
            state.lessons[lessonId] = createLessonProgress();
        }

        const progress = state.lessons[lessonId];

        // Limit each update to a plausible amount of playback.
        progress.watchedSeconds += Math.min(seconds, 3.5);

        if (Number.isFinite(duration) && duration > 0) {
            progress.duration = duration;
        }

        const requiredDuration =
            progress.duration || lesson.duration;

        let newlyCompleted = false;

        if (
            !progress.completed &&
            requiredDuration > 0 &&
            progress.watchedSeconds / requiredDuration >= 0.8
        ) {
            progress.completed = true;

            if (!state.completed.includes(lessonId)) {
                state.completed.push(lessonId);
                addActivity(state, "completed", lesson);
                newlyCompleted = true;
            }
        }

        const saved = save(state);

        // Notify gamification only after successful persistence.
        if (saved && newlyCompleted) {
            dispatchLessonCompleted(lesson);
        }

        return saved;
    }

    /* ==========================================
       UPDATE PLAYBACK POSITION
    ========================================== */

    function updatePlaybackPosition(
        lessonId,
        position,
        duration
    ) {
        if (!isAuthenticated()) return false;

        const lesson = getLesson(lessonId);

        if (!lesson) return false;

        const state = load();

        if (!state.lessons[lessonId]) {
            state.lessons[lessonId] = createLessonProgress();
        }

        const progress = state.lessons[lessonId];

        if (Number.isFinite(position) && position >= 0) {
            progress.lastPosition = position;
        }

        if (Number.isFinite(duration) && duration > 0) {
            progress.duration = duration;
        }

        state.lastLesson = lessonId;

        return save(state);
    }

    /* ==========================================
       COMPLETE LESSON
    ========================================== */

    function completeLesson(lessonId) {
        if (!isAuthenticated()) return false;

        const state = load();
        const lesson = getLesson(lessonId);
        const progress = state.lessons[lessonId];

        if (!lesson || !lesson.videoId || !progress) {
            return false;
        }

        const duration = progress.duration || lesson.duration;

        if (
            !Number.isFinite(duration) ||
            duration <= 0 ||
            progress.watchedSeconds / duration < 0.8
        ) {
            return false;
        }

        const isNewCompletion =
            !state.completed.includes(lessonId);

        if (isNewCompletion) {
            state.completed.push(lessonId);
            addActivity(state, "completed", lesson);
        }

        progress.completed = true;

        const saved = save(state);

        if (saved && isNewCompletion) {
            dispatchLessonCompleted(lesson);
        }

        return saved;
    }

    /* ==========================================
       GET LESSON PROGRESS
    ========================================== */

    function getLessons() {
        return load().lessons;
    }

    /* ==========================================
       LEARNING STATISTICS
    ========================================== */

    function getStats() {
        const state = load();

        const lessons =
            window.AIAfricaCourses?.getAll?.() || [];

        const total = lessons.length;

        // Count only unique completed lesson IDs that still
        // exist in the current course catalogue.
        const validLessonIds = new Set(
            lessons.map(lesson => lesson.id)
        );

        const completed = state.completed.filter(
            id => validLessonIds.has(id)
        ).length;

        const opened = state.opened.filter(
            id => validLessonIds.has(id)
        ).length;

        return {
            total,
            completed,
            opened,
            percent: total
                ? Math.round((completed / total) * 100)
                : 0
        };
    }

    /* ==========================================
       CLEAR PROGRESS
    ========================================== */

    function clearProgress() {
        const key = getStorageKey();

        if (!key) return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(
                "AI Africa: Could not clear progress:",
                error
            );

            return false;
        }
    }

    /* ==========================================
       INITIALIZE ACCESS PROTECTION
    ========================================== */

    protectLessonAccess();

    /* ==========================================
       PUBLIC API
    ========================================== */

    window.AIAfricaProgress = {
        getCurrentUser,
        isAuthenticated,
        requireScoringAccess,
        openAuthentication,
        showAccessModal,
        protectLessonAccess,
        load,
        save,
        recordOpen,
        recordWatchedSeconds,
        updatePlaybackPosition,
        completeLesson,
        getLessons,
        getStats,
        clearProgress
    };

})();