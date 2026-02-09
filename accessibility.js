/**
 * Ponpela Accessibility Widget
 * תקן ישראלי 5568 (WCAG 2.0 AA)
 * <script src="accessibility.js"></script>
 *
 * Architecture:
 * - Invert: white overlay with mix-blend-mode:difference (z:9999)
 * - Grayscale: overlay with backdrop-filter:grayscale (z:9998)
 * - High contrast: CSS colors on <html> with :not() exclusions
 * - All other features: CSS classes on <html>
 * - Widget: z:10000-10002, above all overlays
 * - ZERO filters on content elements → position:fixed never breaks
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ponpela_a11y';
    const defaults = {
        fontSize: 0,
        contrast: 'none',
        grayscale: false,
        animations: true,
        links: false,
        cursor: false,
        font: false,
        lineHeight: false,
        letterSpacing: false,
        textAlign: 'none'
    };

    let settings = loadSettings();

    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return saved ? { ...defaults, ...saved } : { ...defaults };
        } catch (e) {
            return { ...defaults };
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    // --- CSS ---
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'ponpela-a11y-css';
        style.textContent = `

            /* ========== Scroll lock ========== */
            html.a11y-scroll-locked { overflow: hidden !important; }
            html.a11y-scroll-locked body { overflow: hidden !important; }

            /* ========== Color overlays (no filter on content!) ========== */
            .a11y-gray-overlay {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 9998;
                pointer-events: none;
                backdrop-filter: grayscale(1);
                -webkit-backdrop-filter: grayscale(1);
            }
            .a11y-gray-overlay.active { display: block; }

            .a11y-invert-overlay {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 9999;
                pointer-events: none;
                background: white;
                mix-blend-mode: difference;
            }
            .a11y-invert-overlay.active { display: block; }

            /* ========== Widget (z:10000+, above overlays) ========== */
            .a11y-btn {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 44px;
                height: 44px;
                background: none;
                border: none;
                cursor: pointer;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }
            .a11y-btn svg {
                width: 38px;
                height: 38px;
                fill: #236474;
                transition: fill 0.2s;
            }
            .a11y-btn:hover svg { fill: #1d5a6e; }
            @media (max-width: 768px) {
                .a11y-btn { right: 15px; width: 38px; height: 38px; }
                .a11y-btn svg { width: 32px; height: 32px; }
            }

            .a11y-dim-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.4);
                z-index: 10001;
            }
            .a11y-dim-overlay.open { display: block; }

            .a11y-panel {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 10002;
                width: 380px;
                max-width: 95vw;
                max-height: 85vh;
                overflow-y: auto;
                direction: rtl;
                font-size: 16px !important;
                font-family: 'Varela Round', sans-serif !important;
                line-height: 1.4 !important;
                letter-spacing: normal !important;
                word-spacing: normal !important;
                text-align: right !important;
            }
            .a11y-panel.open { display: block; }
            .a11y-panel * {
                font-family: 'Varela Round', sans-serif !important;
                line-height: 1.4 !important;
                letter-spacing: normal !important;
                word-spacing: normal !important;
            }
            .a11y-panel-header {
                background: #236474;
                color: white;
                padding: 18px 24px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            .a11y-panel-header h2 { margin: 0; font-size: 1.3rem !important; font-weight: 700; }
            .a11y-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.6rem !important;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1 !important;
            }
            .a11y-panel-body { padding: 20px 24px; }
            .a11y-section { margin-bottom: 20px; }
            .a11y-section-title {
                font-size: 0.85rem !important;
                color: #888;
                font-weight: 600;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #eee;
            }
            .a11y-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .a11y-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                padding: 14px 8px;
                border: 2px solid #e8e8e8;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                background: white;
                text-align: center !important;
                font-size: 0.85rem !important;
                color: #333;
                font-weight: 600;
            }
            .a11y-option:hover { border-color: #236474; background: #f0f9fb; }
            .a11y-option.active { border-color: #236474; background: #e6f3f7; color: #236474; }
            .a11y-option-icon { font-size: 1.5rem !important; line-height: 1 !important; }
            .a11y-font-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 10px;
                border: 2px solid #e8e8e8;
                border-radius: 12px;
                margin-bottom: 10px;
            }
            .a11y-font-btn {
                width: 40px; height: 40px;
                border-radius: 50%;
                border: 2px solid #236474;
                background: white;
                color: #236474;
                font-size: 1.3rem !important;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .a11y-font-btn:hover { background: #236474; color: white; }
            .a11y-font-label {
                font-size: 0.95rem !important;
                font-weight: 600;
                color: #333;
                min-width: 100px;
                text-align: center !important;
            }
            .a11y-reset {
                width: 100%;
                padding: 14px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1rem !important;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
            }
            .a11y-reset:hover { background: #c0392b; }

            /* ========== Non-filter styles on <html> ========== */

            /* High contrast (colors only) */
            html.a11y-contrast-high *:not(.a11y-panel):not(.a11y-panel *):not(.a11y-btn):not(.a11y-btn *):not(.a11y-dim-overlay):not(.a11y-invert-overlay):not(.a11y-gray-overlay) {
                background-color: #000 !important;
                color: #ffff00 !important;
                border-color: #000 !important;
            }
            html.a11y-contrast-high a:not(.a11y-panel a):not(.a11y-btn),
            html.a11y-contrast-high a:not(.a11y-panel a):not(.a11y-btn) * {
                color: #00ffff !important;
            }
            html.a11y-contrast-high img {
                background-color: transparent !important;
            }
            html.a11y-contrast-high .bottom-nav {
                border-top: 2px solid #ffff00 !important;
                box-shadow: none !important;
            }
            html.a11y-contrast-high .bottom-nav a {
                border-color: #000 !important;
                box-shadow: none !important;
            }
            html.a11y-contrast-high .bottom-nav a.active {
                background-color: #222 !important;
                box-shadow: inset 0 3px 0 #ffff00 !important;
            }
            html.a11y-contrast-high input:not([type="hidden"]):not([type="submit"]):not([type="button"]),
            html.a11y-contrast-high textarea,
            html.a11y-contrast-high select {
                background-color: #111 !important;
                color: #ffff00 !important;
                outline: 2px solid #ffff00 !important;
                outline-offset: -1px !important;
            }
            html.a11y-contrast-high input::placeholder,
            html.a11y-contrast-high textarea::placeholder {
                color: #aaa !important;
                opacity: 1 !important;
            }

            /* Inverted - ensure form fields have visible borders */
            html.a11y-contrast-inverted input:not([type="hidden"]):not([type="submit"]):not([type="button"]),
            html.a11y-contrast-inverted textarea,
            html.a11y-contrast-inverted select {
                border: 2px solid #333 !important;
            }
            html.a11y-contrast-high .a11y-btn svg {
                fill: #ffff00 !important;
            }

            /* Highlight links */
            html.a11y-highlight-links a:not(.a11y-panel a) {
                outline: 3px solid #ff0 !important;
                outline-offset: 2px !important;
                text-decoration: underline !important;
            }

            /* Stop animations (exclude widget) */
            html.a11y-no-animations *:not(.a11y-panel):not(.a11y-panel *),
            html.a11y-no-animations *:not(.a11y-panel):not(.a11y-panel *)::before,
            html.a11y-no-animations *:not(.a11y-panel):not(.a11y-panel *)::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
            }

            /* Big cursor */
            html.a11y-big-cursor, html.a11y-big-cursor * {
                cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4l28 20H20l-4 16z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important;
            }

            /* Readable font */
            html.a11y-readable-font *:not(.a11y-panel):not(.a11y-panel *) {
                font-family: 'Rubik', 'David', Arial, sans-serif !important;
            }

            /* Line height */
            html.a11y-line-height *:not(.a11y-panel):not(.a11y-panel *) {
                line-height: 2 !important;
            }

            /* Letter spacing */
            html.a11y-letter-spacing *:not(.a11y-panel):not(.a11y-panel *) {
                letter-spacing: 0.12em !important;
                word-spacing: 0.2em !important;
            }

            /* Text align */
            html.a11y-align-right *:not(.a11y-panel):not(.a11y-panel *) { text-align: right !important; }
            html.a11y-align-left *:not(.a11y-panel):not(.a11y-panel *) { text-align: left !important; }
            html.a11y-align-center *:not(.a11y-panel):not(.a11y-panel *) { text-align: center !important; }
        `;
        document.head.appendChild(style);
    }

    const ICON_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/></svg>';

    // --- Build UI ---
    function buildUI() {
        // Grayscale overlay (backdrop-filter)
        const grayOverlay = document.createElement('div');
        grayOverlay.className = 'a11y-gray-overlay';
        document.body.appendChild(grayOverlay);

        // Invert overlay (mix-blend-mode: difference)
        const invertOverlay = document.createElement('div');
        invertOverlay.className = 'a11y-invert-overlay';
        document.body.appendChild(invertOverlay);

        // Dim overlay (panel backdrop)
        const dimOverlay = document.createElement('div');
        dimOverlay.className = 'a11y-dim-overlay';
        dimOverlay.addEventListener('click', closePanel);
        dimOverlay.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
        document.body.appendChild(dimOverlay);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'a11y-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', 'הגדרות נגישות');
        panel.innerHTML = `
            <div class="a11y-panel-header">
                <h2><svg viewBox="0 0 24 24" width="22" height="22" fill="white" style="vertical-align:middle;margin-left:8px;"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/></svg>נגישות</h2>
                <button class="a11y-close" aria-label="סגור">&times;</button>
            </div>
            <div class="a11y-panel-body">
                <div class="a11y-section">
                    <div class="a11y-section-title">גודל טקסט</div>
                    <div class="a11y-font-row">
                        <button class="a11y-font-btn" data-action="font-down" aria-label="הקטנת טקסט">א-</button>
                        <span class="a11y-font-label" id="a11yFontLabel">100%</span>
                        <button class="a11y-font-btn" data-action="font-up" aria-label="הגדלת טקסט">א+</button>
                    </div>
                </div>
                <div class="a11y-section">
                    <div class="a11y-section-title">תצוגה</div>
                    <div class="a11y-grid">
                        <button class="a11y-option" data-action="contrast-high"><span class="a11y-option-icon">🔲</span>ניגודיות גבוהה</button>
                        <button class="a11y-option" data-action="contrast-inverted"><span class="a11y-option-icon">🔄</span>היפוך צבעים</button>
                        <button class="a11y-option" data-action="grayscale"><span class="a11y-option-icon">⚫</span>גווני אפור</button>
                        <button class="a11y-option" data-action="links"><span class="a11y-option-icon">🔗</span>הדגשת קישורים</button>
                    </div>
                </div>
                <div class="a11y-section">
                    <div class="a11y-section-title">קריאות</div>
                    <div class="a11y-grid">
                        <button class="a11y-option" data-action="font"><span class="a11y-option-icon">Aa</span>גופן קריא</button>
                        <button class="a11y-option" data-action="lineHeight"><span class="a11y-option-icon">↕</span>ריווח שורות</button>
                        <button class="a11y-option" data-action="letterSpacing"><span class="a11y-option-icon">↔</span>ריווח אותיות</button>
                        <button class="a11y-option" data-action="animations"><span class="a11y-option-icon">⏸</span>ביטול אנימציות</button>
                    </div>
                </div>
                <div class="a11y-section">
                    <div class="a11y-section-title">ניווט</div>
                    <div class="a11y-grid">
                        <button class="a11y-option" data-action="cursor"><span class="a11y-option-icon">🖱️</span>סמן מוגדל</button>
                        <button class="a11y-option" data-action="align-right"><span class="a11y-option-icon">⫸</span>ישור לימין</button>
                        <button class="a11y-option" data-action="align-left"><span class="a11y-option-icon">⫷</span>ישור לשמאל</button>
                        <button class="a11y-option" data-action="align-center"><span class="a11y-option-icon">☰</span>ישור למרכז</button>
                    </div>
                </div>
                <button class="a11y-reset" data-action="reset">↩ איפוס הגדרות</button>
            </div>
        `;
        document.body.appendChild(panel);

        panel.querySelector('.a11y-close').addEventListener('click', closePanel);
        panel.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function () { handleAction(this.dataset.action); });
        });

        // Floating button
        const btn = document.createElement('button');
        btn.className = 'a11y-btn';
        btn.innerHTML = ICON_SVG;
        btn.setAttribute('aria-label', 'הגדרות נגישות');
        btn.addEventListener('click', togglePanel);
        document.body.appendChild(btn);

        // Keyboard
        document.addEventListener('keydown', function (e) {
            const panelEl = document.querySelector('.a11y-panel');
            if (!panelEl || !panelEl.classList.contains('open')) return;
            if (e.key === 'Escape') {
                closePanel();
                document.querySelector('.a11y-btn').focus();
                return;
            }
            if (e.key === 'Tab') {
                const focusable = panelEl.querySelectorAll('button');
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        });
    }

    // --- Panel ---
    let previouslyFocused = null;
    let bodyTouchHandler = null;

    function togglePanel() {
        const panel = document.querySelector('.a11y-panel');
        const isOpen = panel.classList.toggle('open');
        document.querySelector('.a11y-dim-overlay').classList.toggle('open');
        document.documentElement.classList.toggle('a11y-scroll-locked', isOpen);

        // iOS scroll lock: prevent touchmove on body
        if (isOpen) {
            previouslyFocused = document.activeElement;
            panel.querySelector('.a11y-close').focus();
            bodyTouchHandler = function (e) {
                // Allow scroll inside panel
                if (panel.contains(e.target)) return;
                e.preventDefault();
            };
            document.body.addEventListener('touchmove', bodyTouchHandler, { passive: false });
        } else {
            removeBodyTouch();
        }
    }

    function removeBodyTouch() {
        if (bodyTouchHandler) {
            document.body.removeEventListener('touchmove', bodyTouchHandler);
            bodyTouchHandler = null;
        }
    }

    function closePanel() {
        document.querySelector('.a11y-panel').classList.remove('open');
        document.querySelector('.a11y-dim-overlay').classList.remove('open');
        document.documentElement.classList.remove('a11y-scroll-locked');
        removeBodyTouch();
        if (previouslyFocused && previouslyFocused.focus) {
            previouslyFocused.focus();
            previouslyFocused = null;
        }
    }

    // --- Actions ---
    function handleAction(action) {
        switch (action) {
            case 'font-up':    if (settings.fontSize < 5) settings.fontSize++; break;
            case 'font-down':  if (settings.fontSize > -2) settings.fontSize--; break;
            case 'contrast-high':
                settings.contrast = settings.contrast === 'high' ? 'none' : 'high'; break;
            case 'contrast-inverted':
                settings.contrast = settings.contrast === 'inverted' ? 'none' : 'inverted'; break;
            case 'grayscale':       settings.grayscale = !settings.grayscale; break;
            case 'animations':      settings.animations = !settings.animations; break;
            case 'links':           settings.links = !settings.links; break;
            case 'cursor':          settings.cursor = !settings.cursor; break;
            case 'font':            settings.font = !settings.font; break;
            case 'lineHeight':      settings.lineHeight = !settings.lineHeight; break;
            case 'letterSpacing':   settings.letterSpacing = !settings.letterSpacing; break;
            case 'align-right':
                settings.textAlign = settings.textAlign === 'right' ? 'none' : 'right'; break;
            case 'align-left':
                settings.textAlign = settings.textAlign === 'left' ? 'none' : 'left'; break;
            case 'align-center':
                settings.textAlign = settings.textAlign === 'center' ? 'none' : 'center'; break;
            case 'reset':
                settings = { ...defaults };
                closePanel();
                break;
        }
        saveSettings();
        applySettings();
        updateUI();
    }

    // --- Apply ---
    function applySettings() {
        const html = document.documentElement;

        // Font size
        html.style.fontSize = (100 + settings.fontSize * 15) + '%';

        // High contrast (CSS colors, no filter)
        html.classList.toggle('a11y-contrast-high', settings.contrast === 'high');

        // Invert overlay (mix-blend-mode)
        const invertOverlay = document.querySelector('.a11y-invert-overlay');
        if (invertOverlay) invertOverlay.classList.toggle('active', settings.contrast === 'inverted');
        html.classList.toggle('a11y-contrast-inverted', settings.contrast === 'inverted');

        // Grayscale overlay (backdrop-filter)
        const grayOverlay = document.querySelector('.a11y-gray-overlay');
        if (grayOverlay) grayOverlay.classList.toggle('active', settings.grayscale);

        // Non-filter features
        html.classList.toggle('a11y-no-animations', !settings.animations);
        html.classList.toggle('a11y-highlight-links', settings.links);
        html.classList.toggle('a11y-big-cursor', settings.cursor);
        html.classList.toggle('a11y-readable-font', settings.font);
        html.classList.toggle('a11y-line-height', settings.lineHeight);
        html.classList.toggle('a11y-letter-spacing', settings.letterSpacing);

        html.classList.remove('a11y-align-right', 'a11y-align-left', 'a11y-align-center');
        if (settings.textAlign !== 'none') {
            html.classList.add('a11y-align-' + settings.textAlign);
        }
    }

    // --- Update Panel UI ---
    function updateUI() {
        const panel = document.querySelector('.a11y-panel');
        if (!panel) return;

        const label = panel.querySelector('#a11yFontLabel');
        if (label) label.textContent = (100 + settings.fontSize * 15) + '%';

        const map = {
            'contrast-high': settings.contrast === 'high',
            'contrast-inverted': settings.contrast === 'inverted',
            'grayscale': settings.grayscale,
            'links': settings.links,
            'cursor': settings.cursor,
            'font': settings.font,
            'lineHeight': settings.lineHeight,
            'letterSpacing': settings.letterSpacing,
            'animations': !settings.animations,
            'align-right': settings.textAlign === 'right',
            'align-left': settings.textAlign === 'left',
            'align-center': settings.textAlign === 'center'
        };

        panel.querySelectorAll('.a11y-option[data-action]').forEach(btn => {
            const action = btn.dataset.action;
            if (action in map) btn.classList.toggle('active', map[action]);
        });
    }

    // --- Init ---
    function init() {
        injectCSS();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                buildUI();
                applySettings();
                updateUI();
            });
        } else {
            buildUI();
            applySettings();
            updateUI();
        }
    }

    init();
})();
