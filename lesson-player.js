/* ==========================================
AI AFRICA — YOUTUBE LESSON PLAYER
Features:

- Embedded YouTube playback
- Open on YouTube button
- Playback progress tracking
- Resume playback
- Lesson completion
- Mobile-friendly modal integration
  ========================================== */

(() => {
"use strict";

const $ = id => document.getElementById(id);

let player = null;
let currentLesson = null;
let apiReady = false;
let pendingLesson = null;
let pollTimer = null;
let lastPlaybackPosition = null;
let lastPollTime = null;
let currentVideoToken = 0;

/* ==========================================
   STATUS AND PROGRESS UI
========================================== */

function setStatus(message) {
    const element = $("lessonWatchStatus");

    if (element) {
        element.textContent = message;
    }
}

function showPercent(percent) {
    const safe = Math.max(0, Math.min(100, percent));

    if ($("lessonWatchPercent")) {
        $("lessonWatchPercent").textContent =
            Math.floor(safe) + "%";
    }

    if ($("lessonWatchBar")) {
        $("lessonWatchBar").style.width = safe + "%";
    }
}

function getProgress(lesson) {
    if (!lesson || !lesson.id) {
        return {
            watchedSeconds: 0,
            duration: 0,
            lastPosition: 0,
            completed: false
        };
    }

    return (
        window.AIAfricaProgress?.getLessons?.()?.[lesson.id]
    ) || {
        watchedSeconds: 0,
        duration: 0,
        lastPosition: 0,
        completed: false
    };
}

/* ==========================================
   YOUTUBE VIDEO ID VALIDATION
========================================== */

function getValidYouTubeVideoId(value) {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    const input = value.trim();

    // Direct YouTube video ID.
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
        return input;
    }

    let url;

    try {
        url = new URL(
            /^https?:\/\//i.test(input)
                ? input
                : "https://" + input
        );
    } catch {
        return null;
    }

    const hostname = url.hostname.toLowerCase();

    // Only accept recognised YouTube domains.
    const isYouTubeHost =
        hostname === "youtube.com" ||
        hostname.endsWith(".youtube.com") ||
        hostname === "youtube-nocookie.com" ||
        hostname.endsWith(".youtube-nocookie.com") ||
        hostname === "youtu.be" ||
        hostname.endsWith(".youtu.be");

    if (!isYouTubeHost) {
        return null;
    }

    let videoId = null;

    if (
        hostname === "youtu.be" ||
        hostname.endsWith(".youtu.be")
    ) {
        videoId = url.pathname
            .split("/")
            .filter(Boolean)[0];

    } else if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");

    } else {
        const match = url.pathname.match(
            /^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})(?:\/|$)/
        );

        if (match) {
            videoId = match[1];
        }
    }

    return (
        videoId &&
        /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    ) ? videoId : null;
}

/* ==========================================
   OPEN ON YOUTUBE BUTTON
========================================== */

function updateOpenOnYouTubeLink(lesson) {
    const actions = $("youtubeExternalActions");
    const button = $("openOnYouTube");

    if (!actions || !button) {
        return;
    }

    // Clear the previous lesson's URL.
    button.hidden = true;
    actions.hidden = true;
    button.removeAttribute("href");

    if (!lesson || typeof lesson !== "object") {
        return;
    }

    /*
     * Support the most common property names.
     * videoId is the preferred format used by this player.
     */
    const possibleSources = [
        lesson.videoId,
        lesson.youtubeId,
        lesson.youtubeUrl,
        lesson.videoUrl,
        lesson.url
    ];

    let videoId = null;

    for (const source of possibleSources) {
        videoId = getValidYouTubeVideoId(source);

        if (videoId) {
            break;
        }
    }

    // Hide the button if the lesson has no valid YouTube link.
    if (!videoId) {
        return;
    }

    const youtubeUrl =
        "https://www.youtube.com/watch?v=" +
        encodeURIComponent(videoId);

    button.href = youtubeUrl;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.hidden = false;
    actions.hidden = false;
}

/* ==========================================
   PLAYER CLEANUP
========================================== */

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }

    lastPlaybackPosition = null;
    lastPollTime = null;
}

function destroyPlayer() {
    stopPolling();

    if (player && typeof player.destroy === "function") {
        try {
            player.destroy();
        } catch (error) {
            console.warn(
                "Could not destroy YouTube player:",
                error
            );
        }
    }

    player = null;

    /*
     * Reset only the video container.
     * Keep the external YouTube button outside it.
     */
    const container = $("youtubePlayerContainer");

    if (container) {
        container.innerHTML =
            '<div id="youtubePlayer"></div>';
    }
}

function close() {
    destroyPlayer();

    const modal = $("lessonPlayerModal");

    if (modal) {
        modal.hidden = true;
    }

    document.body.classList.remove("lesson-player-open");

    currentLesson = null;
    pendingLesson = null;

    currentVideoToken++;

    // Prevent the previous lesson's URL from remaining visible.
    const actions = $("youtubeExternalActions");
    const button = $("openOnYouTube");

    if (actions) {
        actions.hidden = true;
    }

    if (button) {
        button.hidden = true;
        button.removeAttribute("href");
    }
}

/* ==========================================
   YOUTUBE IFRAME API
========================================== */

function loadYouTubeAPI() {
    if (window.YT?.Player) {
        apiReady = true;
        return;
    }

    if ($("youtube-iframe-api")) {
        return;
    }

    const script = document.createElement("script");

    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    script.onerror = () => {
        setStatus(
            "YouTube could not load. Check your internet connection and try again."
        );
    };

    document.head.appendChild(script);
}

// Preserve any existing YouTube API callback.
const previousYouTubeCallback =
    window.onYouTubeIframeAPIReady;

window.onYouTubeIframeAPIReady = function () {
    apiReady = true;

    if (typeof previousYouTubeCallback === "function") {
        try {
            previousYouTubeCallback();
        } catch (error) {
            console.error(error);
        }
    }

    if (pendingLesson) {
        createPlayer(pendingLesson);
    }
};

/* ==========================================
   OPEN LESSON
========================================== */

function open(lesson) {
    if (!lesson || !lesson.id) {
        console.error(
            "Invalid lesson supplied to the player."
        );

        return;
    }

    const videoId = getValidYouTubeVideoId(
        lesson.videoId ||
        lesson.youtubeId ||
        lesson.youtubeUrl ||
        lesson.videoUrl ||
        lesson.url
    );

    if (!videoId) {
        if (typeof window.showToast === "function") {
            window.showToast(
                "This lesson does not have a valid YouTube video available."
            );
        }

        return;
    }

    /*
     * Create a normalised copy so the YouTube API always
     * receives a valid video ID, even when lesson data
     * contains a full YouTube URL.
     */
    const selectedLesson = {
        ...lesson,
        videoId
    };

    currentLesson = selectedLesson;
    pendingLesson = selectedLesson;

    currentVideoToken++;

    const modal = $("lessonPlayerModal");

    if (!modal) {
        console.error(
            "Missing lessonPlayerModal in index.html."
        );

        return;
    }

    // Update the external YouTube button for this lesson.
    updateOpenOnYouTubeLink(selectedLesson);

    modal.hidden = false;

    document.body.classList.add("lesson-player-open");

    if ($("lessonPlayerTitle")) {
        $("lessonPlayerTitle").textContent =
            selectedLesson.title || "Tutorial";
    }

    if ($("lessonPlayerDescription")) {
        $("lessonPlayerDescription").textContent =
            selectedLesson.description || "";
    }

    const progress = getProgress(selectedLesson);

    const duration =
        progress.duration ||
        selectedLesson.duration ||
        0;

    showPercent(
        duration > 0
            ? (progress.watchedSeconds / duration) * 100
            : 0
    );

    setStatus(
        window.AIAfricaAuth?.getCurrentUser?.()
            ? "Watch the tutorial to record your learning progress."
            : "You can watch this lesson now. Sign in to save your progress."
    );

    window.AIAfricaProgress?.recordOpen?.(
        selectedLesson.id
    );

    loadYouTubeAPI();

    if (apiReady && window.YT?.Player) {
        createPlayer(selectedLesson);
    }
}

/* ==========================================
   CREATE YOUTUBE PLAYER
========================================== */

function createPlayer(lesson) {
    if (!lesson || !window.YT?.Player) {
        return;
    }

    pendingLesson = null;

    destroyPlayer();

    currentLesson = lesson;

    const container = $("youtubePlayerContainer");

    if (!container) {
        console.error(
            "Missing youtubePlayerContainer."
        );

        return;
    }

    container.innerHTML =
        '<div id="youtubePlayer"></div>';

    const progress = getProgress(lesson);

    const startSeconds = Math.max(
        0,
        Math.floor(progress.lastPosition || 0)
    );

    const playerToken = currentVideoToken;

    try {
        player = new window.YT.Player("youtubePlayer", {
            width: "100%",
            height: "100%",

            videoId: lesson.videoId,

            playerVars: {
                autoplay: 1,
                controls: 1,
                playsinline: 1,
                rel: 0,
                origin: window.location.origin,
                start: startSeconds
            },

            events: {
                onReady: event => {
                    // Ignore callbacks belonging to an old lesson.
                    if (playerToken !== currentVideoToken) {
                        return;
                    }

                    if (startSeconds > 0) {
                        event.target.seekTo(
                            startSeconds,
                            true
                        );
                    }

                    setStatus(
                        "Video ready. Watch the lesson to record progress."
                    );
                },

                onStateChange: event => {
                    if (playerToken !== currentVideoToken) {
                        return;
                    }

                    onPlayerStateChange(event);
                },

                onError: event => {
                    if (playerToken !== currentVideoToken) {
                        return;
                    }

                    console.error(
                        "YouTube player error:",
                        event.data
                    );

                    const messages = {
                        2: "The video ID is invalid.",
                        5: "This video cannot be played in the HTML5 player.",
                        100: "The video was removed or is unavailable.",
                        101: "The video owner does not allow embedding.",
                        150: "The video owner does not allow embedding."
                    };

                    setStatus(
                        messages[event.data] ||
                        "YouTube could not play this video. Try another lesson or use Open on YouTube."
                    );
                }
            }
        });

    } catch (error) {
        console.error(
            "Could not initialise YouTube player:",
            error
        );

        setStatus(
            "The video player could not initialise. Reload the page and try again."
        );
    }
}

/* ==========================================
   PLAYER STATE CHANGES
========================================== */

function onPlayerStateChange(event) {
    if (!window.YT?.PlayerState) {
        return;
    }

    stopPolling();

    if (event.data === window.YT.PlayerState.PLAYING) {
        setStatus(
            "Video playing. Recording playback progress."
        );

        lastPlaybackPosition = safeCurrentTime();
        lastPollTime = Date.now();

        pollTimer = setInterval(
            trackPlayback,
            2000
        );

        return;
    }

    if (event.data === window.YT.PlayerState.PAUSED) {
        savePosition();
        setStatus("Video paused.");
        return;
    }

    if (event.data === window.YT.PlayerState.ENDED) {
        savePosition();

        const lesson = currentLesson;

        if (!lesson) {
            return;
        }

        const progress = getProgress(lesson);

        const duration =
            progress.duration ||
            safeDuration() ||
            lesson.duration ||
            0;

        if (
            duration > 0 &&
            progress.watchedSeconds >= duration * 0.8
        ) {
            window.AIAfricaProgress?.completeLesson?.(
                lesson.id
            );

            setStatus("Lesson completed!");
            showPercent(100);

        } else {
            setStatus(
                "Video ended. Watch the missing sections to earn completion credit."
            );
        }
    }
}

/* ==========================================
   SAFE PLAYER ACCESS
========================================== */

function safeCurrentTime() {
    try {
        return player?.getCurrentTime?.() || 0;
    } catch {
        return 0;
    }
}

function safeDuration() {
    try {
        return player?.getDuration?.() || 0;
    } catch {
        return 0;
    }
}

/* ==========================================
   PLAYBACK PROGRESS TRACKING
========================================== */

function trackPlayback() {
    if (
        !player ||
        !currentLesson ||
        !window.YT ||
        typeof player.getPlayerState !== "function" ||
        player.getPlayerState() !==
            window.YT.PlayerState.PLAYING
    ) {
        return;
    }

    const now = Date.now();
    const position = safeCurrentTime();
    const duration = safeDuration();

    if (
        lastPlaybackPosition === null ||
        lastPollTime === null
    ) {
        lastPlaybackPosition = position;
        lastPollTime = now;
        return;
    }

    const elapsed = (now - lastPollTime) / 1000;
    const difference = position - lastPlaybackPosition;

    /*
     * Count plausible forward playback only.
     * Large seeks do not count as watched time.
     */
    if (
        difference > 0 &&
        difference <= Math.min(3.5, elapsed + 1.2)
    ) {
        if (window.AIAfricaAuth?.getCurrentUser?.()) {
            window.AIAfricaProgress?.recordWatchedSeconds?.(
                currentLesson.id,
                difference,
                duration
            );
        }
    }

    lastPlaybackPosition = position;
    lastPollTime = now;

    savePosition();

    const progress = getProgress(currentLesson);

    const effectiveDuration =
        duration ||
        progress.duration ||
        currentLesson.duration ||
        0;

    const percent = effectiveDuration > 0
        ? (
            progress.watchedSeconds /
            effectiveDuration
        ) * 100
        : 0;

    showPercent(percent);

    if (
        effectiveDuration > 0 &&
        progress.watchedSeconds / effectiveDuration >= 0.8
    ) {
        window.AIAfricaProgress?.completeLesson?.(
            currentLesson.id
        );

        setStatus("Lesson completed!");

    } else if (!window.AIAfricaAuth?.getCurrentUser?.()) {
        setStatus(
            "Sign in to save your learning progress."
        );

    } else {
        setStatus(
            "Keep watching to complete this lesson."
        );
    }
}

function savePosition() {
    if (!currentLesson) {
        return;
    }

    window.AIAfricaProgress?.updatePlaybackPosition?.(
        currentLesson.id,
        safeCurrentTime(),
        safeDuration()
    );
}

/* ==========================================
   MODAL EVENTS
========================================== */

$("closeLessonPlayer")?.addEventListener(
    "click",
    close
);

$("lessonPlayerModal")?.addEventListener(
    "click",
    event => {
        if (event.target === $("lessonPlayerModal")) {
            close();
        }
    }
);

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        $("lessonPlayerModal") &&
        !$("lessonPlayerModal").hidden
    ) {
        close();
    }
});

/* ==========================================
   PUBLIC API
========================================== */

window.AIAfricaLessonPlayer = {
    open,
    close
};

})();