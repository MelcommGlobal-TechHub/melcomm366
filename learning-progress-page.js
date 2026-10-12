/* ==========================================
   AI AFRICA LEARNING PROGRESS DASHBOARD
========================================== */

(function () {
    "use strict";

    const progress = window.AIAfricaProgress;

    if (
        !progress ||
        typeof progress.getCurrentUser !== "function" ||
        !progress.getCurrentUser()
    ) {
        window.location.replace("index.html?auth=signin");
        return;
    }

    let user = progress.getCurrentUser();

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    /* ==========================================
       GENERAL HELPERS
    ========================================== */

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "";
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getFullName(account) {
        return [
            account.firstName || "",
            account.lastName || ""
        ]
            .join(" ")
            .trim() || account.email || "Learner";
    }

    function getInitials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "A";
    }

    function getState() {
        return progress.load();
    }

    function getLessons() {
        return typeof progress.getLessons === "function"
            ? progress.getLessons()
            : window.AI_AFRICA_LESSONS || [];
    }

    function getUniqueIds(ids) {
        return [...new Set(Array.isArray(ids) ? ids : [])];
    }

    function formatDate(dateValue) {
        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    /* ==========================================
       USER PROFILE
    ========================================== */

    function renderProfile() {
        user = progress.getCurrentUser();

        if (!user) {
            window.location.replace("index.html?auth=signin");
            return;
        }

        const fullName = getFullName(user);
        const initials = getInitials(fullName);

        setText("headerUserName", fullName);
        setText("dropdownUserName", fullName);
        setText("dropdownUserEmail", user.email);
        setText("avatarInitials", initials);

        const avatar = document.getElementById("avatarInitials");

        if (avatar) {
            avatar.setAttribute("aria-label", fullName);
        }
    }

    /* ==========================================
       LEARNING STATISTICS
    ========================================== */

    function renderStats() {
        const state = getState();
        const lessons = getLessons();

        const opened = getUniqueIds(state.opened);
        const completed = getUniqueIds(state.completed);

        const validLessonIds = new Set(
            lessons.map(lesson => lesson.id)
        );

        const validOpened = opened.filter(id =>
            validLessonIds.has(id)
        );

        const validCompleted = completed.filter(id =>
            validLessonIds.has(id)
        );

        const totalLessons = lessons.length;

        const completedCount = validCompleted.length;
        const startedCount = validOpened.length;

        const percent = totalLessons
            ? Math.round(
                (completedCount / totalLessons) * 100
            )
            : 0;

        // A learning path is considered complete only when every
        // lesson belonging to that path has been completed.
        //
        // If your lessons do not define learningPath or path,
        // the dashboard will not invent a course-completion count.
        const pathGroups = new Map();

        lessons.forEach(lesson => {
            const pathName = lesson.learningPath || lesson.path;

            if (!pathName) return;

            if (!pathGroups.has(pathName)) {
                pathGroups.set(pathName, []);
            }

            pathGroups.get(pathName).push(lesson.id);
        });

        let completedPaths = 0;

        pathGroups.forEach(lessonIds => {
            if (
                lessonIds.length > 0 &&
                lessonIds.every(id => validCompleted.includes(id))
            ) {
                completedPaths++;
            }
        });

        setText("coursesStarted", startedCount);
        setText("coursesCompleted", completedPaths);
        setText("lessonsCompleted", completedCount);

        // Points are based on completed lessons, not on opening videos.
        setText("learningPoints", completedCount * 10);

        setText("progressPercent", `${percent}%`);

        const progressBar =
            document.getElementById("overallProgressBar");

        if (progressBar) {
            progressBar.style.width = `${percent}%`;

            progressBar.setAttribute(
                "aria-valuenow",
                String(percent)
            );

            progressBar.setAttribute("aria-valuemin", "0");
            progressBar.setAttribute("aria-valuemax", "100");
            progressBar.setAttribute(
                "aria-label",
                "Overall lesson completion"
            );
        }

        setText("totalLessons", totalLessons);
        setText("startedLessons", startedCount);
        setText("remainingLessons", totalLessons - completedCount);

        // Update optional alternative progress indicators.
        const circularProgress = document.getElementById(
            "circularProgress"
        );

        if (circularProgress) {
            circularProgress.style.setProperty(
                "--progress",
                `${percent}%`
            );

            circularProgress.setAttribute(
                "aria-label",
                `${percent}% of lessons completed`
            );
        }
    }

    /* ==========================================
       ACHIEVEMENTS
    ========================================== */

    function renderAchievements() {
        const state = getState();
        const lessons = getLessons();

        const completedIds = getUniqueIds(state.completed);

        const validCompleted = completedIds.filter(id =>
            lessons.some(lesson => lesson.id === id)
        );

        const firstBadge =
            document.getElementById("achievementFirst");

        const fiveBadge =
            document.getElementById("achievementFive");

        const courseBadge =
            document.getElementById("achievementCourse");

        function setEarned(element, earned) {
            if (!element) return;

            element.classList.toggle("earned", earned);
            element.classList.toggle("locked", !earned);

            element.setAttribute(
                "aria-label",
                earned ? "Achievement earned" : "Achievement locked"
            );

            const status = element.querySelector(
                "[data-achievement-status]"
            );

            if (status) {
                status.textContent = earned ? "Earned" : "Locked";
            }
        }

        // First Lesson
        setEarned(firstBadge, validCompleted.length >= 1);

        // Learning Explorer
        setEarned(fiveBadge, validCompleted.length >= 5);

        // All Lessons Completed
        const allLessonsCompleted =
            lessons.length > 0 &&
            lessons.every(lesson =>
                validCompleted.includes(lesson.id)
            );

        setEarned(courseBadge, allLessonsCompleted);

        // Optional achievement labels.
        setText("completedAchievementCount", [
            validCompleted.length >= 1,
            validCompleted.length >= 5,
            allLessonsCompleted
        ].filter(Boolean).length);
    }

    /* ==========================================
       ACTIVITY HISTORY
    ========================================== */

    function getActivityEntries(state) {
        if (Array.isArray(state.activity)) {
            return state.activity
                .filter(item =>
                    item &&
                    typeof item === "object" &&
                    item.lessonId
                )
                .slice()
                .sort((a, b) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();

                    return dateB - dateA;
                });
        }

        // Compatibility with the older activity object.
        if (
            state.activity &&
            typeof state.activity === "object"
        ) {
            const ids = getUniqueIds([
                ...(state.opened || []),
                ...(state.completed || [])
            ]);

            return ids.map(id => ({
                lessonId: id,
                type: (state.completed || []).includes(id)
                    ? "completed"
                    : "opened",
                date: state.activity[id] || null
            })).reverse();
        }

        return [];
    }

    function renderActivity() {
        const state = getState();
        const lessons = getLessons();

        const container =
            document.getElementById("activityList");

        const entries = getActivityEntries(state);

        setText("activityCount", entries.length);

        if (!container) return;

        if (!entries.length) {
            container.innerHTML = `
                <div class="empty-activity">
                    <h3>No learning activity yet</h3>

                    <p>
                        Watch a tutorial on AI Africa to begin
                        tracking your learning journey.
                    </p>

                    <a href="index.html">
                        Explore tutorials
                    </a>
                </div>
            `;

            return;
        }

        const lessonMap = new Map(
            lessons.map(lesson => [lesson.id, lesson])
        );

        container.innerHTML = entries
            .slice(0, 20)
            .map(item => {
                const lesson = lessonMap.get(item.lessonId);

                if (!lesson) return "";

                const completed =
                    item.type === "completed" ||
                    (state.completed || []).includes(lesson.id);

                const title = escapeHTML(
                    item.title || lesson.title || "Learning activity"
                );

                const description = escapeHTML(
                    item.description ||
                    (completed
                        ? "Completed tutorial"
                        : "Started or continued tutorial")
                );

                const date = escapeHTML(
                    formatDate(item.date)
                );

                return `
                    <article class="activity-item">
                        <div class="activity-icon">
                            ${completed ? "✓" : "▶"}
                        </div>

                        <div class="activity-content">
                            <h4>${title}</h4>
                            <p>${description}</p>
                            <small>${date}</small>
                        </div>

                        ${
                            completed
                                ? `<span class="activity-badge">
                                    Completed
                                   </span>`
                                : `<span class="activity-badge">
                                    Started
                                   </span>`
                        }
                    </article>
                `;
            })
            .join("");

        if (!container.innerHTML.trim()) {
            container.innerHTML = `
                <div class="empty-activity">
                    <h3>No matching lessons</h3>
                    <p>Your saved activity may refer to lessons that are no longer available.</p>
                </div>
            `;
        }
    }

    /* ==========================================
       CLEAR ACTIVITY ONLY
    ========================================== */

    function clearActivityOnly() {
        const state = getState();

        // Do not erase opened lessons, completed lessons, or
        // watch records when the user only wants to clear history.
        state.activity = [];

        progress.save(state);

        render();
    }

    /* ==========================================
       RESET ALL LEARNING PROGRESS
    ========================================== */

    function resetAllProgress() {
        if (typeof progress.clearProgress !== "function") {
            alert("The progress reset service is unavailable.");
            return;
        }

        progress.clearProgress();

        render();
    }

    /* ==========================================
       SIGN OUT
    ========================================== */

    function signOut() {
        // Prefer the central auth service when available.
        if (
            window.AIAfricaAuth &&
            typeof window.AIAfricaAuth.signOut === "function"
        ) {
            window.AIAfricaAuth.signOut();
            return;
        }

        sessionStorage.removeItem("aiAfricaDemoSession");

        window.location.replace("index.html");
    }

    /* ==========================================
       DASHBOARD RENDERING
    ========================================== */

    function render() {
        // Recheck authentication before showing private data.
        user = progress.getCurrentUser();

        if (!user) {
            window.location.replace("index.html?auth=signin");
            return;
        }

        renderProfile();
        renderStats();
        renderAchievements();
        renderActivity();
    }

    /* ==========================================
       EVENT LISTENERS
    ========================================== */

    window.addEventListener(
        "aiAfricaProgressUpdated",
        render
    );

    window.addEventListener("storage", event => {
        // Refresh when the same account's saved progress changes
        // in another browser tab.
        if (
            event.key &&
            event.key.startsWith("aiAfricaLearningHub_v1:")
        ) {
            render();
        }
    });

    const signOutButton =
        document.getElementById("signOutButton");

    signOutButton?.addEventListener("click", signOut);

    const clearActivityButton =
        document.getElementById("clearActivity");

    clearActivityButton?.addEventListener("click", () => {
        if (!confirm("Clear your activity history? Your completed lessons will remain saved.")) {
            return;
        }

        clearActivityOnly();
    });

    const resetButton =
        document.getElementById("resetProgress");

    resetButton?.addEventListener("click", () => {
        if (!confirm("Reset all your learning progress, including completed lessons and watch history? This cannot be undone.")) {
            return;
        }

        resetAllProgress();
    });

    // Allow other page components to refresh the dashboard.
    window.AIAfricaLearningProgressPage = {
        render,
        clearActivity: clearActivityOnly,
        resetProgress: resetAllProgress
    };

    // Initial dashboard load.
    render();
})();