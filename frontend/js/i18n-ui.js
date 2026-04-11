// Apply SQLite-backed strings to elements annotated with data-i18n* (see scripts/gen_app_i18n_en.py, i18n/*.json).
/** Catalogs store line breaks as the literal text `&#10;` (same as HTML attributes). JS `.placeholder` needs real newlines. */
function decodeI18nPlaceholderValue(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/&#10;/g, '\n').replace(/&#13;/g, '\r');
}

/** Placeholders for `[data-i18n-placeholder]`; respects `.*` regex toggle via `data-i18n-placeholder-regex`. */
function applyI18nPlaceholders() {
    const m = window.__appStr || {};
    if (!m || typeof m !== 'object') return;
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const fuzzyKey = el.dataset.i18nPlaceholder;
        const regexKey = el.dataset.i18nPlaceholderRegex;
        let k = fuzzyKey;
        if (regexKey) {
            const box = el.closest('.search-box');
            const regexBtn = box && box.querySelector('.btn-regex');
            if (regexBtn && regexBtn.classList.contains('active')) k = regexKey;
        }
        if (k && m[k] != null && m[k] !== '') el.placeholder = decodeI18nPlaceholderValue(m[k]);
    });
}

function applyUiI18n() {
    const m = window.__appStr || {};
    if (!m || typeof m !== 'object') return;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const k = el.dataset.i18n;
        if (k && m[k] != null && m[k] !== '') el.textContent = m[k];
    });
    applyI18nPlaceholders();
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const k = el.dataset.i18nTitle;
        if (k && m[k] != null && m[k] !== '') el.title = m[k];
    });
}

window.applyI18nPlaceholders = applyI18nPlaceholders;
window.applyUiI18n = applyUiI18n;
