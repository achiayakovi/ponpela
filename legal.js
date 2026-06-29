/* legal.js — חלון אישור תקנון בכניסה ראשונה + קישורי פוטר משפטיים
   אקודוס בע"מ (מותג פונפלה) · ponpela.co.il */
(function () {
  'use strict';
  var ACCENT = '#667eea';
  var STORAGE_KEY = 'ponpelaTermsAccepted_v1';
  var TERMS_URL = 'terms.html';
  var LINK = '#9fb0ff'; // צבע קישורי הפוטר (פוטר כהה) — קריא גם אחרי ביקור

  function currentFile() {
    var p = location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  // ---- עיצוב פוטר אחיד (מרכוז + מרווח + צבע visited קבוע) ----
  function injectFooterStyle() {
    if (document.getElementById('legal-style')) return;
    var st = document.createElement('style');
    st.id = 'legal-style';
    st.textContent =
      'footer{text-align:center;}' +
      'footer .container>p{margin:0;}' +
      'footer .footer-legal{margin-top:12px;font-size:.85rem;line-height:1.9;}' +
      'footer .footer-legal a,footer .footer-legal a:visited{color:' + LINK + ';text-decoration:none;margin:0 7px;font-weight:500;}' +
      'footer .footer-legal a:hover{text-decoration:underline;}';
    document.head.appendChild(st);
  }
  function injectFooterLinks() {
    injectFooterStyle();
    var footer = document.querySelector('footer .container') || document.querySelector('footer');
    if (!footer || footer.querySelector('.footer-legal')) return;
    var div = document.createElement('div');
    div.className = 'footer-legal';
    div.innerHTML =
      '<a href="' + TERMS_URL + '">תקנון ותנאי שימוש</a>·' +
      '<a href="' + TERMS_URL + '#privacy">מדיניות פרטיות</a>·' +
      '<a href="accessibility.html">הצהרת נגישות</a>';
    footer.appendChild(div);
  }

  function showConsent() {
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    if (currentFile() === TERMS_URL) return;

    var ov = document.createElement('div');
    ov.id = 'terms-consent';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,20,35,.55);display:flex;align-items:center;justify-content:center;padding:18px;';
    ov.innerHTML =
      '<div dir="rtl" style="background:#fff;max-width:440px;width:100%;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.3);padding:26px 24px;font-family:inherit;text-align:center;">' +
        '<div style="font-size:34px;line-height:1;margin-bottom:10px;">📄</div>' +
        '<h2 style="margin:0 0 10px;font-size:1.25rem;color:#26233a;">ברוכים הבאים</h2>' +
        '<p style="margin:0 0 18px;color:#6b6880;font-size:.98rem;line-height:1.7;">השימוש באתר כפוף ל<a href="' + TERMS_URL + '" style="color:' + ACCENT + ';font-weight:600;">תקנון ותנאי השימוש</a> ול<a href="' + TERMS_URL + '#privacy" style="color:' + ACCENT + ';font-weight:600;">מדיניות הפרטיות</a>. לחיצה על "אני מאשר/ת" מהווה הסכמה לתנאים.</p>' +
        '<button id="terms-accept" style="width:100%;padding:14px;border:none;border-radius:10px;background:' + ACCENT + ';color:#fff;font-size:1.05rem;font-weight:700;cursor:pointer;font-family:inherit;">אני מאשר/ת וממשיכ/ה</button>' +
        '<div style="margin-top:10px;"><a href="' + TERMS_URL + '" style="color:#9a97ad;font-size:.85rem;">קריאת התקנון המלא ←</a></div>' +
      '</div>';

    function accept() {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
      ov.remove();
      document.documentElement.style.overflow = '';
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(ov);
    document.getElementById('terms-accept').addEventListener('click', accept);
  }

  function init() {
    injectFooterLinks();
    showConsent();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
