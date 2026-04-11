/**
 * Menu-bar tray popover (WebView window `tray-popover`): Apple-style layout without artwork.
 * Window size is synced to `#shell` via `tray_popover_resize` (logical/CSS px — matches HiDPI layout).
 */
(function () {
    const TRAY_LOG_VERBOSE =
        typeof window !== 'undefined' && window.__TRAY_POPOVER_DEBUG === true;

    function trayDbg(...args) {
        if (TRAY_LOG_VERBOSE) console.info('[tray-popover]', ...args);
    }

    const tauri = typeof window !== 'undefined' ? window.__TAURI__ : null;
    const listen = tauri && tauri.event && typeof tauri.event.listen === 'function' ? tauri.event.listen : null;
    const invoke =
        tauri && tauri.core && typeof tauri.core.invoke === 'function' ? tauri.core.invoke : null;

    /** Tray window does not load `ipc.js` — mirror minimal `appFmt` + SQLite strings for tooltips. */
    window.__appStr = window.__appStr || {};
    if (typeof window.appFmt !== 'function') {
        window.appFmt = function (key, vars) {
            const map = window.__appStr;
            let s = map && map[key];
            if (s == null || s === '') return key;
            if (vars && typeof vars === 'object') {
                s = s.replace(/\{(\w+)\}/g, (_, name) =>
                    vars[name] != null && vars[name] !== '' ? String(vars[name]) : ''
                );
            }
            return s;
        };
    }
    const _trayI18nReady = invoke
        ? invoke('get_app_strings', {locale: null})
              .then((m) => {
                  window.__appStr = m || {};
              })
              .catch(() => {})
        : Promise.resolve();

    /* `getCurrentWebviewWindow()` must run after the webview exists — call in init, not at parse time. */
    function getTrayWebviewWindow() {
        return tauri && tauri.webviewWindow && typeof tauri.webviewWindow.getCurrentWebviewWindow === 'function'
            ? tauri.webviewWindow.getCurrentWebviewWindow()
            : null;
    }

    /** Tray IPC may use snake_case (`ui_theme`) or camelCase (`uiTheme`) depending on serializer. */
    function extractUiTheme(obj) {
        if (!obj || typeof obj !== 'object') return null;
        if (typeof obj.ui_theme === 'string') return obj.ui_theme;
        if (typeof obj.uiTheme === 'string') return obj.uiTheme;
        return null;
    }

    function extractAppearance(obj) {
        if (!obj || typeof obj !== 'object') return null;
        const a = obj.appearance;
        return a && typeof a === 'object' && !Array.isArray(a) ? a : null;
    }

    /**
     * `emit_to` delivers the tray struct as **`event.payload`** (Tauri `Event<T>`). Some bridges also pass
     * JSON strings. Rarely, a mistaken double-wrap `{ payload: { payload: state } }` appears — unwrap
     * up to a few levels. This is **not** the same as `invoke('cmd', { payload: … })` — events never use
     * that outer key; only the Event wrapper’s `.payload` holds the HUD state.
     */
    function trayListenUnwrap(arg) {
        if (arg == null) return null;
        let cur = arg;
        if (typeof cur === 'string') {
            try {
                cur = JSON.parse(cur);
            } catch {
                return null;
            }
        }
        let depth = 0;
        while (
            depth < 5 &&
            cur &&
            typeof cur === 'object' &&
            !Array.isArray(cur) &&
            Object.prototype.hasOwnProperty.call(cur, 'payload') &&
            cur.payload != null
        ) {
            const next = cur.payload;
            if (typeof next === 'string') {
                try {
                    cur = JSON.parse(next);
                } catch {
                    break;
                }
            } else {
                cur = next;
            }
            depth++;
        }
        return cur && typeof cur === 'object' ? cur : null;
    }

    /** Main-window scheme vars (`--cyan`, …) → popover `document.documentElement` (feeds `--cp-*` aliases in CSS). */
    function applyTrayAppearanceFromPayload(map, source) {
        if (!map || typeof map !== 'object') return;
        const root = document.documentElement.style;
        let applied = 0;
        const keys = [];
        for (const [k, v] of Object.entries(map)) {
            if (typeof k === 'string' && k.startsWith('--') && typeof v === 'string' && v.length > 0) {
                root.setProperty(k, v);
                applied++;
                keys.push(k);
            }
        }
        if (applied > 0) {
            console.info('[tray-popover] colorscheme applied', {
                source: source || 'payload',
                css_var_count: applied,
                keys_sample: keys.slice(0, 8),
                cyan: map['--cyan'],
            });
        }
    }

    /* Do not hide on blur: focus moves to the tray before the tray Click event, which would fight Rust toggle. */

    const shell = document.getElementById('shell');
    const elTitle = document.getElementById('trayPopoverTitle');
    const elSub = document.getElementById('subtitle');
    const elIdle = document.getElementById('idleHint');
    const elFill = document.getElementById('fill');
    const elThumb = document.getElementById('trackThumb');
    const elTrackBar = document.getElementById('trackBar');
    const elElapsed = document.getElementById('elapsed');
    const elTotal = document.getElementById('total');
    const btnPrev = document.getElementById('btnPrev');
    const btnPlay = document.getElementById('btnPlay');
    const btnNext = document.getElementById('btnNext');
    const elTrayVol = document.getElementById('trayVol');
    const elTrayVolPct = document.getElementById('trayVolPct');
    const elTrayVolLabel = document.getElementById('trayVolLabel');
    const elTraySpeed = document.getElementById('traySpeed');
    const elTraySpeedLabel = document.getElementById('traySpeedLabel');

    /** Same values as main `#npSpeed` — tray window does not load the full index bundle. */
    const TRAY_SPEED_OPTIONS = [
        { value: '0.25', i18n: 'ui.opt.0_25x' },
        { value: '0.5', i18n: 'ui.opt.0_5x' },
        { value: '0.75', i18n: 'ui.opt.0_75x' },
        { value: '1', i18n: 'ui.opt.1x' },
        { value: '1.25', i18n: 'ui.opt.1_25x' },
        { value: '1.5', i18n: 'ui.opt.1_5x' },
        { value: '2', i18n: 'ui.opt.2x' },
    ];

    let _trayApplyingHostControls = false;
    let _trayPopoverDomTheme = '';

    function applyTrayDocumentTheme(theme) {
        const t = theme === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', t);
        if (t !== _trayPopoverDomTheme) {
            _trayPopoverDomTheme = t;
            console.info('[tray-popover] documentElement data-theme ->', t);
        }
        scheduleResize();
    }

    let _trayPopoverApplyLog = { idle: null, playing: null, ui: null };

    function logTrayPopoverApplyState(p, idle, playing, themed) {
        const ui = themed || document.documentElement.getAttribute('data-theme') || '';
        if (_trayPopoverApplyLog.idle === idle && _trayPopoverApplyLog.playing === playing && _trayPopoverApplyLog.ui === ui) {
            return;
        }
        _trayPopoverApplyLog = { idle, playing, ui };
        const title = typeof p.title === 'string' ? p.title : '';
        const sub = typeof p.subtitle === 'string' ? p.subtitle : '';
        const appMap = extractAppearance(p);
        const appKeys = appMap ? Object.keys(appMap).filter((k) => k.startsWith('--')) : [];
        console.info('[tray-popover] applyState', {
            idle,
            playing,
            ui_theme: ui,
            titleLen: title.length,
            subtitleLen: sub.length,
            appearance_in_payload: appKeys.length,
        });
    }

    function fmt(sec) {
        if (typeof sec !== 'number' || !Number.isFinite(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    /** Logical size for `#shell` + document root; extra padding avoids WebKit clipping range rows / descenders. */
    const TRAY_WIN_PAD_W = 8;
    const TRAY_WIN_PAD_H = 18;

    function syncWindowSize() {
        if (!invoke) return;
        const root = document.getElementById('shell');
        if (!root) return;
        const br = root.getBoundingClientRect();
        const shellH = Math.ceil(Math.max(root.scrollHeight, root.offsetHeight, br.height));
        const shellW = Math.ceil(Math.max(root.scrollWidth, root.offsetWidth, br.width));
        const body = document.body;
        const docEl = document.documentElement;
        let bodyH = 0;
        let bodyW = 0;
        if (body) {
            const bbr = body.getBoundingClientRect();
            bodyH = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, bbr.height));
            bodyW = Math.ceil(Math.max(body.scrollWidth, body.offsetWidth, bbr.width));
        }
        let htmlH = 0;
        let htmlW = 0;
        if (docEl) {
            htmlH = Math.ceil(Math.max(docEl.scrollHeight, docEl.offsetHeight, docEl.clientHeight));
            htmlW = Math.ceil(Math.max(docEl.scrollWidth, docEl.offsetWidth, docEl.clientWidth));
        }
        const h = Math.max(shellH, bodyH, htmlH) + TRAY_WIN_PAD_H;
        const w = Math.max(shellW, bodyW, htmlW) + TRAY_WIN_PAD_W;
        void invoke('tray_popover_resize', { width: w, height: h }).catch(() => {});
    }

    function scheduleResize() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                syncWindowSize();
            });
        });
    }

    function normalizePayload(raw) {
        if (raw == null) return null;
        let o = raw;
        if (typeof o === 'string') {
            try {
                o = JSON.parse(o);
            } catch {
                return null;
            }
        }
        if (!o || typeof o !== 'object') return null;
        const p = { ...o };
        let elapsed = p.elapsed_sec ?? p.elapsedSec;
        if (typeof elapsed === 'string') elapsed = parseFloat(elapsed);
        if (typeof elapsed !== 'number' || !Number.isFinite(elapsed)) elapsed = 0;
        let total = p.total_sec ?? p.totalSec;
        if (typeof total === 'string') total = parseFloat(total);
        if (typeof total === 'number' && Number.isFinite(total) && total > 0) {
            p.total_sec = total;
        } else {
            p.total_sec = null;
        }
        p.elapsed_sec = elapsed;
        if (p.idle_hint == null && p.idleHint != null) p.idle_hint = p.idleHint;
        if (p.ui_theme == null && p.uiTheme != null) p.ui_theme = p.uiTheme;
        let vol = p.volume_pct ?? p.volumePct;
        if (typeof vol === 'string') vol = parseInt(vol, 10);
        if (typeof vol !== 'number' || !Number.isFinite(vol)) vol = 100;
        p.volume_pct = Math.max(0, Math.min(100, Math.round(vol)));
        let pSpeed = p.playback_speed ?? p.playbackSpeed;
        if (typeof pSpeed === 'string') pSpeed = parseFloat(pSpeed);
        if (typeof pSpeed !== 'number' || !Number.isFinite(pSpeed)) pSpeed = 1;
        p.playback_speed = Math.max(0.25, Math.min(2, pSpeed));
        return p;
    }

    function applyTrayExtrasFromState(volumePct, playbackSpeed) {
        _trayApplyingHostControls = true;
        try {
            if (elTrayVol) elTrayVol.value = String(volumePct);
            if (elTrayVolPct) elTrayVolPct.textContent = `${volumePct}%`;
            if (elTraySpeed && elTraySpeed.options.length > 0) {
                const sp = playbackSpeed;
                let bestIdx = 0;
                let bestDiff = Infinity;
                for (let i = 0; i < elTraySpeed.options.length; i++) {
                    const ov = parseFloat(elTraySpeed.options[i].value);
                    if (!Number.isFinite(ov)) continue;
                    const d = Math.abs(ov - sp);
                    if (d < bestDiff) {
                        bestDiff = d;
                        bestIdx = i;
                    }
                }
                elTraySpeed.selectedIndex = bestIdx;
            }
        } finally {
            _trayApplyingHostControls = false;
        }
    }

    function populateTraySpeedSelect() {
        if (!elTraySpeed) return;
        elTraySpeed.textContent = '';
        for (const row of TRAY_SPEED_OPTIONS) {
            const opt = document.createElement('option');
            opt.value = row.value;
            const label = window.appFmt(row.i18n);
            opt.textContent = label && label !== row.i18n ? label : `${row.value}×`;
            elTraySpeed.appendChild(opt);
        }
    }
    populateTraySpeedSelect();

    /**
     * Local playback model — between host pushes (every ~500 ms), a **`requestAnimationFrame`** loop
     * interpolates elapsed time against `performance.now()` so the slider animates smoothly at 60 fps
     * instead of stepping in 500 ms increments. The model is paused while the user drags the thumb and
     * resumes from the new base after `pointerup`.
     */
    let _baseElapsed = 0;
    let _baseTime = performance.now();
    let _currentTotal = null;
    let _currentPlaying = false;
    let _currentIdle = true;
    let _dragging = false;
    let _dragFrac = 0;
    let _rafId = null;

    function renderProgress(elapsed, total) {
        const tot = typeof total === 'number' && Number.isFinite(total) && total > 0 ? total : null;
        let pct = 0;
        if (tot != null) pct = Math.min(100, Math.max(0, (elapsed / tot) * 100));
        if (elFill) elFill.style.width = `${pct}%`;
        if (elThumb) elThumb.style.left = `${pct}%`;
        if (elElapsed) elElapsed.textContent = fmt(Math.max(0, tot != null ? Math.min(elapsed, tot) : elapsed));
    }

    function animationTick() {
        _rafId = null;
        if (_currentIdle) return;
        if (_dragging) {
            /* Drag preview: render whatever the pointer is pointing at, elapsed text follows. */
            renderProgress(_dragFrac * (_currentTotal || 0), _currentTotal);
            _rafId = requestAnimationFrame(animationTick);
            return;
        }
        const now = performance.now();
        const elapsed = _currentPlaying
            ? _baseElapsed + (now - _baseTime) / 1000
            : _baseElapsed;
        renderProgress(elapsed, _currentTotal);
        _rafId = requestAnimationFrame(animationTick);
    }

    function ensureAnimating() {
        if (_rafId == null && !_currentIdle) {
            _rafId = requestAnimationFrame(animationTick);
        }
    }

    function applyState(raw) {
        const p = normalizePayload(raw);
        if (!p) {
            console.warn('[tray-popover] applyState skipped — not a tray state object', {
                type: raw === null ? 'null' : typeof raw,
                sample: typeof raw === 'string' ? raw.slice(0, 200) : raw,
            });
            return;
        }
        const themed = extractUiTheme(p);
        if (themed) applyTrayDocumentTheme(themed);
        applyTrayAppearanceFromPayload(extractAppearance(p), 'tray-popover-state');
        const idle = p.idle === true;
        if (shell) shell.classList.toggle('idle', idle);
        if (elTitle) elTitle.textContent = typeof p.title === 'string' ? p.title : '';
        if (elSub) elSub.textContent = typeof p.subtitle === 'string' ? p.subtitle : '';
        if (elIdle) {
            elIdle.hidden = !idle;
            let idleLabel = '';
            if (idle) {
                if (typeof p.idle_hint === 'string' && p.idle_hint.trim() !== '') {
                    idleLabel = p.idle_hint;
                } else {
                    idleLabel = window.appFmt('tray.popover_idle');
                }
            }
            elIdle.textContent = idleLabel;
        }
        const elapsed = typeof p.elapsed_sec === 'number' && Number.isFinite(p.elapsed_sec) ? p.elapsed_sec : 0;
        const total = typeof p.total_sec === 'number' && Number.isFinite(p.total_sec) && p.total_sec > 0 ? p.total_sec : null;
        const playing = p.playing === true;
        /* Re-base the animation model from the host-reported values. `performance.now()` is the
         * zero-point for interpolation until the next push. */
        _baseElapsed = elapsed;
        _baseTime = performance.now();
        _currentTotal = total;
        _currentPlaying = playing;
        _currentIdle = idle;
        if (elTotal) elTotal.textContent = total != null ? fmt(total) : '—';
        if (!_dragging) renderProgress(elapsed, total);
        if (idle) {
            if (_rafId != null) {
                cancelAnimationFrame(_rafId);
                _rafId = null;
            }
        } else {
            ensureAnimating();
        }
        if (btnPlay) btnPlay.textContent = playing ? '⏸' : '▶';
        if (btnPlay) {
            const playT = playing ? window.appFmt('menu.pause') : window.appFmt('menu.play');
            btnPlay.setAttribute('title', playT);
        }
        applyTrayExtrasFromState(p.volume_pct, p.playback_speed);
        logTrayPopoverApplyState(p, idle, playing, themed);
        scheduleResize();
        setTimeout(() => {
            syncWindowSize();
        }, 0);
        setTimeout(() => {
            syncWindowSize();
        }, 80);
        setTimeout(() => {
            syncWindowSize();
        }, 260);
    }

    /* Drag-to-seek on the scrubber. Uses pointer capture so the drag still tracks even when the
     * cursor leaves the track bar, and blocks updates from host pushes (`applyState` honors
     * `_dragging`) so the thumb does not jitter while the user is scrubbing. */
    function pointerFraction(e) {
        if (!elTrackBar) return 0;
        const rect = elTrackBar.getBoundingClientRect();
        if (rect.width <= 0) return 0;
        const x = e.clientX - rect.left;
        return Math.max(0, Math.min(1, x / rect.width));
    }

    function sendSeek(frac) {
        if (!invoke) return;
        void invoke('tray_popover_action', {
            action: `seek:${frac.toFixed(4)}`,
        }).catch(() => {});
    }

    if (elTrackBar) {
        elTrackBar.addEventListener('pointerdown', (e) => {
            if (_currentIdle) return;
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            e.preventDefault();
            _dragging = true;
            _dragFrac = pointerFraction(e);
            try {
                elTrackBar.setPointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
            ensureAnimating();
        });
        elTrackBar.addEventListener('pointermove', (e) => {
            if (!_dragging) return;
            _dragFrac = pointerFraction(e);
        });
        const endDrag = (e) => {
            if (!_dragging) return;
            _dragging = false;
            try {
                elTrackBar.releasePointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
            sendSeek(_dragFrac);
            /* Optimistically re-base to the dragged position so the thumb does not snap back before
             * the next host push arrives (engine seek + playback_status poll can be > 250 ms). */
            if (_currentTotal != null) {
                _baseElapsed = _dragFrac * _currentTotal;
                _baseTime = performance.now();
                renderProgress(_baseElapsed, _currentTotal);
            }
            ensureAnimating();
        };
        elTrackBar.addEventListener('pointerup', endDrag);
        elTrackBar.addEventListener('pointercancel', endDrag);
    }

    function send(action) {
        if (!invoke) return;
        void invoke('tray_popover_action', { action }).catch(() => {});
    }

    if (btnPrev) btnPrev.addEventListener('click', () => send('prev_track'));
    if (btnPlay) btnPlay.addEventListener('click', () => send('play_pause'));
    if (btnNext) btnNext.addEventListener('click', () => send('next_track'));

    if (elTrayVol) {
        elTrayVol.addEventListener('input', () => {
            if (_trayApplyingHostControls) return;
            const v = parseInt(elTrayVol.value, 10);
            const n = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 100;
            if (elTrayVolPct) elTrayVolPct.textContent = `${n}%`;
            void invoke('tray_popover_action', { action: `volume:${n}` }).catch(() => {});
        });
    }
    if (elTraySpeed) {
        elTraySpeed.addEventListener('change', () => {
            if (_trayApplyingHostControls) return;
            const sp = parseFloat(elTraySpeed.value);
            if (!Number.isFinite(sp)) return;
            void invoke('tray_popover_action', { action: `speed:${sp}` }).catch(() => {});
        });
    }

    /** `WebviewWindow.listen` / `event.listen` return Promises — await so emits are not dropped on first open. */
    async function initTrayIpc() {
        await _trayI18nReady;
        if (btnPrev) btnPrev.setAttribute('title', window.appFmt('tray.previous_track'));
        if (btnNext) btnNext.setAttribute('title', window.appFmt('tray.next_track'));
        populateTraySpeedSelect();
        if (elTrayVolLabel) {
            const vLabel = window.appFmt('ui.ae.playback_volume_label');
            elTrayVolLabel.textContent = vLabel && vLabel !== 'ui.ae.playback_volume_label' ? vLabel : 'Vol';
        }
        if (elTraySpeedLabel) {
            const sLabel = window.appFmt('ui.np.label_speed');
            elTraySpeedLabel.textContent = sLabel && sLabel !== 'ui.np.label_speed' ? sLabel : 'Speed';
        }
        if (elTrayVol) elTrayVol.setAttribute('title', window.appFmt('ui.tt.volume_cmd_up_down'));
        if (elTraySpeed) elTraySpeed.setAttribute('title', window.appFmt('ui.tt.playback_speed'));

        const tw0 = getTrayWebviewWindow();
        console.info('[tray-popover] boot', {
            href: typeof location !== 'undefined' ? location.href : '',
            has_global_listen: !!listen,
            has_invoke: !!invoke,
            webview_label: tw0 && typeof tw0.label === 'string' ? tw0.label : undefined,
            webview_has_listen: !!(tw0 && typeof tw0.listen === 'function'),
        });
        const onState = (e) => {
            const raw = trayListenUnwrap(e);
            const top = e && typeof e === 'object' && !Array.isArray(e) ? e : null;
            console.info('[tray-popover] tray-popover-state ← host', {
                event_is_wrapper: !!(top && 'payload' in top && top.payload != null),
                event_name: top && typeof top.event === 'string' ? top.event : undefined,
                state_keys: raw && typeof raw === 'object' ? Object.keys(raw) : [],
                appearance_keys:
                    raw && raw.appearance && typeof raw.appearance === 'object'
                        ? Object.keys(raw.appearance).filter((k) => k.startsWith('--')).length
                        : 0,
            });
            applyState(raw);
        };
        const onTheme = (e) => {
            const raw = trayListenUnwrap(e);
            const th =
                extractUiTheme(raw) ||
                (raw && typeof raw === 'object' && typeof raw.theme === 'string' ? raw.theme : null);
            console.info('[tray-popover] tray-popover-ui-theme ← host', {
                event_is_wrapper: !!(e && typeof e === 'object' && 'payload' in e),
                raw,
                ui_theme: th || '(none)',
            });
            if (th) applyTrayDocumentTheme(th);
        };
        const scoped = { target: 'tray-popover' };
        try {
            const tw = getTrayWebviewWindow();
            if (tw && typeof tw.listen === 'function') {
                await tw.listen('tray-popover-state', onState);
                await tw.listen('tray-popover-ui-theme', onTheme);
                console.info('[tray-popover] IPC listeners registered (WebviewWindow.listen)', {
                    label: typeof tw.label === 'string' ? tw.label : '(unknown)',
                });
            } else if (listen) {
                try {
                    await listen('tray-popover-state', onState, scoped);
                    await listen('tray-popover-ui-theme', onTheme, scoped);
                    console.info('[tray-popover] IPC listeners registered (event.listen + target)', scoped);
                } catch (_) {
                    /* Older/global bundles may omit the `target` option. */
                    await listen('tray-popover-state', onState);
                    await listen('tray-popover-ui-theme', onTheme);
                    console.info('[tray-popover] IPC listeners registered (event.listen, no target)');
                }
            } else {
                console.warn('[tray-popover] no listen API — tray-popover-state events will not apply');
            }
        } catch (err) {
            console.warn('[tray-popover] IPC listen failed', err);
        }

        if (invoke) {
            try {
                const [theme, emit, build] = await Promise.all([
                    invoke('tray_popover_get_ui_theme').catch(() => 'dark'),
                    invoke('tray_popover_get_state').catch(() => null),
                    invoke('get_build_info').catch(() => null),
                ]);
                const bootState = emit ? trayListenUnwrap(emit) : null;
                console.info('[tray-popover] bootstrap invoke', {
                    tray_popover_get_ui_theme: theme,
                    tray_popover_get_state: bootState ? Object.keys(bootState) : null,
                });
                applyTrayDocumentTheme(typeof theme === 'string' ? theme : 'dark');
                if (bootState) applyState(bootState);
                const tm = document.getElementById('trayBuildMeta');
                if (tm && build && typeof build === 'object' && build.version) {
                    tm.textContent =
                        typeof formatBuildMetaLine === 'function'
                            ? formatBuildMetaLine(build)
                            : 'Version: v' + build.version;
                }
                if (build && typeof build === 'object' && build.version) {
                    document.title =
                        'AUDIO_HAXOR · ' +
                        (typeof formatBuildMetaLine === 'function'
                            ? formatBuildMetaLine(build)
                            : 'Version: v' + build.version);
                }
            } catch (err) {
                console.warn('[tray-popover] bootstrap invoke failed', err);
            }
        }
    }

    void initTrayIpc();

    function initSizeAfterFonts() {
        const run = () => scheduleResize();
        if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.ready !== 'undefined') {
            void document.fonts.ready.then(run).catch(run);
        } else {
            run();
        }
    }
    if (typeof ResizeObserver === 'function' && shell) {
        const ro = new ResizeObserver(() => {
            scheduleResize();
        });
        ro.observe(shell);
    }

    if (document.readyState === 'complete') {
        initSizeAfterFonts();
    } else {
        window.addEventListener('load', () => initSizeAfterFonts(), { once: true });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const tw = getTrayWebviewWindow();
        if (tw && typeof tw.hide === 'function') void tw.hide().catch(() => {});
    });
})();
