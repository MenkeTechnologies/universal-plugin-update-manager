/**
 * Per-graph freeze for live canvases (Visualizer tiles, mini FFT, parametric EQ, Audio Engine diagnostics).
 * Persisted as JSON in prefs `graphFreezeMap` — not a single global pause.
 */
(function graphFreezeInit() {
    const PREF_KEY = 'graphFreezeMap';
    const LEGACY_FFT_PAUSE = 'fftAnimationPaused';

    const GF = {
        VIZ_FFT: 'viz:fft',
        VIZ_OSC: 'viz:oscilloscope',
        VIZ_SPEC: 'viz:spectrogram',
        VIZ_STEREO: 'viz:stereo',
        VIZ_LEVELS: 'viz:levels',
        VIZ_BANDS: 'viz:bands',
        NP_FFT: 'np:fft',
        NP_EQ: 'np:eq',
        AE_EQ: 'ae:eq',
        AE_MID: 'ae:midSide',
        AE_BAL: 'ae:balance',
        AE_COR: 'ae:correlation',
        AE_WID: 'ae:width',
        AE_CRE: 'ae:crest',
        AE_DLR: 'ae:lMinusR',
        AE_ENE: 'ae:energy',
        AE_GON: 'ae:gonio',
        AE_DC: 'ae:dcOffset',
        AE_HIST: 'ae:magHist',
        AE_PEAK: 'ae:peakSample',
        AE_MONO_W: 'ae:monoWave',
        AE_SIDE_W: 'ae:sideWave',
        AE_LR_OVR: 'ae:lrOverlay',
        AE_ABS_DR: 'ae:absDiffHist',
        AE_LISS: 'ae:lissajous',
    };

    function readMapRaw() {
        try {
            if (typeof prefs === 'undefined' || !prefs.getItem) return {};
            const raw = prefs.getItem(PREF_KEY);
            if (!raw) return {};
            const o = JSON.parse(raw);
            return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
        } catch {
            return {};
        }
    }

    function migrateLegacyGlobalPause() {
        try {
            if (typeof prefs === 'undefined' || !prefs.getItem || !prefs.setItem) return;
            if (prefs.getItem(LEGACY_FFT_PAUSE) !== '1') return;
            const m = readMapRaw();
            if (Object.keys(m).length > 0) {
                prefs.setItem(LEGACY_FFT_PAUSE, '0');
                return;
            }
            const ids = [GF.NP_FFT, GF.NP_EQ, GF.AE_EQ, GF.VIZ_FFT];
            for (let i = 0; i < ids.length; i++) m[ids[i]] = true;
            prefs.setItem(PREF_KEY, JSON.stringify(m));
            prefs.setItem(LEGACY_FFT_PAUSE, '0');
        } catch {
            /* ignore */
        }
    }

    function writeMap(m) {
        if (typeof prefs === 'undefined' || !prefs.setItem) return;
        prefs.setItem(PREF_KEY, JSON.stringify(m));
    }

    function isGraphFrozen(id) {
        if (!id) return false;
        return readMapRaw()[id] === true;
    }

    function setGraphFrozen(id, on) {
        if (!id) return;
        const m = readMapRaw();
        if (on) m[id] = true;
        else delete m[id];
        writeMap(m);
        try {
            document.dispatchEvent(new CustomEvent('graph-freeze-changed', {detail: {id, frozen: !!on}}));
        } catch {
            /* ignore */
        }
    }

    function toggleGraphFrozen(id) {
        setGraphFrozen(id, !isGraphFrozen(id));
        return isGraphFrozen(id);
    }

    function aeCanvasIdToFreezeId(canvasId) {
        switch (canvasId) {
            case 'aeGraphMidSide':
                return GF.AE_MID;
            case 'aeGraphBalance':
                return GF.AE_BAL;
            case 'aeGraphCorrelation':
                return GF.AE_COR;
            case 'aeGraphWidth':
                return GF.AE_WID;
            case 'aeGraphCrest':
                return GF.AE_CRE;
            case 'aeGraphLMinusR':
                return GF.AE_DLR;
            case 'aeGraphEnergy':
                return GF.AE_ENE;
            case 'aeGraphGonio':
                return GF.AE_GON;
            case 'aeGraphDcOffset':
                return GF.AE_DC;
            case 'aeGraphMagHist':
                return GF.AE_HIST;
            case 'aeGraphPeakSample':
                return GF.AE_PEAK;
            case 'aeGraphMonoWave':
                return GF.AE_MONO_W;
            case 'aeGraphSideWave':
                return GF.AE_SIDE_W;
            case 'aeGraphLrOverlay':
                return GF.AE_LR_OVR;
            case 'aeGraphAbsDiffHist':
                return GF.AE_ABS_DR;
            case 'aeGraphLissajous':
                return GF.AE_LISS;
            default:
                return null;
        }
    }

    migrateLegacyGlobalPause();

    if (typeof window !== 'undefined') {
        window.GRAPH_FREEZE_ID = GF;
        window.isGraphFrozen = isGraphFrozen;
        window.setGraphFrozen = setGraphFrozen;
        window.toggleGraphFrozen = toggleGraphFrozen;
        window.aeCanvasIdToGraphFreezeId = aeCanvasIdToFreezeId;
    }
})();
