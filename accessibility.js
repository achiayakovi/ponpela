/**
 * Ponpela Accessibility Widget
 * תקן ישראלי 5568 (WCAG 2.0 AA)
 * קובץ יחיד - להוסיף לכל דף: <script src="accessibility.js"></script>
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ponpela_a11y';
    const defaults = {
        fontSize: 0,        // -2 to +5
        contrast: 'none',   // none, high, inverted
        grayscale: false,
        animations: true,
        links: false,
        cursor: false,
        font: false,         // readable font
        lineHeight: false,
        letterSpacing: false,
        textAlign: 'none'   // none, right, left, center
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

    // --- CSS injection ---
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'ponpela-a11y-css';
        style.textContent = `
            /* Accessibility Panel */
            .a11y-btn {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                background: #2d7a8e;
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 26px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(45,122,142,0.5);
                z-index: 10000;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            .a11y-btn:hover {
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 20px rgba(45,122,142,0.7);
            }
            @media (max-width: 768px) {
                .a11y-btn {
                    right: 15px;
                    width: 45px;
                    height: 45px;
                    font-size: 22px;
                }
            }

            .a11y-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.4);
                z-index: 10001;
            }
            .a11y-overlay.open {
                display: block;
            }

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
                font-family: 'Varela Round', sans-serif;
            }
            .a11y-panel.open {
                display: block;
            }

            .a11y-panel-header {
                background: #2d7a8e;
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
            .a11y-panel-header h2 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 700;
            }
            .a11y-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.6rem;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }

            .a11y-panel-body {
                padding: 20px 24px;
            }

            .a11y-section {
                margin-bottom: 20px;
            }
            .a11y-section-title {
                font-size: 0.85rem;
                color: #888;
                font-weight: 600;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #eee;
            }

            .a11y-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

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
                text-align: center;
                font-family: inherit;
                font-size: 0.85rem;
                color: #333;
                font-weight: 600;
            }
            .a11y-option:hover {
                border-color: #2d7a8e;
                background: #f0f9fb;
            }
            .a11y-option.active {
                border-color: #2d7a8e;
                background: #e6f3f7;
                color: #2d7a8e;
            }
            .a11y-option-icon {
                font-size: 1.5rem;
                line-height: 1;
            }

            /* Font size row */
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
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #2d7a8e;
                background: white;
                color: #2d7a8e;
                font-size: 1.3rem;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-family: inherit;
            }
            .a11y-font-btn:hover {
                background: #2d7a8e;
                color: white;
            }
            .a11y-font-label {
                font-size: 0.95rem;
                font-weight: 600;
                color: #333;
                min-width: 100px;
                text-align: center;
            }

            /* Reset button */
            .a11y-reset {
                width: 100%;
                padding: 14px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
                margin-top: 10px;
            }
            .a11y-reset:hover {
                background: #c0392b;
            }

            /* ========== Applied Styles ========== */

            /* High contrast */
            body.a11y-contrast-high,
            body.a11y-contrast-high * {
                background-color: #000 !important;
                color: #ffff00 !important;
                border-color: #ffff00 !important;
            }
            body.a11y-contrast-high a,
            body.a11y-contrast-high a * {
                color: #00ffff !important;
            }
            body.a11y-contrast-high img {
                background-color: transparent !important;
            }
            body.a11y-contrast-high .a11y-panel,
            body.a11y-contrast-high .a11y-panel * {
                background-color: revert !important;
                color: revert !important;
                border-color: revert !important;
            }
            body.a11y-contrast-high .a11y-panel-header,
            body.a11y-contrast-high .a11y-panel-header * {
                background-color: #2d7a8e !important;
                color: white !important;
            }
            body.a11y-contrast-high .a11y-btn {
                background-color: #ffff00 !important;
                color: #000 !important;
            }

            /* Inverted contrast */
            body.a11y-contrast-inverted {
                filter: invert(1) hue-rotate(180deg);
            }
            body.a11y-contrast-inverted img,
            body.a11y-contrast-inverted video {
                filter: invert(1) hue-rotate(180deg);
            }
            body.a11y-contrast-inverted .a11y-panel,
            body.a11y-contrast-inverted .a11y-btn {
                filter: invert(1) hue-rotate(180deg);
            }

            /* Grayscale */
            body.a11y-grayscale {
                filter: grayscale(100%);
            }
            body.a11y-grayscale.a11y-contrast-inverted {
                filter: grayscale(100%) invert(1) hue-rotate(180deg);
            }
            body.a11y-grayscale .a11y-panel,
            body.a11y-grayscale .a11y-btn {
                filter: grayscale(0);
            }

            /* Stop animations */
            body.a11y-no-animations,
            body.a11y-no-animations *,
            body.a11y-no-animations *::before,
            body.a11y-no-animations *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
            }

            /* Highlight links */
            body.a11y-highlight-links a {
                outline: 3px solid #ff0 !important;
                outline-offset: 2px !important;
                text-decoration: underline !important;
            }
            body.a11y-highlight-links .a11y-panel a {
                outline: none !important;
            }

            /* Big cursor */
            body.a11y-big-cursor,
            body.a11y-big-cursor * {
                cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4l28 20H20l-4 16z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important;
            }

            /* Readable font */
            body.a11y-readable-font,
            body.a11y-readable-font * {
                font-family: Arial, Helvetica, sans-serif !important;
            }

            /* Line height */
            body.a11y-line-height,
            body.a11y-line-height * {
                line-height: 2 !important;
            }

            /* Letter spacing */
            body.a11y-letter-spacing,
            body.a11y-letter-spacing * {
                letter-spacing: 0.12em !important;
                word-spacing: 0.2em !important;
            }

            /* Text align */
            body.a11y-align-right * { text-align: right !important; }
            body.a11y-align-left * { text-align: left !important; }
            body.a11y-align-center * { text-align: center !important; }
        `;
        document.head.appendChild(style);
    }

    // --- Build Panel HTML ---
    function buildPanel() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'a11y-overlay';
        overlay.addEventListener('click', closePanel);
        document.body.appendChild(overlay);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'a11y-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'הגדרות נגישות');
        panel.innerHTML = `
            <div class="a11y-panel-header">
                <h2>♿ נגישות</h2>
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
                        <button class="a11y-option" data-action="contrast-high">
                            <span class="a11y-option-icon">🔲</span>
                            ניגודיות גבוהה
                        </button>
                        <button class="a11y-option" data-action="contrast-inverted">
                            <span class="a11y-option-icon">🔄</span>
                            היפוך צבעים
                        </button>
                        <button class="a11y-option" data-action="grayscale">
                            <span class="a11y-option-icon">⚫</span>
                            גווני אפור
                        </button>
                        <button class="a11y-option" data-action="links">
                            <span class="a11y-option-icon">🔗</span>
                            הדגשת קישורים
                        </button>
                    </div>
                </div>

                <div class="a11y-section">
                    <div class="a11y-section-title">קריאות</div>
                    <div class="a11y-grid">
                        <button class="a11y-option" data-action="font">
                            <span class="a11y-option-icon">Aa</span>
                            גופן קריא
                        </button>
                        <button class="a11y-option" data-action="lineHeight">
                            <span class="a11y-option-icon">↕</span>
                            ריווח שורות
                        </button>
                        <button class="a11y-option" data-action="letterSpacing">
                            <span class="a11y-option-icon">↔</span>
                            ריווח אותיות
                        </button>
                        <button class="a11y-option" data-action="animations">
                            <span class="a11y-option-icon">⏸</span>
                            ביטול אנימציות
                        </button>
                    </div>
                </div>

                <div class="a11y-section">
                    <div class="a11y-section-title">ניווט</div>
                    <div class="a11y-grid">
                        <button class="a11y-option" data-action="cursor">
                            <span class="a11y-option-icon">🖱️</span>
                            סמן מוגדל
                        </button>
                        <button class="a11y-option" data-action="align-right">
                            <span class="a11y-option-icon">⫸</span>
                            ישור לימין
                        </button>
                        <button class="a11y-option" data-action="align-left">
                            <span class="a11y-option-icon">⫷</span>
                            ישור לשמאל
                        </button>
                        <button class="a11y-option" data-action="align-center">
                            <span class="a11y-option-icon">☰</span>
                            ישור למרכז
                        </button>
                    </div>
                </div>

                <button class="a11y-reset" data-action="reset">↩ איפוס הגדרות</button>
            </div>
        `;

        document.body.appendChild(panel);

        // Close button
        panel.querySelector('.a11y-close').addEventListener('click', closePanel);

        // All option buttons
        panel.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function () {
                handleAction(this.dataset.action);
            });
        });

        // Floating button
        const btn = document.createElement('button');
        btn.className = 'a11y-btn';
        btn.setAttribute('aria-label', 'הגדרות נגישות');
        btn.textContent = '♿';
        btn.addEventListener('click', togglePanel);
        document.body.appendChild(btn);
    }

    function togglePanel() {
        document.querySelector('.a11y-panel').classList.toggle('open');
        document.querySelector('.a11y-overlay').classList.toggle('open');
    }

    function closePanel() {
        document.querySelector('.a11y-panel').classList.remove('open');
        document.querySelector('.a11y-overlay').classList.remove('open');
    }

    // --- Actions ---
    function handleAction(action) {
        switch (action) {
            case 'font-up':
                if (settings.fontSize < 5) settings.fontSize++;
                break;
            case 'font-down':
                if (settings.fontSize > -2) settings.fontSize--;
                break;
            case 'contrast-high':
                settings.contrast = settings.contrast === 'high' ? 'none' : 'high';
                break;
            case 'contrast-inverted':
                settings.contrast = settings.contrast === 'inverted' ? 'none' : 'inverted';
                break;
            case 'grayscale':
                settings.grayscale = !settings.grayscale;
                break;
            case 'animations':
                settings.animations = !settings.animations;
                break;
            case 'links':
                settings.links = !settings.links;
                break;
            case 'cursor':
                settings.cursor = !settings.cursor;
                break;
            case 'font':
                settings.font = !settings.font;
                break;
            case 'lineHeight':
                settings.lineHeight = !settings.lineHeight;
                break;
            case 'letterSpacing':
                settings.letterSpacing = !settings.letterSpacing;
                break;
            case 'align-right':
                settings.textAlign = settings.textAlign === 'right' ? 'none' : 'right';
                break;
            case 'align-left':
                settings.textAlign = settings.textAlign === 'left' ? 'none' : 'left';
                break;
            case 'align-center':
                settings.textAlign = settings.textAlign === 'center' ? 'none' : 'center';
                break;
            case 'reset':
                settings = { ...defaults };
                closePanel();
                break;
        }
        saveSettings();
        applySettings();
        updateUI();
    }

    // --- Apply Settings ---
    function applySettings() {
        const body = document.body;

        // Font size
        const pct = 100 + (settings.fontSize * 15);
        document.documentElement.style.fontSize = pct + '%';

        // Contrast
        body.classList.remove('a11y-contrast-high', 'a11y-contrast-inverted');
        if (settings.contrast === 'high') body.classList.add('a11y-contrast-high');
        if (settings.contrast === 'inverted') body.classList.add('a11y-contrast-inverted');

        // Grayscale
        body.classList.toggle('a11y-grayscale', settings.grayscale);

        // Animations
        body.classList.toggle('a11y-no-animations', !settings.animations);

        // Links
        body.classList.toggle('a11y-highlight-links', settings.links);

        // Cursor
        body.classList.toggle('a11y-big-cursor', settings.cursor);

        // Readable font
        body.classList.toggle('a11y-readable-font', settings.font);

        // Line height
        body.classList.toggle('a11y-line-height', settings.lineHeight);

        // Letter spacing
        body.classList.toggle('a11y-letter-spacing', settings.letterSpacing);

        // Text align
        body.classList.remove('a11y-align-right', 'a11y-align-left', 'a11y-align-center');
        if (settings.textAlign !== 'none') {
            body.classList.add('a11y-align-' + settings.textAlign);
        }
    }

    // --- Update Panel UI ---
    function updateUI() {
        const panel = document.querySelector('.a11y-panel');
        if (!panel) return;

        // Font label
        const label = panel.querySelector('#a11yFontLabel');
        if (label) label.textContent = (100 + settings.fontSize * 15) + '%';

        // Toggle active states
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
            if (action in map) {
                btn.classList.toggle('active', map[action]);
            }
        });
    }

    // --- Init ---
    function init() {
        injectCSS();
        applySettings(); // apply BEFORE panel (instant, no flash)

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                buildPanel();
                updateUI();
            });
        } else {
            buildPanel();
            updateUI();
        }
    }

    init();
})();
