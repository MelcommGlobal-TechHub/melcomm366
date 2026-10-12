<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sign In or Create Account | AI Africa</title>

    <meta
        name="description"
        content="Sign in to AI Africa or create a demo account to access your learning dashboard."
    >

    <meta name="theme-color" content="#0b1512">

    <style>
        :root {
            --bg: #0b1512;
            --surface: #13211c;
            --green: #20d6a0;
            --text: #f4faf6;
            --muted: #a0b4aa;
            --border: rgba(255,255,255,.1);
        }

        * {
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            background:
                radial-gradient(
                    ellipse at top left,
                    rgba(32,214,160,.1),
                    transparent 45%
                ),
                var(--bg);
            color: var(--text);
            font-family: Inter, Arial, sans-serif;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        button,
        input {
            font: inherit;
        }

        [hidden] {
            display: none !important;
        }

        .topbar {
            min-height: 70px;
            padding: 0 6%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            border-bottom: 1px solid var(--border);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -.7px;
        }

        .brand-symbol {
            width: 37px;
            height: 37px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: var(--green);
            color: #06251b;
            font-size: 21px;
        }

        .brand-name span {
            color: var(--green);
        }

        .home-link {
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
        }

        .home-link:hover {
            color: var(--green);
        }

        .main {
            flex: 1;
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(0,1fr);
            align-items: center;
            gap: 55px;
            width: min(1050px, 90%);
            margin: 45px auto;
        }

        .intro {
            padding: 15px 0;
        }

        .intro-label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--green);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1.8px;
            text-transform: uppercase;
        }

        .intro-label::before {
            content: "";
            width: 20px;
            height: 2px;
            background: var(--green);
        }

        .intro h1 {
            max-width: 480px;
            margin: 20px 0 15px;
            font-size: clamp(35px,5vw,53px);
            letter-spacing: -2px;
            line-height: 1.1;
        }

        .intro h1 span {
            color: var(--green);
        }

        .intro > p {
            max-width: 430px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.9;
        }

        .benefits {
            display: grid;
            gap: 16px;
            margin-top: 30px;
        }

        .benefit {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .benefit-icon {
            width: 35px;
            height: 35px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border: 1px solid rgba(32,214,160,.2);
            border-radius: 10px;
            background: rgba(32,214,160,.08);
        }

        .benefit strong {
            display: block;
            margin-bottom: 3px;
            font-size: 12px;
        }

        .benefit span {
            display: block;
            color: var(--muted);
            font-size: 11px;
            line-height: 1.6;
        }

        .auth-card {
            width: 100%;
            max-width: 440px;
            justify-self: end;
            padding: 32px;
            border: 1px solid var(--border);
            border-radius: 20px;
            background: rgba(19,33,28,.94);
            box-shadow: 0 25px 80px rgba(0,0,0,.22);
        }

        .card-heading {
            margin-bottom: 25px;
        }

        .card-heading h2 {
            margin: 0 0 7px;
            font-size: 24px;
            letter-spacing: -.7px;
        }

        .card-heading p {
            margin: 0;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.7;
        }

        .form-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            padding: 5px;
            margin-bottom: 24px;
            border-radius: 10px;
            background: rgba(0,0,0,.2);
        }

        .form-tab {
            min-height: 39px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
        }

        .form-tab.active {
            background: var(--green);
            color: #06251b;
        }

        form label {
            display: block;
            margin: 14px 0 6px;
            color: #d7e2de;
            font-size: 11px;
            font-weight: 700;
        }

        form input {
            display: block;
            width: 100%;
            min-height: 45px;
            padding: 12px;
            border: 1px solid #354742;
            border-radius: 9px;
            outline: none;
            background: #0d1715;
            color: #ffffff;
            font-size: 12px;
        }

        form input:focus {
            border-color: var(--green);
            box-shadow: 0 0 0 3px rgba(32,214,160,.1);
        }

        form input::placeholder {
            color: #71827a;
        }

        .name-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .password-note {
            margin: 7px 0 0;
            color: var(--muted);
            font-size: 10px;
        }

        .submit-button {
            width: 100%;
            min-height: 47px;
            margin-top: 23px;
            border: 0;
            border-radius: 9px;
            background: var(--green);
            color: #06251b;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: background .2s ease, transform .2s ease;
        }

        .submit-button:hover {
            background: #48e8b7;
            transform: translateY(-1px);
        }

        .auth-message {
            margin: 13px 0 0;
            font-size: 12px;
            line-height: 1.6;
        }

        .auth-message.error {
            color: #ff9999;
        }

        .auth-message.success {
            color: var(--green);
        }

        .demo-notice {
            margin-top: 21px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            color: var(--muted);
            font-size: 10px;
            line-height: 1.7;
        }

        .demo-notice strong {
            color: #ffca80;
        }

        .footer {
            padding: 22px 6%;
            border-top: 1px solid var(--border);
            text-align: center;
            color: var(--muted);
            font-size: 10px;
            line-height: 1.8;
        }

        .footer strong {
            color: var(--green);
        }

        @media (max-width: 800px) {
            .main {
                grid-template-columns: 1fr;
                gap: 28px;
                width: min(500px, 90%);
                margin: 35px auto;
            }

            .intro {
                padding: 0;
            }

            .intro h1 {
                margin-top: 13px;
                font-size: 36px;
            }

            .intro > p {
                font-size: 12px;
            }

            .benefits {
                grid-template-columns: 1fr;
                gap: 12px;
                margin-top: 20px;
            }

            .auth-card {
                justify-self: stretch;
                max-width: none;
            }
        }

        @media (max-width: 480px) {
            .topbar {
                min-height: 62px;
                padding: 0 5%;
            }

            .brand {
                font-size: 17px;
            }

            .brand-symbol {
                width: 33px;
                height: 33px;
            }

            .home-link {
                font-size: 11px;
            }

            .main {
                width: 92%;
                margin: 28px auto;
            }

            .intro h1 {
                font-size: 31px;
                letter-spacing: -1px;
            }

            .intro > p {
                line-height: 1.7;
            }

            .benefits {
                display: none;
            }

            .auth-card {
                padding: 23px 19px;
                border-radius: 15px;
            }

            .card-heading h2 {
                font-size: 22px;
            }

            .name-fields {
                grid-template-columns: 1fr;
                gap: 0;
            }
        }
    </style>
</head>

<body>

    <header class="topbar">
        <a href="index.html" class="brand" aria-label="AI Africa home">
            <span class="brand-symbol">✦</span>
            <span class="brand-name">AI <span>AFRICA</span></span>
        </a>

        <a href="index.html" class="home-link">← Back to Home</a>
    </header>

    <main class="main">

        <section class="intro">
            <span class="intro-label">Your future starts here</span>

            <h1>
                Learn new skills.<br>
                <span>Build the future.</span>
            </h1>

            <p>
                Welcome to AI Africa, your space to explore artificial
                intelligence, create with modern technology, and develop
                practical digital skills.
            </p>

            <div class="benefits">

                <div class="benefit">
                    <span class="benefit-icon">📚</span>
                    <div>
                        <strong>Continue Your Learning</strong>
                        <span>Track your learning activities and course progress.</span>
                    </div>
                </div>

                <div class="benefit">
                    <span class="benefit-icon">🚀</span>
                    <div>
                        <strong>Build Practical Skills</strong>
                        <span>Explore AI, development, creativity, and cybersecurity.</span>
                    </div>
                </div>

                <div class="benefit">
                    <span class="benefit-icon">🏆</span>
                    <div>
                        <strong>Prepare for Opportunities</strong>
                        <span>Develop skills that can help you prepare for future challenges.</span>
                    </div>
                </div>

            </div>
        </section>

        <section class="auth-card">

            <div class="card-heading">
                <h2 id="formHeading">Welcome Back</h2>
                <p id="formDescription">
                    Sign in to continue your learning journey.
                </p>
            </div>

            <div class="form-tabs" role="tablist" aria-label="Authentication">
                <button
                    type="button"
                    class="form-tab active"
                    id="signInTab"
                    role="tab"
                    aria-selected="true"
                >Sign In</button>

                <button
                    type="button"
                    class="form-tab"
                    id="signUpTab"
                    role="tab"
                    aria-selected="false"
                >Create Account</button>
            </div>

            <!-- Sign In Form -->
            <form id="signInPageForm" novalidate>
                <label for="pageSignInEmail">Email Address</label>
                <input
                    type="email"
                    id="pageSignInEmail"
                    autocomplete="email"
                    placeholder="you@example.com"
                    required
                >

                <label for="pageSignInPassword">Password</label>
                <input
                    type="password"
                    id="pageSignInPassword"
                    autocomplete="current-password"
                    placeholder="Enter your demo password"
                    required
                >

                <button type="submit" class="submit-button">
                    Sign In & Continue →
                </button>
            </form>

            <!-- Sign Up Form -->
            <form id="signUpPageForm" hidden novalidate>
                <div class="name-fields">
                    <div>
                        <label for="pageFirstName">First Name</label>
                        <input
                            type="text"
                            id="pageFirstName"
                            autocomplete="given-name"
                            placeholder="First name"
                            required
                        >
                    </div>

                    <div>
                        <label for="pageLastName">Last Name</label>
                        <input
                            type="text"
                            id="pageLastName"
                            autocomplete="family-name"
                            placeholder="Last name"
                            required
                        >
                    </div>
                </div>

                <label for="pageSignUpEmail">Email Address</label>
                <input
                    type="email"
                    id="pageSignUpEmail"
                    autocomplete="email"
                    placeholder="you@example.com"
                    required
                >

                <label for="pageSignUpPassword">Create Password</label>
                <input
                    type="password"
                    id="pageSignUpPassword"
                    autocomplete="new-password"
                    minlength="8"
                    placeholder="At least 8 characters"
                    required
                >

                <p class="password-note">
                    Use a demo password, not a password you use elsewhere.
                </p>

                <button type="submit" class="submit-button">
                    Create Account & Start Learning →
                </button>
            </form>

            <p
                id="pageAuthMessage"
                class="auth-message"
                role="status"
                aria-live="polite"
            ></p>

            <div class="demo-notice">
                <strong>Demo mode:</strong> This is a front-end demonstration.
                Your account is stored in this browser, not on a secure server.
                Do not enter a real password or sensitive information.
            </div>

        </section>

    </main>

    <footer class="footer">
        <strong>AI AFRICA</strong> · Learn, Create, Innovate.
        <br>
        © <span id="currentYear"></span> AI Africa.
        Demo authentication · Backend integration pending.
    </footer>

    <script>
        (() => {
            "use strict";

            const ACCOUNT_KEY = "aiAfricaDemoAccount";
            const SESSION_KEY = "aiAfricaDemoSession";
            const PROGRESS_PREFIX = "aiAfricaLearningProgress:";

            const $ = id => document.getElementById(id);

            const signInTab = $("signInTab");
            const signUpTab = $("signUpTab");
            const signInForm = $("signInPageForm");
            const signUpForm = $("signUpPageForm");
            const message = $("pageAuthMessage");

            $("currentYear").textContent = new Date().getFullYear();

            function readAccount() {
                try {
                    return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
                } catch {
                    return null;
                }
            }

            function readSession() {
                try {
                    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
                } catch {
                    return null;
                }
            }

            function showMessage(text, type = "") {
                message.textContent = text;
                message.className = "auth-message " + type;
            }

            function switchMode(mode) {
                const signingUp = mode === "signup";

                signInForm.hidden = signingUp;
                signUpForm.hidden = !signingUp;

                signInTab.classList.toggle("active", !signingUp);
                signUpTab.classList.toggle("active", signingUp);

                signInTab.setAttribute(
                    "aria-selected",
                    String(!signingUp)
                );

                signUpTab.setAttribute(
                    "aria-selected",
                    String(signingUp)
                );

                $("formHeading").textContent = signingUp
                    ? "Create Your Account"
                    : "Welcome Back";

                $("formDescription").textContent = signingUp
                    ? "Create a demo account to begin your learning journey."
                    : "Sign in to continue your learning journey.";

                showMessage("");
            }

            function redirectToProgress() {
                window.location.replace("learning-progress.html");
            }

            // Existing authenticated users can continue directly.
            const account = readAccount();
            const session = readSession();

            if (
                account &&
                session &&
                account.email === session.email
            ) {
                redirectToProgress();
                return;
            }

            signInTab.addEventListener("click", () => {
                switchMode("signin");
            });

            signUpTab.addEventListener("click", () => {
                switchMode("signup");
            });

            // Register a demo account.
            signUpForm.addEventListener("submit", event => {
                event.preventDefault();

                const firstName = $("pageFirstName").value.trim();
                const lastName = $("pageLastName").value.trim();
                const email = $("pageSignUpEmail").value.trim().toLowerCase();
                const password = $("pageSignUpPassword").value;

                if (!firstName || !lastName || !email || !password) {
                    showMessage("Please complete all fields.", "error");
                    return;
                }

                if (password.length < 8) {
                    showMessage(
                        "Your demo password must contain at least 8 characters.",
                        "error"
                    );
                    return;
                }

                const existing = readAccount();

                if (existing && existing.email === email) {
                    showMessage(
                        "An account with this email already exists in this browser. Please sign in.",
                        "error"
                    );
                    return;
                }

                /*
                 * This is intentionally a demo-only implementation.
                 * Never store plaintext passwords in production.
                 */
                const newAccount = {
                    firstName,
                    lastName,
                    email,
                    demoPassword: password,
                    createdAt: new Date().toISOString()
                };

                try {
                    localStorage.setItem(
                        ACCOUNT_KEY,
                        JSON.stringify(newAccount)
                    );

                    sessionStorage.setItem(
                        SESSION_KEY,
                        JSON.stringify({
                            email,
                            signedInAt: Date.now()
                        })
                    );

                    // Prepare an empty progress record for this account.
                    const progressKey = PROGRESS_PREFIX + email;

                    if (!localStorage.getItem(progressKey)) {
                        localStorage.setItem(
                            progressKey,
                            JSON.stringify({
                                completedLessons: [],
                                completedByCourse: {},
                                activity: []
                            })
                        );
                    }

                    showMessage(
                        "Your demo account is ready. Opening your dashboard…",
                        "success"
                    );

                    setTimeout(redirectToProgress, 500);
                } catch {
                    showMessage(
                        "Your browser could not save the demo account. Check its storage settings and try again.",
                        "error"
                    );
                }
            });

            // Sign in using the registered demo account.
            signInForm.addEventListener("submit", event => {
                event.preventDefault();

                const email = $("pageSignInEmail").value.trim().toLowerCase();
                const password = $("pageSignInPassword").value;
                const savedAccount = readAccount();

                if (
                    !savedAccount ||
                    savedAccount.email !== email ||
                    savedAccount.demoPassword !== password
                ) {
                    showMessage(
                        "The email or password is incorrect. If you are new, create a demo account first.",
                        "error"
                    );
                    return;
                }

                try {
                    sessionStorage.setItem(
                        SESSION_KEY,
                        JSON.stringify({
                            email,
                            signedInAt: Date.now()
                        })
                    );

                    showMessage(
                        "Sign-in successful. Opening your learning dashboard…",
                        "success"
                    );

                    setTimeout(redirectToProgress, 500);
                } catch {
                    showMessage(
                        "Could not create your demo session. Please try again.",
                        "error"
                    );
                }
            });

            // Allow index.html to open the registration form directly.
            if (
                new URLSearchParams(window.location.search).get("mode") === "signup"
            ) {
                switchMode("signup");
            } else {
                switchMode("signin");
            }
        })();
    </script>

</body>
</html>