/* ==========================================
   AI AFRICA — APPLICATION CONTROLLER

   Features:
   - Differentiated Create-thon and Hackathon modals
   - Learning badges and qualification messages
   - Video thumbnails and lesson cards
   - Learning progress tracking
   - Search and category filters
   - Navigation and mobile sidebar
   - Hero carousel
   - Authentication updates
========================================== */

(() => {
    "use strict";

    const $ = id => document.getElementById(id);
    const courses = () => window.AIAfricaCourses?.getAll?.() || [];

    let activeCategory = "All";
    let activeSearch = "";
    let activeLevel = "All";
    let activeView = "dashboard";
    let toastTimer = null;
    let heroIndex = 0;
    let heroTimer = null;

    // ==========================================
    // HTML ESCAPING
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    window.showToast = function (message) {
        const toast = $("toast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };

    // ==========================================
    // LEARNING PROGRESS
    // ==========================================

    function progressData() {
        return window.AIAfricaProgress?.load?.() || {
            opened: [],
            completed: [],
            activities: [],
            lessons: {},
            lastLesson: null
        };
    }

    // ==========================================
    // YOUTUBE THUMBNAILS
    // ==========================================

    function getLessonThumbnail(lesson) {
        const videoId = String(lesson.videoId || "").trim();

        if (!videoId) return "";

        return `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    }

    // ==========================================
    // LESSON CARD RENDERING
    // ==========================================

    function renderLessonCard(lesson) {
        const state = progressData();
        const progress = state.lessons?.[lesson.id] || {};
        const completed = (state.completed || []).includes(lesson.id);

        const videoId = String(lesson.videoId || "").trim();
        const available = Boolean(videoId);
        const duration = progress.duration || lesson.duration || 0;

        const percent = duration
            ? Math.min(
                100,
                Math.round(
                    ((progress.watchedSeconds || 0) / duration) * 100
                )
            )
            : 0;

        const buttonText = !available
            ? "Coming Soon"
            : completed
                ? "Watch Again"
                : progress.watchedSeconds
                    ? "Continue Lesson"
                    : "Watch Video";

        const title = escapeHTML(lesson.title);
        const id = escapeHTML(lesson.id);
        const category = escapeHTML(lesson.category);
        const level = escapeHTML(lesson.level);
        const description = escapeHTML(lesson.description);

        const durationMinutes = Math.round(
            (lesson.duration || 0) / 60
        );

        const thumbnailHTML = available
            ? `
                <div class="lesson-thumbnail">
                    <img
                        class="lesson-thumbnail-image"
                        src="${getLessonThumbnail(lesson)}"
                        alt="${title} video thumbnail"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.style.display='none';
                            this.parentElement.classList.add('thumbnail-fallback');
                        "
                    >

                    <span class="thumbnail-badge">AI AFRICA</span>

                    <button
                        class="play-button"
                        type="button"
                        data-open-lesson="${id}"
                        aria-label="Play ${title}">
                        <span aria-hidden="true">▶</span>
                    </button>

                    <span class="thumbnail-duration">
                        ${durationMinutes} MIN
                    </span>
                </div>
            `
            : `
                <div class="lesson-thumbnail thumbnail-unavailable">
                    <div class="thumbnail-placeholder">
                        <span class="placeholder-icon">✦</span>
                        <strong>AI AFRICA</strong>
                        <span>VIDEO COMING SOON</span>
                    </div>
                </div>
            `;

        return `
            <article class="lesson-card ${completed ? "lesson-completed" : ""}">
                ${thumbnailHTML}

                <div class="lesson-body">
                    <div class="lesson-meta">
                        <span class="lesson-category">${category}</span>
                        <span class="lesson-level">${level}</span>
                    </div>

                    <h3 class="lesson-title">${title}</h3>

                    <p class="lesson-description">${description}</p>

                    <div class="lesson-meta lesson-stats">
                        <span class="lesson-duration">
                            ${durationMinutes} min
                        </span>

                        <span class="lesson-status">
                            ${completed ? "✓ Completed" : `${percent}% watched`}
                        </span>
                    </div>

                    <div
                        class="lesson-progress"
                        role="progressbar"
                        aria-label="Lesson progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow="${percent}">

                        <div
                            class="lesson-progress-fill"
                            style="width:${percent}%">
                        </div>
                    </div>

                    <button
                        class="lesson-open-button"
                        type="button"
                        data-open-lesson="${id}"
                        ${available ? "" : "disabled"}>

                        <span class="watch-button-icon" aria-hidden="true">
                            ${available ? "▶" : "◷"}
                        </span>

                        <span>${buttonText}</span>

                        ${available
                            ? `<span class="watch-button-arrow" aria-hidden="true">↗</span>`
                            : ""
                        }
                    </button>
                </div>
            </article>
        `;
    }

    // ==========================================
    // POPULAR LESSONS
    // ==========================================

    function renderPopularLessons() {
        const container = $("popularLessons");
        if (!container) return;

        let filtered = courses();

        if (activeCategory !== "All") {
            filtered = filtered.filter(
                lesson => lesson.category === activeCategory
            );
        }

        container.innerHTML = filtered
            .slice(0, 4)
            .map(renderLessonCard)
            .join("");

        if (!filtered.length) {
            container.innerHTML =
                "<p>No lessons found in this category.</p>";
        }
    }

    // ==========================================
    // ALL LESSONS
    // ==========================================

    function renderAllLessons() {
        const container = $("allLessons");
        if (!container) return;

        let filtered = courses();

        if (activeCategory !== "All") {
            filtered = filtered.filter(
                lesson => lesson.category === activeCategory
            );
        }

        if (activeLevel !== "All") {
            filtered = filtered.filter(
                lesson => lesson.level === activeLevel
            );
        }

        if (activeSearch) {
            const query = activeSearch.toLowerCase();

            filtered = filtered.filter(lesson =>
                [
                    lesson.title,
                    lesson.category,
                    lesson.level,
                    lesson.description
                ].join(" ").toLowerCase().includes(query)
            );
        }

        container.innerHTML = filtered
            .map(renderLessonCard)
            .join("");

        if (!filtered.length) {
            container.innerHTML =
                "<p>No lessons match your search. Try another keyword.</p>";
        }

        if ($("resultCount")) {
            $("resultCount").textContent =
                `${filtered.length} lesson${filtered.length === 1 ? "" : "s"}`;
        }
    }

    // ==========================================
    // EXPLORE FILTERS
    // ==========================================

    function renderExploreFilters() {
        const container = $("exploreFilters");
        if (!container) return;

        const categories = [
            "All",
            ...new Set(courses().map(lesson => lesson.category))
        ];

        container.innerHTML = categories.map(category => `
            <button
                type="button"
                class="filter-chip ${category === activeCategory ? "active" : ""}"
                data-explore-category="${escapeHTML(category)}">

                ${escapeHTML(category === "All" ? "All Lessons" : category)}
            </button>
        `).join("");
    }

    // ==========================================
    // LEARNING CATEGORIES
    // ==========================================

    function renderCategories() {
        const container = $("categoryGrid");
        if (!container) return;

        const categories =
            window.AIAfricaCourses?.getCategories?.() || [];

        container.innerHTML = categories.map(category => {
            const count = courses().filter(
                lesson => lesson.category === category
            ).length;

            return `
                <button
                    type="button"
                    class="category-card"
                    data-path-category="${escapeHTML(category)}">

                    <span class="category-card-icon">✦</span>

                    <h3>${escapeHTML(category)}</h3>

                    <p>
                        ${count} learning lesson${count === 1 ? "" : "s"}
                    </p>

                    <span>Explore path →</span>
                </button>
            `;
        }).join("");
    }

    // ==========================================
    // DASHBOARD STATISTICS
    // ==========================================

    function updateStats() {
        const stats = window.AIAfricaProgress?.getStats?.() || {
            total: courses().length,
            completed: 0,
            opened: 0,
            percent: 0
        };

        if ($("completedCount")) {
            $("completedCount").textContent = stats.completed;
        }

        if ($("progressPercent")) {
            $("progressPercent").textContent = stats.percent;
        }

        if ($("overallProgressBar")) {
            $("overallProgressBar").style.width = stats.percent + "%";
        }

        if ($("openedCount")) {
            $("openedCount").textContent = stats.opened;
        }

        if ($("myCompleted")) {
            $("myCompleted").textContent = stats.completed;
        }

        if ($("myOpened")) {
            $("myOpened").textContent = stats.opened;
        }

        if ($("myPercent")) {
            $("myPercent").textContent = stats.percent + "%";
        }
    }

    // ==========================================
    // CONTINUE LEARNING
    // ==========================================

    function renderContinueLearning() {
        const container = $("continueLearning");
        if (!container) return;

        const state = progressData();

        let lesson = courses().find(
            item => item.id === state.lastLesson
        );

        if (!lesson) {
            lesson = courses().find(
                item => (state.opened || []).includes(item.id)
            );
        }

        if (!lesson) {
            container.innerHTML = `
                <div class="continue-card-content">
                    <h3>Your AI journey starts here.</h3>
                    <p>Choose a tutorial and start learning.</p>

                    <button
                        type="button"
                        class="primary-button"
                        data-view="explore">
                        Explore Lessons →
                    </button>
                </div>
            `;

            return;
        }

        const progress = state.lessons?.[lesson.id] || {};

        container.innerHTML = `
            <div class="continue-card-content">
                <span class="eyebrow">PICK UP WHERE YOU LEFT OFF</span>

                <h3>${escapeHTML(lesson.title)}</h3>

                <p>${escapeHTML(lesson.description)}</p>

                <button
                    type="button"
                    class="primary-button"
                    data-open-lesson="${escapeHTML(lesson.id)}"
                    ${lesson.videoId ? "" : "disabled"}>

                    ${progress.watchedSeconds ? "Continue Lesson" : "Start Lesson"} →
                </button>
            </div>
        `;
    }

    // ==========================================
    // LEARNING ACTIVITY
    // ==========================================

    function renderActivity() {
        const container = $("activityList");
        if (!container) return;

        const state = progressData();
        const activities = state.activities || [];

        if (!activities.length) {
            container.innerHTML = `
                <div class="activity-item">
                    <div>
                        <strong>No learning activity yet</strong>
                        <p>Open a lesson to begin building your history.</p>
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML = activities.map(activity => {
            const date = new Date(activity.date);

            return `
                <article class="activity-item">
                    <div>
                        <strong>${escapeHTML(activity.title)}</strong>

                        <p>
                            ${activity.type === "completed"
                                ? "Lesson completed"
                                : "Lesson opened"
                            }
                            ·
                            ${Number.isNaN(date.getTime())
                                ? ""
                                : escapeHTML(date.toLocaleString())
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        data-open-lesson="${escapeHTML(activity.lessonId)}">
                        Review
                    </button>
                </article>
            `;
        }).join("");
    }

    // ==========================================
    // RENDER ALL APPLICATION CONTENT
    // ==========================================

    function renderEverything() {
        renderPopularLessons();
        renderAllLessons();
        renderExploreFilters();
        renderCategories();
        updateStats();
        renderContinueLearning();
        renderActivity();
    }

    // ==========================================
    // PAGE NAVIGATION
    // ==========================================

    function showView(view) {
        const section = $(view);

        if (!section || !section.classList.contains("page")) return;

        activeView = view;

        document.querySelectorAll(".page").forEach(page => {
            page.classList.toggle("active", page.id === view);
        });

        document.querySelectorAll("[data-view]").forEach(button => {
            if (button.classList.contains("nav-link")) {
                button.classList.toggle(
                    "active",
                    button.dataset.view === view
                );
            }
        });

        const title = $("pageTitle");

        if (title) {
            title.textContent = {
                dashboard: "Dashboard",
                explore: "Explore Lessons",
                "my-learning": "My Learning",
                categories: "Learning Paths"
            }[view] || "Learning Space";
        }

        $("sidebar")?.classList.remove("open");
        $("menuToggle")?.setAttribute("aria-expanded", "false");

        renderEverything();
    }

    // ==========================================
    // OPEN A LESSON
    // ==========================================

    function openLessonById(id) {
        const lesson = window.AIAfricaCourses?.getById?.(id);

        if (!lesson) {
            window.showToast("Lesson not found.");
            return;
        }

        if (!lesson.videoId) {
            window.showToast(
                "This lesson's video is not available yet."
            );
            return;
        }

        if (window.AIAfricaLessonPlayer?.open) {
            window.AIAfricaLessonPlayer.open(lesson);
        } else {
            console.error("Lesson player has not initialized.");

            window.showToast(
                "The video player is not ready. Reload and try again."
            );
        }
    }

    // ==========================================
    // DELEGATED CLICK HANDLERS
    // ==========================================

    document.addEventListener("click", event => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const viewButton = target.closest("[data-view]");

        if (viewButton) {
            event.preventDefault();
            showView(viewButton.dataset.view);
            return;
        }

        const lessonButton = target.closest("[data-open-lesson]");

        if (lessonButton) {
            event.preventDefault();

            if (lessonButton.disabled) return;

            openLessonById(lessonButton.dataset.openLesson);
            return;
        }

        const quickFilter = target.closest(
            "#quickFilters [data-category]"
        );

        if (quickFilter) {
            activeCategory = quickFilter.dataset.category;

            document.querySelectorAll(
                "#quickFilters [data-category]"
            ).forEach(button => {
                button.classList.toggle(
                    "active",
                    button === quickFilter
                );
            });

            renderPopularLessons();
            return;
        }

        const exploreFilter = target.closest(
            "[data-explore-category]"
        );

        if (exploreFilter) {
            activeCategory = exploreFilter.dataset.exploreCategory;
            renderEverything();
            return;
        }

        const pathButton = target.closest("[data-path-category]");

        if (pathButton) {
            activeCategory = pathButton.dataset.pathCategory;
            activeSearch = "";
            activeLevel = "All";

            if ($("lessonSearch")) $("lessonSearch").value = "";
            if ($("levelFilter")) $("levelFilter").value = "All";

            showView("explore");
        }
    });

    // ==========================================
    // SEARCH AND FILTERS
    // ==========================================

    $("lessonSearch")?.addEventListener("input", event => {
        activeSearch = event.target.value.trim();
        renderAllLessons();
    });

    $("levelFilter")?.addEventListener("change", event => {
        activeLevel = event.target.value;
        renderAllLessons();
    });

    // ==========================================
    // LEARNING PROGRESS CONTROLS
    // ==========================================

    function clearLearningProgress(successMessage) {
        const user = window.AIAfricaAuth?.getCurrentUser?.();

        if (!user) {
            window.AIAfricaAuth?.openModal?.("signin");
            return;
        }

        if (!confirm("Clear all saved learning activity and progress?")) {
            return;
        }

        window.AIAfricaProgress?.clearProgress?.();

        renderEverything();
        window.showToast(successMessage);
    }

    $("clearActivity")?.addEventListener("click", () => {
        clearLearningProgress("Learning activity cleared.");
    });

    $("resetProgress")?.addEventListener("click", () => {
        clearLearningProgress("Learning progress reset.");
    });

    // ==========================================
    // MOBILE SIDEBAR MENU
    // ==========================================

    const menuButton = $("menuToggle");
    const sidebar = $("sidebar");

    if (menuButton && sidebar) {
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = sidebar.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        document.addEventListener("click", event => {
            if (
                sidebar.classList.contains("open") &&
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                sidebar.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                sidebar.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    // ==========================================
    // HERO CAROUSEL
    // ==========================================

    function showHero(index) {
        const slides = Array.from(
            document.querySelectorAll("#heroTrack .hero-slide")
        );

        const dots = Array.from(
            document.querySelectorAll("#heroCarousel .hero-dot")
        );

        if (!slides.length) return;

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === heroIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === heroIndex);
        });
    }

    function restartHeroTimer() {
        clearInterval(heroTimer);

        const slides = document.querySelectorAll(
            "#heroTrack .hero-slide"
        );

        if (slides.length < 2) return;

        heroTimer = setInterval(() => {
            showHero(heroIndex + 1);
        }, 7000);
    }

    window.changeHero = direction => {
        showHero(heroIndex + direction);
        restartHeroTimer();
    };

    window.goToHero = index => {
        showHero(index);
        restartHeroTimer();
    };

    // ==========================================
    // COMPETITION MODALS
    // Create-thon = creative AI
    // Hackathon = technical AI innovation
    // ==========================================

    function initializeEventModal() {
        const modal = $("applyModal");
        if (!modal) return;

        const title = $("applyTitle");
        const description =
            $("applyDescription") || $("applyMessage") ||
            modal.querySelector("p");

        const icon =
            $("applyIcon") || modal.querySelector(".modal-icon");

        const eyebrow = $("applyEyebrow");
        const highlights = $("applyHighlights");
        const actionButton = modal.querySelector(".modal-ok-btn");

        const programs = {
            creathon: {
                icon: "🎬",
                eyebrow: "AI AFRICA · CREATIVE LEARNING JOURNEY",
                title: "Create. Tell Stories. Earn Badges.",
                description:
                    "Do you dream of creating amazing AI videos, animations, cinematic scenes, and digital stories? Start learning on AI Africa Learning Hub, complete creative technology lessons, and earn learning badges as you develop your skills. Build your creative portfolio and work towards qualifying for the AI Video Create-thon 2026.",
                highlights: [
                    "Learn AI video creation and digital storytelling",
                    "Explore animation, cinematic scenes, and creative AI tools",
                    "Complete lessons and earn learning badges",
                    "Develop your creative portfolio and work towards Create-thon qualification"
                ],
                buttonText: "Start Creating"
            },

            hackathon: {
                icon: "🤖",
                eyebrow: "AI AFRICA · INNOVATION LEARNING JOURNEY",
                title: "Build Solutions. Earn Badges. Innovate.",
                description:
                    "Have an idea that could solve a real-world problem? Learn how to use AI and technology to turn ideas into practical digital solutions. Complete technical lessons on AI Africa Learning Hub, earn learning badges, strengthen your problem-solving skills, and work towards qualifying for the Build with AI Hackathon 2026.",
                highlights: [
                    "Learn AI concepts and practical technology skills",
                    "Explore app development, automation, and AI-powered solutions",
                    "Complete technical lessons and earn learning badges",
                    "Develop your project ideas and work towards Hackathon qualification"
                ],
                buttonText: "Start Building"
            }
        };

        let previouslyFocusedElement = null;

        function renderHighlights(items) {
            if (!highlights) return;

            highlights.replaceChildren();

            items.forEach((text, index) => {
                const row = document.createElement("div");
                row.className = "event-highlight";

                const symbol = document.createElement("span");
                symbol.setAttribute("aria-hidden", "true");
                symbol.textContent = ["✦", "◈", "↗"][index % 3];

                const label = document.createElement("span");
                label.textContent = text;

                row.append(symbol, label);
                highlights.appendChild(row);
            });
        }

        function getProgramKey(programKey, trigger) {
            if (
                programKey === "creathon" ||
                programKey === "hackathon"
            ) {
                return programKey;
            }

            // If a button is clicked inside a programme slide,
            // identify the programme from that slide.
            const triggerElement =
                trigger instanceof Element ? trigger : null;

            const slide = triggerElement?.closest(
                ".event-slide, [data-program]"
            );

            const slideText = (
                slide?.textContent ||
                document.querySelector(".event-slide.active")?.textContent ||
                ""
            ).toLowerCase();

            const explicitProgram =
                slide?.dataset?.program?.toLowerCase();

            if (
                explicitProgram === "hackathon" ||
                slideText.includes("hackathon") ||
                slideText.includes("build with ai")
            ) {
                return "hackathon";
            }

            return "creathon";
        }

        function openProgram(programKey, trigger) {
            const key = getProgramKey(programKey, trigger);
            const program = programs[key];

            previouslyFocusedElement =
                trigger instanceof HTMLElement
                    ? trigger
                    : document.activeElement;

            if (icon) icon.textContent = program.icon;
            if (eyebrow) eyebrow.textContent = program.eyebrow;
            if (title) title.textContent = program.title;

            if (description) {
                description.textContent = program.description;
            }

            renderHighlights(program.highlights);

            if (actionButton) {
                const buttonLabel = actionButton.querySelector(
                    "[data-modal-button-label]"
                );

                if (buttonLabel) {
                    buttonLabel.textContent = program.buttonText;
                } else {
                    // Keep any existing icon and update the button text.
                    const textNode = Array.from(actionButton.childNodes)
                        .find(node =>
                            node.nodeType === Node.TEXT_NODE &&
                            node.textContent.trim()
                        );

                    if (textNode) {
                        textNode.textContent = ` ${program.buttonText} `;
                    } else if (!actionButton.querySelector("svg, img")) {
                        actionButton.textContent = program.buttonText;
                    }
                }
            }

            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            modal.querySelector(".modal-close")?.focus();
        }

        // Support both applyForEvent() and applyForEvent('hackathon').
        window.applyForEvent = function (programKey) {
            const trigger =
                document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;

            openProgram(programKey, trigger);
        };

        window.closeApplyModal = function () {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";

            if (previouslyFocusedElement instanceof HTMLElement) {
                previouslyFocusedElement.focus();
            }
        };

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                window.closeApplyModal();
            }
        });

        modal.querySelector(".modal-close")?.addEventListener(
            "click",
            window.closeApplyModal
        );

        actionButton?.addEventListener("click", () => {
            window.closeApplyModal();

            if ($("explore")?.classList.contains("page")) {
                showView("explore");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !modal.hidden) {
                window.closeApplyModal();
            }
        });
    }

    // ==========================================
    // FOOTER YEAR
    // ==========================================

    function updateFooterYear() {
        if ($("year")) {
            $("year").textContent = new Date().getFullYear();
        }
    }

    // ==========================================
    // AUTHENTICATION UPDATES
    // ==========================================

    window.addEventListener("aiAfricaAuthChanged", () => {
        window.AIAfricaAuth?.updateNavigation?.();
        renderEverything();
    });

    // ==========================================
    // OPEN LESSON REQUESTED BY URL
    // ==========================================

    function openRequestedLesson() {
        const params = new URLSearchParams(window.location.search);
        const lessonId = params.get("lesson");

        if (!lessonId) return;

        const lesson = window.AIAfricaCourses?.getById?.(lessonId);

        if (lesson) {
            showView("explore");
            openLessonById(lessonId);
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function initialize() {
        initializeEventModal();
        updateFooterYear();

        renderEverything();
        showView("dashboard");

        if (
            document.querySelectorAll(
                "#heroTrack .hero-slide"
            ).length > 1
        ) {
            restartHeroTimer();
        }

        setTimeout(openRequestedLesson, 500);

        console.info("AI Africa Learning Hub initialized.");
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();