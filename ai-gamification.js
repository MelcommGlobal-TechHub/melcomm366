/* ==========================================
   AI AFRICA — GAMIFIED LEARNING SYSTEM
   Separate module; preserves learning-core.js
   ========================================== */

(() => {
    "use strict";

    const STORAGE_PREFIX = "aiAfricaGamification_v1:";
    const QUIZ_SIZE = 3;
    const REQUIRED_SCORE = 3;

    let activeQuiz = null;
    let quizModal = null;
    let milestoneModal = null;
    let previousCompletedCount = 0;

    /* ==========================================
       USER AND STORAGE
       ========================================== */

    function getUser() {
        return window.AIAfricaProgress
            ?.getCurrentUser?.() || null;
    }

    function getStorageKey() {
        const user = getUser();

        if (!user?.email) return null;

        return STORAGE_PREFIX +
            user.email.trim().toLowerCase();
    }

    function blankState() {
        return {
            quizzesPassed: [],
            quizzesFailed: [],
            badges: [],
            seenMilestones: [],
            quizCount: 0,
            premium: {
                active: false,
                plan: null,
                status: "inactive"
            }
        };
    }

    function loadState() {
        const key = getStorageKey();

        if (!key) return blankState();

        try {
            const stored = JSON.parse(
                localStorage.getItem(key) || "null"
            );

            return {
                ...blankState(),
                ...(stored && typeof stored === "object"
                    ? stored
                    : {}),
                premium: {
                    ...blankState().premium,
                    ...(stored?.premium || {})
                }
            };
        } catch (error) {
            console.error(
                "AI Africa: Could not load game progress.",
                error
            );

            return blankState();
        }
    }

    function saveState(state) {
        const key = getStorageKey();

        if (!key) return false;

        try {
            localStorage.setItem(
                key,
                JSON.stringify(state)
            );

            return true;
        } catch (error) {
            console.error(
                "AI Africa: Could not save game progress.",
                error
            );

            return false;
        }
    }

    /* ==========================================
       QUESTION BANK
       Add more questions as the platform grows.
       ========================================== */

    const QUESTION_BANK = [
        {
            id: "ai-001",
            topic: "AI Fundamentals",
            question: "What is Artificial Intelligence?",
            options: [
                "A method of storing files only",
                "Technology that enables machines to perform tasks associated with intelligence",
                "A type of computer monitor",
                "A programming language used only for websites"
            ],
            answer: 1,
            explanation:
                "AI enables computer systems to perform tasks such as reasoning, learning, perception, and language processing."
        },
        {
            id: "ai-002",
            topic: "Machine Learning",
            question: "What is machine learning?",
            options: [
                "Teaching computers exclusively through manual rules",
                "A technique that enables systems to learn patterns from data",
                "A way to repair computer hardware",
                "A method of increasing internet speed"
            ],
            answer: 1,
            explanation:
                "Machine learning uses data to train models to identify patterns and make predictions or decisions."
        },
        {
            id: "ai-003",
            topic: "Generative AI",
            question: "What can generative AI produce?",
            options: [
                "Only spreadsheet formulas",
                "Only computer hardware",
                "New content such as text, images, audio, and code",
                "Electricity without any equipment"
            ],
            answer: 2,
            explanation:
                "Generative AI models can create new content based on patterns learned during training."
        },
        {
            id: "ai-004",
            topic: "Prompt Engineering",
            question: "Which prompt is generally most useful for a complex task?",
            options: [
                "A vague instruction with no context",
                "A clear instruction with context and the desired output",
                "A blank message",
                "A message containing unrelated symbols"
            ],
            answer: 1,
            explanation:
                "Clear instructions, relevant context, and a defined output help an AI system respond more usefully."
        },
        {
            id: "ai-005",
            topic: "Computer Vision",
            question: "What is computer vision mainly concerned with?",
            options: [
                "Helping computers interpret images and videos",
                "Improving keyboard colours",
                "Creating electricity",
                "Managing passwords exclusively"
            ],
            answer: 0,
            explanation:
                "Computer vision enables systems to analyse visual information such as images and videos."
        },
        {
            id: "ai-006",
            topic: "Natural Language Processing",
            question: "What is Natural Language Processing (NLP)?",
            options: [
                "A method for cooling processors",
                "A system for designing keyboards",
                "AI techniques for processing human language",
                "A type of computer battery"
            ],
            answer: 2,
            explanation:
                "NLP helps computers process, interpret, and generate human language."
        },
        {
            id: "ai-007",
            topic: "AI Ethics",
            question: "What is one important way to reduce harmful AI bias?",
            options: [
                "Ignore all errors",
                "Use representative data and evaluate results for bias",
                "Remove all human oversight",
                "Assume every AI result is correct"
            ],
            answer: 1,
            explanation:
                "Representative data, careful evaluation, and human oversight can help identify and reduce bias."
        },
        {
            id: "ai-008",
            topic: "Robotics",
            question: "How can AI support robotics?",
            options: [
                "By helping robots interpret sensor data and make decisions",
                "By making every robot independent of electricity",
                "By eliminating all mechanical components",
                "By preventing robots from collecting information"
            ],
            answer: 0,
            explanation:
                "AI can help robots perceive their surroundings, plan actions, and respond to changing conditions."
        },
        {
            id: "ai-009",
            topic: "Data Science",
            question: "Why is data quality important in AI?",
            options: [
                "It has no effect on results",
                "It guarantees every prediction is correct",
                "Poor-quality data can lead to unreliable results",
                "It replaces the need for model testing"
            ],
            answer: 2,
            explanation:
                "Incomplete, inaccurate, or biased data can produce unreliable AI outputs."
        },
        {
            id: "ai-010",
            topic: "AI Safety",
            question: "What should a user do with important AI-generated advice?",
            options: [
                "Accept it without checking",
                "Verify important claims using reliable sources",
                "Assume the system cannot make mistakes",
                "Share it without considering consequences"
            ],
            answer: 1,
            explanation:
                "AI systems can make mistakes, so important claims should be verified before they are relied upon."
        },
        {
            id: "ai-011",
            topic: "Neural Networks",
            question: "What is a neural network inspired by?",
            options: [
                "Connections and information processing in biological nervous systems",
                "The design of office furniture",
                "A computer's screen resolution",
                "A filing cabinet"
            ],
            answer: 0,
            explanation:
                "Artificial neural networks use connected computational units inspired in a simplified way by biological neurons."
        },
        {
            id: "ai-012",
            topic: "AI in Agriculture",
            question: "How can AI help farmers?",
            options: [
                "By guaranteeing that weather never changes",
                "By removing the need for all farm management",
                "By analysing crop images and supporting decisions",
                "By making soil testing unnecessary in every situation"
            ],
            answer: 2,
            explanation:
                "AI can analyse crop images, weather data, and other information to support agricultural decisions."
        },
        {
            id: "ai-013",
            topic: "AI in Healthcare",
            question: "What is a responsible use of AI in healthcare?",
            options: [
                "Allowing AI to replace all clinical judgement",
                "Using AI as a decision-support tool with appropriate professional oversight",
                "Ignoring patient privacy",
                "Treating every AI output as a confirmed diagnosis"
            ],
            answer: 1,
            explanation:
                "AI may support healthcare professionals, but clinical decisions require appropriate expertise and oversight."
        },
        {
            id: "ai-014",
            topic: "Cybersecurity",
            question: "How can AI contribute to cybersecurity?",
            options: [
                "By helping detect unusual activity and potential threats",
                "By making every password unnecessary",
                "By guaranteeing that attacks never occur",
                "By disabling every security control"
            ],
            answer: 0,
            explanation:
                "AI systems can analyse patterns to help identify suspicious behaviour and potential security threats."
        },
        {
            id: "ai-015",
            topic: "AI and Education",
            question: "What is a responsible way to use AI for learning?",
            options: [
                "Submit every AI answer without understanding it",
                "Avoid checking the accuracy of explanations",
                "Use AI for explanations and practice, then verify and understand the material",
                "Let AI make every educational decision"
            ],
            answer: 2,
            explanation:
                "AI can support learning when learners evaluate its output and develop their own understanding."
        },
        {
            id: "ai-016",
            topic: "AI in Business",
            question: "How can AI support a business?",
            options: [
                "By guaranteeing unlimited profits",
                "By assisting with analysis, automation, and customer support",
                "By removing every business risk",
                "By making customer feedback irrelevant"
            ],
            answer: 1,
            explanation:
                "AI can assist with repetitive tasks, data analysis, and customer interactions, but outcomes still require evaluation."
        }
    ];

    /* ==========================================
       BADGE DEFINITIONS
       ========================================== */

    const BADGES = [
        {
            id: "ai-explorer",
            title: "AI Explorer",
            icon: "✦",
            description: "Passed your first AI quiz."
        },
        {
            id: "ai-learner",
            title: "AI Skills Builder",
            icon: "◆",
            description: "Passed three AI quizzes."
        },
        {
            id: "ai-champion",
            title: "AI Knowledge Champion",
            icon: "🏆",
            description: "Passed five AI quizzes."
        },
        {
            id: "ai-master",
            title: "AI Africa Master Learner",
            icon: "🎓",
            description: "Reached 100% recorded learning progress."
        }
    ];

    /* ==========================================
       RANDOM QUESTION SELECTION
       ========================================== */

    function shuffle(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] =
                [result[j], result[i]];
        }

        return result;
    }

    function selectQuestions() {
        const state = loadState();

        // Avoid repeating questions within the same quiz.
        // Prefer questions not used in recent quizzes.
        const recentIds = new Set(
            state.recentQuestionIds || []
        );

        let available = QUESTION_BANK.filter(
            question => !recentIds.has(question.id)
        );

        if (available.length < QUIZ_SIZE) {
            available = [...QUESTION_BANK];
        }

        const questions = shuffle(available)
            .slice(0, QUIZ_SIZE)
            .map(question => ({
                ...question,
                options: question.options.map(
                    (text, index) => ({
                        text,
                        originalIndex: index
                    })
                )
            }))
            .map(question => {
                const shuffledOptions = shuffle(
                    question.options
                );

                const correctIndex = shuffledOptions.findIndex(
                    option =>
                        option.originalIndex === question.answer
                );

                return {
                    ...question,
                    options: shuffledOptions.map(
                        option => option.text
                    ),
                    answer: correctIndex
                };
            });

        state.recentQuestionIds = [
            ...(state.recentQuestionIds || []),
            ...questions.map(question => question.id)
        ].slice(-Math.max(3, Math.floor(QUESTION_BANK.length / 2)));

        saveState(state);

        return questions;
    }

    /* ==========================================
       QUIZ MODAL
       ========================================== */

    function closeQuiz() {
        quizModal?.remove();
        quizModal = null;
        activeQuiz = null;
    }

    function startQuiz() {
        if (!window.AIAfricaProgress?.isAuthenticated?.()) {
            window.AIAfricaProgress?.showAccessModal?.({
                title: "Sign In to Play and Learn",
                message:
                    "Sign in to take AI quizzes, earn badges, " +
                    "and save your learning achievements."
            });

            return;
        }

        if (quizModal) return;

        activeQuiz = {
            questions: selectQuestions(),
            answers: {},
            submitted: false
        };

        renderQuiz();
    }

    function renderQuiz() {
        quizModal?.remove();

        quizModal = document.createElement("div");
        quizModal.className = "aag-overlay";
        quizModal.id = "aagQuizModal";

        const questionsHTML = activeQuiz.questions
            .map((question, questionIndex) => `
                <fieldset class="aag-question">
                    <legend>
                        <span class="aag-question-number">
                            QUESTION ${questionIndex + 1}
                        </span>
                        <span class="aag-topic">
                            ${escapeHTML(question.topic)}
                        </span>
                        <strong>
                            ${escapeHTML(question.question)}
                        </strong>
                    </legend>

                    <div class="aag-options">
                        ${question.options.map(
                            (option, optionIndex) => `
                                <label
                                    class="aag-option"
                                    data-question="${questionIndex}"
                                    data-option="${optionIndex}"
                                >
                                    <input
                                        type="radio"
                                        name="aag-question-${questionIndex}"
                                        value="${optionIndex}"
                                    >
                                    <span class="aag-option-letter">
                                        ${String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <span>
                                        ${escapeHTML(option)}
                                    </span>
                                </label>
                            `
                        ).join("")}
                    </div>

                    <div
                        class="aag-explanation"
                        id="aagExplanation${questionIndex}"
                        hidden
                    ></div>
                </fieldset>
            `).join("");

        quizModal.innerHTML = `
            <section
                class="aag-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aagQuizTitle"
            >
                <button
                    type="button"
                    class="aag-close"
                    aria-label="Close quiz"
                >&times;</button>

                <div class="aag-eyebrow">
                    AI AFRICA · KNOWLEDGE CHALLENGE
                </div>

                <h2 id="aagQuizTitle">
                    Test Your AI Knowledge
                </h2>

                <p class="aag-intro">
                    Answer all three randomly selected questions.
                    Get 3/3 correct to earn your quiz badge.
                </p>

                <div class="aag-progress-track">
                    <div
                        class="aag-progress-fill"
                        style="width:0%"
                    ></div>
                </div>

                <div class="aag-questions">
                    ${questionsHTML}
                </div>

                <div
                    class="aag-result"
                    id="aagQuizResult"
                    role="status"
                    hidden
                ></div>

                <div class="aag-actions">
                    <button
                        type="button"
                        class="aag-primary"
                        id="aagSubmit"
                    >
                        Submit Answers
                    </button>

                    <button
                        type="button"
                        class="aag-secondary"
                        id="aagRetry"
                        hidden
                    >
                        Try Another Quiz
                    </button>
                </div>

                <p class="aag-footer">
                    Your answers will be checked when you submit.
                </p>
            </section>
        `;

        document.body.appendChild(quizModal);

        quizModal.querySelector(".aag-close")
            .addEventListener("click", closeQuiz);

        quizModal.addEventListener("click", event => {
            if (event.target === quizModal) {
                closeQuiz();
            }
        });

        quizModal.querySelectorAll('input[type="radio"]')
            .forEach(input => {
                input.addEventListener("change", () => {
                    const answered = Object.keys(
                        getCurrentAnswers()
                    ).length;

                    const fill = quizModal.querySelector(
                        ".aag-progress-fill"
                    );

                    fill.style.width =
                        (answered / QUIZ_SIZE * 100) + "%";
                });
            });

        quizModal.querySelector("#aagSubmit")
            .addEventListener("click", submitQuiz);

        quizModal.querySelector("#aagRetry")
            .addEventListener("click", () => {
                closeQuiz();
                startQuiz();
            });
    }

    function getCurrentAnswers() {
        const answers = {};

        if (!quizModal) return answers;

        activeQuiz.questions.forEach(
            (question, questionIndex) => {
                const selected = quizModal.querySelector(
                    `input[name="aag-question-${questionIndex}"]:checked`
                );

                if (selected) {
                    answers[questionIndex] =
                        Number(selected.value);
                }
            }
        );

        return answers;
    }

    /* ==========================================
       SUBMIT QUIZ AND DISPLAY CORRECT ANSWERS
       ========================================== */

    function submitQuiz() {
        if (!activeQuiz || activeQuiz.submitted) return;

        const answers = getCurrentAnswers();

        if (Object.keys(answers).length < QUIZ_SIZE) {
            alert(
                "Please select an answer for all three questions."
            );
            return;
        }

        activeQuiz.submitted = true;
        activeQuiz.answers = answers;

        let score = 0;

        activeQuiz.questions.forEach(
            (question, questionIndex) => {
                const selected = answers[questionIndex];
                const correct = selected === question.answer;

                if (correct) score++;

                const options = quizModal.querySelectorAll(
                    `[data-question="${questionIndex}"]`
                );

                options.forEach(option => {
                    const optionIndex =
                        Number(option.dataset.option);

                    option.classList.add("aag-disabled");

                    const input = option.querySelector("input");
                    input.disabled = true;

                    if (optionIndex === question.answer) {
                        option.classList.add("aag-correct");
                    } else if (optionIndex === selected) {
                        option.classList.add("aag-incorrect");
                    }
                });

                const explanation = quizModal.querySelector(
                    `#aagExplanation${questionIndex}`
                );

                explanation.hidden = false;
                explanation.innerHTML = `
                    <strong>
                        ${correct
                            ? "✓ Correct answer"
                            : "✗ Incorrect answer"}
                    </strong>
                    <p>
                        Correct answer:
                        ${escapeHTML(
                            question.options[question.answer]
                        )}
                    </p>
                    <p>
                        ${escapeHTML(question.explanation)}
                    </p>
                `;
            }
        );

        recordQuizResult(score);

        const result = quizModal.querySelector("#aagQuizResult");
        result.hidden = false;

        if (score === REQUIRED_SCORE) {
            result.className = "aag-result aag-result-success";
            result.innerHTML = `
                <div class="aag-result-icon">🏆</div>
                <h3>Perfect Score! 3/3</h3>
                <p>You passed this quiz and earned an achievement badge.</p>
            `;
        } else {
            result.className = "aag-result aag-result-retry";
            result.innerHTML = `
                <div class="aag-result-icon">📘</div>
                <h3>You scored ${score}/3</h3>
                <p>Review the explanations and try another quiz.</p>
            `;
        }

        quizModal.querySelector("#aagSubmit").hidden = true;
        quizModal.querySelector("#aagRetry").hidden = false;

        const fill = quizModal.querySelector(".aag-progress-fill");
        fill.style.width = "100%";
    }

    /* ==========================================
       RECORD RESULTS AND AWARD BADGES
       ========================================== */

    function recordQuizResult(score) {
        const state = loadState();

        state.quizCount++;

        const result = {
            id: "quiz-" + state.quizCount,
            score,
            total: QUIZ_SIZE,
            date: new Date().toISOString(),
            questionIds: activeQuiz.questions.map(
                question => question.id
            )
        };

        state.quizHistory = [
            ...(state.quizHistory || []),
            result
        ].slice(-100);

        if (score === REQUIRED_SCORE) {
            state.quizzesPassed.push(result.id);
        } else {
            state.quizzesFailed.push(result.id);
        }

        awardEligibleBadges(state);
        saveState(state);

        document.dispatchEvent(
            new CustomEvent("aiafrica:quizCompleted", {
                detail: {
                    score,
                    total: QUIZ_SIZE,
                    passed: score === REQUIRED_SCORE,
                    result
                }
            })
        );
    }

    function awardBadge(state, badgeId) {
        if (state.badges.includes(badgeId)) return;

        state.badges.push(badgeId);

        const badge = BADGES.find(
            item => item.id === badgeId
        );

        if (badge) {
            window.setTimeout(() => {
                showBadgeToast(badge);
            }, 300);
        }
    }

    function awardEligibleBadges(state) {
        const passed = state.quizzesPassed.length;

        if (passed >= 1) {
            awardBadge(state, "ai-explorer");
        }

        if (passed >= 3) {
            awardBadge(state, "ai-learner");
        }

        if (passed >= 5) {
            awardBadge(state, "ai-champion");
        }

        const stats = window.AIAfricaProgress
            ?.getStats?.();

        if (stats?.percent >= 100) {
            awardBadge(state, "ai-master");
        }
    }

    function showBadgeToast(badge) {
        const oldToast = document.getElementById(
            "aagBadgeToast"
        );

        oldToast?.remove();

        const toast = document.createElement("div");
        toast.id = "aagBadgeToast";
        toast.className = "aag-badge-toast";

        toast.innerHTML = `
            <div class="aag-toast-icon">
                ${escapeHTML(badge.icon)}
            </div>
            <div>
                <div class="aag-toast-label">
                    BADGE UNLOCKED
                </div>
                <strong>${escapeHTML(badge.title)}</strong>
                <p>${escapeHTML(badge.description)}</p>
            </div>
            <button
                type="button"
                aria-label="Dismiss badge notification"
            >&times;</button>
        `;

        document.body.appendChild(toast);

        toast.querySelector("button")
            .addEventListener("click", () => toast.remove());

        window.setTimeout(() => toast.remove(), 6500);
    }

    /* ==========================================
       FINAL MILESTONE AND PREMIUM MODAL
       ========================================== */

    function checkLearningMilestone() {
        if (!window.AIAfricaProgress?.isAuthenticated?.()) {
            return;
        }

        const stats = window.AIAfricaProgress.getStats();

        if (!stats.total || stats.percent < 100) return;

        const state = loadState();

        if (state.seenMilestones.includes("final-exam")) {
            return;
        }

        awardEligibleBadges(state);

        state.seenMilestones.push("final-exam");
        saveState(state);

        window.setTimeout(showFinalExamModal, 500);
    }

    function showFinalExamModal() {
        if (milestoneModal) return;

        milestoneModal = document.createElement("div");
        milestoneModal.className = "aag-overlay";
        milestoneModal.id = "aagFinalExamModal";

        milestoneModal.innerHTML = `
            <section
                class="aag-card aag-milestone-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aagMilestoneTitle"
            >
                <button
                    type="button"
                    class="aag-close"
                    aria-label="Close dialog"
                >&times;</button>

                <div class="aag-celebration">🎓 🏆 ✨</div>

                <div class="aag-eyebrow">
                    LEARNING MILESTONE UNLOCKED
                </div>

                <h2 id="aagMilestoneTitle">
                    Congratulations, AI Africa Learner!
                </h2>

                <p class="aag-intro">
                    You've reached 100% of the learning progress
                    tracked by this platform.
                </p>

                <div class="aag-prize-panel">
                    <span>COMPETITION OPPORTUNITY</span>
                    <strong>Share from $75,000</strong>
                    <p>
                        Explore hackathon and Create-thon
                        opportunities and prepare for the final exam.
                    </p>
                </div>

                <p class="aag-disclaimer">
                    The prize pool and eligibility are subject to
                    confirmation by programme organisers. Passing
                    this platform's exam or purchasing a subscription
                    does not guarantee competition entry, selection,
                    or a prize.
                </p>

                <button
                    type="button"
                    class="aag-primary"
                    id="aagTakeFinalExam"
                >
                    Take Final Exam →
                </button>

                <button
                    type="button"
                    class="aag-secondary"
                    id="aagViewPlans"
                >
                    View Premium Plans
                </button>
            </section>
        `;

        document.body.appendChild(milestoneModal);

        milestoneModal.querySelector(".aag-close")
            .addEventListener("click", closeMilestoneModal);

        milestoneModal.addEventListener("click", event => {
            if (event.target === milestoneModal) {
                closeMilestoneModal();
            }
        });

        milestoneModal.querySelector("#aagTakeFinalExam")
            .addEventListener("click", () => {
                closeMilestoneModal();
                showSubscriptionModal();
            });

        milestoneModal.querySelector("#aagViewPlans")
            .addEventListener("click", () => {
                closeMilestoneModal();
                showSubscriptionModal();
            });
    }

    function closeMilestoneModal() {
        milestoneModal?.remove();
        milestoneModal = null;
    }

    /* ==========================================
       PREMIUM PLAN MODAL
       ========================================== */

    const PLANS = [
        {
            id: "starter",
            name: "Starter",
            price: 3,
            features: [
                "Premium learning resources",
                "Learning progress insights"
            ]
        },
        {
            id: "explorer",
            name: "Explorer",
            price: 7,
            features: [
                "Additional AI quizzes",
                "Learning progress insights"
            ]
        },
        {
            id: "creator",
            name: "Creator",
            price: 12,
            features: [
                "Advanced AI learning pathways",
                "Additional practice activities"
            ]
        },
        {
            id: "pro",
            name: "Pro Learner",
            price: 19,
            features: [
                "Advanced learning resources",
                "Mock exam preparation"
            ]
        },
        {
            id: "ultimate",
            name: "Ultimate",
            price: 29,
            features: [
                "All premium learning features",
                "Final-exam access after payment verification"
            ]
        }
    ];

    function showSubscriptionModal() {
        document.getElementById("aagPlansModal")?.remove();

        const overlay = document.createElement("div");
        overlay.id = "aagPlansModal";
        overlay.className = "aag-overlay";

        overlay.innerHTML = `
            <section
                class="aag-card aag-plans-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aagPlansTitle"
            >
                <button
                    type="button"
                    class="aag-close"
                    aria-label="Close dialog"
                >&times;</button>

                <div class="aag-eyebrow">AI AFRICA PREMIUM</div>

                <h2 id="aagPlansTitle">
                    Choose Your Learning Plan
                </h2>

                <p class="aag-intro">
                    Select a plan to explore premium learning features.
                </p>

                <div class="aag-plan-grid">
                    ${PLANS.map(plan => `
                        <article class="aag-plan">
                            <h3>${escapeHTML(plan.name)}</h3>

                            <div class="aag-plan-price">
                                $${plan.price}
                                <span>/ month</span>
                            </div>

                            <ul>
                                ${plan.features.map(feature => `
                                    <li>
                                        <span>✓</span>
                                        ${escapeHTML(feature)}
                                    </li>
                                `).join("")}
                            </ul>

                            <button
                                type="button"
                                class="aag-primary aag-select-plan"
                                data-plan="${escapeHTML(plan.id)}"
                            >
                                Choose Plan
                            </button>
                        </article>
                    `).join("")}
                </div>

                <p class="aag-disclaimer">
                    Subscription plans are proposals until payment
                    processing and premium entitlements are configured.
                    A plan selection alone does not confirm payment
                    or unlock the final exam.
                </p>
            </section>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector(".aag-close")
            .addEventListener("click", () => overlay.remove());

        overlay.addEventListener("click", event => {
            if (event.target === overlay) overlay.remove();
        });

        overlay.querySelectorAll(".aag-select-plan")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const plan = PLANS.find(
                        item => item.id === button.dataset.plan
                    );

                    if (plan) {
                        handlePlanSelection(plan);
                    }
                });
            });
    }

    function handlePlanSelection(plan) {
        /*
         * Do not unlock paid features here.
         * A real backend/payment provider must verify payment first.
         */

        document.dispatchEvent(
            new CustomEvent("aiafrica:subscriptionRequested", {
                detail: {
                    planId: plan.id,
                    planName: plan.name,
                    amountUSD: plan.price
                }
            })
        );

        alert(
            `${plan.name} selected at $${plan.price}/month.\n\n` +
            "Payment integration is not connected yet. " +
            "Your account has not been charged, and premium access " +
            "has not been activated."
        );
    }

    /* ==========================================
       PROGRESS WATCHER
       ========================================== */

    function checkForNewCompletions() {
        if (!window.AIAfricaProgress?.isAuthenticated?.()) {
            previousCompletedCount = 0;
            return;
        }

        const stats = window.AIAfricaProgress.getStats();

        if (stats.completed > previousCompletedCount) {
            const previousThreshold =
                Math.floor(previousCompletedCount / 3);

            const currentThreshold =
                Math.floor(stats.completed / 3);

            previousCompletedCount = stats.completed;

            if (currentThreshold > previousThreshold) {
                startQuiz();
            }
        } else {
            previousCompletedCount = stats.completed;
        }

        checkLearningMilestone();
    }

    function refreshProgressBaseline() {
        const stats = window.AIAfricaProgress?.getStats?.();

        previousCompletedCount = stats?.completed || 0;
    }

    /* ==========================================
       HELPERS
       ========================================== */

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    /* ==========================================
       INITIALIZATION
       ========================================== */

    function init() {
        if (!window.AIAfricaProgress) {
            console.warn(
                "AI Africa Gamification: learning-core.js " +
                "must load before ai-gamification.js."
            );
            return;
        }

        refreshProgressBaseline();

        /*
         * The progress core stores progress in localStorage.
         * Polling lets this separate module detect changes without
         * rewriting the existing progress functions.
         */
        window.setInterval(checkForNewCompletions, 1500);

        document.addEventListener(
            "aiafrica:lessonCompleted",
            checkForNewCompletions
        );

        document.addEventListener(
            "aiafrica:progressUpdated",
            checkForNewCompletions
        );

        window.AIAfricaGamification = {
            startQuiz,
            showSubscriptionModal,
            showFinalExamModal,
            getBadges: () => {
                const state = loadState();

                return BADGES.filter(
                    badge => state.badges.includes(badge.id)
                );
            },
            getState: loadState,
            getPlans: () => [...PLANS]
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();