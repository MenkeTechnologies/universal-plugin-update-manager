//! Generate a TRUE techno arrangement with proper structure
//! - Pick 1-2 loops per track
//! - Place according to song structure (intro, build, breakdown, drop, outro)
//! - Elements enter/exit at correct bar positions

use app_lib::als_generator::generate_empty_als;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use regex::Regex;
use rusqlite::Connection;
use std::collections::HashSet;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use std::sync::atomic::{AtomicU32, Ordering};

const DB_PATH: &str = "/Users/wizard/Library/Application Support/com.menketechnologies.audio-haxor/audio_haxor.db";
const PROJECT_BPM: f64 = 128.0;

// Arrangement structure (224 bars = 7 minutes at 128 BPM)
// All values in bars (1-indexed)
const TOTAL_BARS: u32 = 224;

// Section boundaries (all 32 bars each)
const INTRO_START: u32 = 1;
const INTRO_END: u32 = 32;       // 32 bars
const BUILD1_START: u32 = 33;
const BUILD1_END: u32 = 64;      // 32 bars
const BREAKDOWN_START: u32 = 65;
const BREAKDOWN_END: u32 = 96;   // 32 bars
const DROP1_START: u32 = 97;
const DROP1_END: u32 = 128;      // 32 bars
const DROP2_START: u32 = 129;
const DROP2_END: u32 = 160;      // 32 bars
const FADEDOWN_START: u32 = 161;
const FADEDOWN_END: u32 = 192;   // 32 bars
const OUTRO_START: u32 = 193;
const OUTRO_END: u32 = 224;      // 32 bars

// Element entry/exit positions (in bars, supports fractional for beat precision)
// 16.75 = bar 16, beat 4 (last beat of bar 16)
// 17.0 = bar 17, beat 1 (downbeat)
struct TrackArrangement {
    name: &'static str,
    sections: Vec<(f64, f64)>, // (start_bar, end_bar) pairs where element plays
}

fn get_arrangement() -> Vec<TrackArrangement> {
    // 8-BAR RULE: Every 8 bars, add something (intro/build) or drop something (fadedown)
    // 224 bars = 7 sections of 32 bars each
    //
    // INTRO:     1-32    (add elements)
    // BUILD:     33-64   (add elements)
    // BREAKDOWN: 65-96   (kick/bass out, melodic)
    // DROP 1:    97-128  (full energy)
    // DROP 2:    129-160 (full energy)
    // FADEDOWN:  161-192 (drop elements every 8 bars)
    // OUTRO:     193-224 (minimal, mirror intro)
    //
    // FILL RULE: Main elements (kick, clap, hat, bass) drop out 1 bar before 
    // each 8-bar phrase boundary to make room for fills

    vec![
        // === DRUMS ===
        // KICK: gaps for varied fill lengths
        // 1 beat gap (0.25 bars): bars 16, 56, 104, 136, 168, 216
        // 2 beat gap (0.5 bars): bars 24, 40, 72, 88, 120, 152, 184, 208
        // 4 beat gap (1 bar): bars 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192
        TrackArrangement {
            name: "KICK",
            sections: vec![
                // INTRO (1-32)
                (1.0, 15.75),     // 1-16 (1 beat gap)
                (17.0, 23.5),     // 17-24 (2 beat gap)
                (25.0, 31.0),     // 25-32 (4 beat gap)
                // BUILD (33-64)
                (33.0, 39.5),     // 33-40 (2 beat gap)
                (41.0, 47.0),     // 41-48 (4 beat gap)
                (49.0, 55.75),    // 49-56 (1 beat gap)
                (57.0, 63.0),     // 57-64 (4 beat gap)
                // BREAKDOWN: kick OUT (65-96)
                // DROP 1 (97-128)
                (97.0, 103.75),   // 97-104 (1 beat gap)
                (105.0, 111.0),   // 105-112 (4 beat gap)
                (113.0, 119.5),   // 113-120 (2 beat gap)
                (121.0, 127.0),   // 121-128 (4 beat gap)
                // DROP 2 (129-160)
                (129.0, 135.75),  // 129-136 (1 beat gap)
                (137.0, 143.0),   // 137-144 (4 beat gap)
                (145.0, 151.5),   // 145-152 (2 beat gap)
                (153.0, 159.0),   // 153-160 (4 beat gap)
                // FADEDOWN (161-192)
                (161.0, 167.75),  // 161-168 (1 beat gap)
                (169.0, 175.0),   // 169-176 (4 beat gap)
                (177.0, 183.5),   // 177-184 (2 beat gap)
                (185.0, 191.0),   // 185-192 (4 beat gap)
                // OUTRO (193-224)
                (193.0, 207.5),   // 193-208 (2 beat gap)
                (209.0, 215.75),  // 209-216 (1 beat gap)
                (217.0, 224.0),   // final phrase
            ],
        },
        // FADEDOWN (161-192) + OUTRO (193-224) drops every 8 bars:
        // Bar 161: start fadedown (full energy still)
        // Bar 169: -SYNTH 2, -SYNTH 3, -ARP, -ARP 2, -SUB
        // Bar 177: -SYNTH 1, -PAD, -PERC 2, -HAT 2, -RIDE
        // Bar 185: -PERC, -HAT
        // Bar 193: -CLAP (outro starts)
        // Bar 201: -BASS
        // Bar 209: (kick + atmos only)
        // Bar 217: (kick + atmos only)
        
        // CLAP: enters bar 9, varied gaps for fills
        TrackArrangement {
            name: "CLAP",
            sections: vec![
                // INTRO
                (9.0, 15.75),     // 9-16 (1 beat gap)
                (17.0, 23.5),     // 17-24 (2 beat gap)
                (25.0, 31.0),     // 25-32 (4 beat gap)
                // BUILD
                (33.0, 39.5),
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                // FADEDOWN
                (161.0, 167.75),
                (169.0, 175.0),
                (177.0, 183.5),
                (185.0, 191.0),   // drops at 193
            ],
        },
        // HAT: enters bar 17, varied gaps
        TrackArrangement {
            name: "HAT",
            sections: vec![
                // INTRO
                (17.0, 23.5),
                (25.0, 31.0),
                // BUILD
                (33.0, 39.5),
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                // FADEDOWN
                (161.0, 167.75),
                (169.0, 175.0),
                (177.0, 183.0),   // drops at 185
            ],
        },
        TrackArrangement {
            name: "HAT 2",
            sections: vec![
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),
                (169.0, 175.0),   // drops at 177
            ],
        },
        TrackArrangement {
            name: "PERC",
            sections: vec![
                (25.0, 31.0),
                // BUILD
                (33.0, 39.5),
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                // FADEDOWN
                (161.0, 167.75),
                (169.0, 175.0),
                (177.0, 183.0),   // drops at 185
            ],
        },
        TrackArrangement {
            name: "PERC 2",
            sections: vec![
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                (113.0, 119.5),
                (121.0, 127.0),
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),
                (169.0, 175.0),   // drops at 177
            ],
        },
        TrackArrangement {
            name: "RIDE",
            sections: vec![
                (33.0, 39.5),
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),
                (169.0, 175.0),   // drops at 177
            ],
        },
        
        // === BASS ===
        // BASS: enters bar 33, varied gaps
        TrackArrangement {
            name: "BASS",
            sections: vec![
                // BUILD
                (33.0, 39.5),
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // Breakdown: out
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                // FADEDOWN
                (161.0, 167.75),
                (169.0, 175.0),
                (177.0, 183.5),
                (185.0, 191.0),
                (193.0, 199.0),   // drops at 201
            ],
        },
        // SUB: gaps for fills (same pattern as bass)
        TrackArrangement {
            name: "SUB",
            sections: vec![
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),  // drops at 169
            ],
        },
        
        // === MELODICS (all with fill gaps) ===
        // MAIN SYNTH - the lead, introduced mid-breakdown (bar 81), explodes in drop
        TrackArrangement {
            name: "MAIN SYNTH",
            sections: vec![
                (81.0, 87.5),     // mid-breakdown (2 beat gap at 88)
                (89.0, 95.0),     // (4 beat gap at 96)
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                // DROP 2
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                // brief return in outro
                (185.0, 191.0),
            ],
        },
        TrackArrangement {
            name: "SYNTH 1",
            sections: vec![
                // BUILD
                (41.0, 47.0),
                (49.0, 55.75),
                (57.0, 63.0),
                // BREAKDOWN
                (73.0, 79.0),
                (81.0, 87.5),
                (89.0, 95.0),
                // DROPS
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),
                (169.0, 175.0),   // drops at 177
            ],
        },
        TrackArrangement {
            name: "SYNTH 2",
            sections: vec![
                (105.0, 111.0),
                (113.0, 119.5),
                (121.0, 127.0),
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),  // drops at 169
            ],
        },
        TrackArrangement {
            name: "SYNTH 3",
            sections: vec![
                (113.0, 119.5),
                (121.0, 127.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),  // drops at 169
            ],
        },
        TrackArrangement {
            name: "PAD",
            sections: vec![
                // BUILD
                (49.0, 55.75),
                (57.0, 63.0),
                // BREAKDOWN
                (65.0, 71.5),
                (73.0, 79.0),
                (81.0, 87.5),
                (89.0, 95.0),
                // DROPS
                (129.0, 135.75),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),
                (169.0, 175.0),   // drops at 177
            ],
        },
        TrackArrangement {
            name: "PAD 2",
            sections: vec![
                (81.0, 87.5),
                (89.0, 95.0),
            ],
        },
        TrackArrangement {
            name: "ARP",
            sections: vec![
                (57.0, 63.0),
                (89.0, 95.0),
                // DROP 1
                (97.0, 103.75),
                (105.0, 111.0),
                (113.0, 119.5),
                // DROP 2
                (129.0, 135.75),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),  // drops at 169
            ],
        },
        TrackArrangement {
            name: "ARP 2",
            sections: vec![
                (121.0, 127.0),
                (137.0, 143.0),
                (145.0, 151.5),
                (153.0, 159.0),
                (161.0, 167.75),  // drops at 169
            ],
        },
        
        // === FX - RISERS (layered for maximum tension) ===
        TrackArrangement {
            name: "RISER 1",  // main long risers (8 bars)
            sections: vec![
                (25.0, 32.0),     // pre-build
                (57.0, 64.0),     // pre-breakdown
                (89.0, 96.0),     // PRE-DROP 1 - the big one!
                (121.0, 128.0),   // mid drop 1
                (153.0, 160.0),   // pre-fadedown
                (185.0, 192.0),   // pre-outro
            ],
        },
        TrackArrangement {
            name: "RISER 2",  // secondary risers (different sample)
            sections: vec![
                (9.0, 16.0),      // early intro tension
                (41.0, 48.0),     // mid build
                (89.0, 96.0),     // PRE-DROP 1 - layer
                (137.0, 144.0),   // mid drop 2
                (177.0, 184.0),   // fadedown tension
            ],
        },
        TrackArrangement {
            name: "RISER 3",  // short accent risers (4 bars)
            sections: vec![
                (13.0, 16.0),     // intro accent
                (29.0, 32.0),     // pre-build accent
                (45.0, 48.0),     // build accent
                (61.0, 64.0),     // pre-breakdown
                (77.0, 80.0),     // breakdown tension
                (93.0, 96.0),     // PRE-DROP final 4
                (109.0, 112.0),   // drop 1 accent
                (125.0, 128.0),   // end drop 1
                (141.0, 144.0),   // drop 2 accent
                (157.0, 160.0),   // end drop 2
                (173.0, 176.0),   // fadedown accent
                (189.0, 192.0),   // pre-outro
            ],
        },
        
        // === FX - SNARE ROLLS (critical for tension!) ===
        TrackArrangement {
            name: "SNARE ROLL",
            sections: vec![
                (29.0, 32.0),     // pre-build (4 bars)
                (61.0, 64.0),     // pre-breakdown (4 bars)
                (89.0, 96.0),     // PRE-DROP 1 - full 8 bar roll!
                (125.0, 128.0),   // end drop 1 (4 bars)
                (153.0, 160.0),   // pre-fadedown (8 bars)
                (189.0, 192.0),   // pre-outro (4 bars)
            ],
        },
        
        // === FX - DRUM FILLS (varied lengths - unpredictable) ===
        // 1 BEAT fills (0.25 bars) - quick accents
        TrackArrangement {
            name: "FILL 1B",
            sections: vec![
                (15.75, 16.0),    // bar 16
                (55.75, 56.0),    // bar 56
                (103.75, 104.0),  // bar 104
                (135.75, 136.0),  // bar 136
                (167.75, 168.0),  // bar 168
                (215.75, 216.0),  // bar 216
            ],
        },
        // 2 BEAT fills (0.5 bars) - medium energy
        TrackArrangement {
            name: "FILL 2B",
            sections: vec![
                (23.5, 24.0),     // bar 24
                (39.5, 40.0),     // bar 40
                (71.5, 72.0),     // bar 72
                (87.5, 88.0),     // bar 88
                (119.5, 120.0),   // bar 120
                (151.5, 152.0),   // bar 152
                (183.5, 184.0),   // bar 184
                (207.5, 208.0),   // bar 208
            ],
        },
        // 4 BEAT fills (1 bar) - big transitions
        TrackArrangement {
            name: "FILL 4B",
            sections: vec![
                (31.0, 32.0),     // into build
                (47.0, 48.0),     // mid build
                (63.0, 64.0),     // into breakdown
                (79.0, 80.0),     // mid breakdown
                (95.0, 96.0),     // INTO DROP 1 - the big one!
                (111.0, 112.0),   // mid drop 1
                (127.0, 128.0),   // into drop 2
                (143.0, 144.0),   // mid drop 2
                (159.0, 160.0),   // into fadedown
                (175.0, 176.0),   // mid fadedown
                (191.0, 192.0),   // into outro
            ],
        },
        
        // === FX - REVERSE CRASHES (suck into sections) ===
        TrackArrangement {
            name: "REVERSE",
            sections: vec![
                (15.0, 16.0),     // into bar 17
                (31.0, 32.0),     // into build
                (47.0, 48.0),     // mid build
                (63.0, 64.0),     // into breakdown
                (79.0, 80.0),     // mid breakdown
                (95.0, 96.0),     // INTO DROP 1
                (111.0, 112.0),   // mid drop 1
                (127.0, 128.0),   // into drop 2
                (143.0, 144.0),   // mid drop 2
                (159.0, 160.0),   // into fadedown
                (175.0, 176.0),   // mid fadedown
                (191.0, 192.0),   // into outro
            ],
        },
        
        // === FX - SUB DROP (impact on big moments) ===
        TrackArrangement {
            name: "SUB DROP",
            sections: vec![
                (33.0, 33.0),     // build start
                (65.0, 65.0),     // breakdown start
                (97.0, 97.0),     // DROP 1 hit
                (129.0, 129.0),   // DROP 2 hit
                (161.0, 161.0),   // fadedown start
            ],
        },
        
        // === FX - DOWNLIFTERS ===
        TrackArrangement {
            name: "DOWNLIFTER",
            sections: vec![
                (33.0, 40.0),     // build start (energy down then up)
                (65.0, 72.0),     // into breakdown
                (97.0, 104.0),    // post-drop settle
                (129.0, 136.0),   // post-drop 2
                (161.0, 168.0),   // into fadedown
                (193.0, 200.0),   // into outro
            ],
        },
        
        // === FX - IMPACTS/CRASHES (more frequent) ===
        TrackArrangement {
            name: "CRASH",
            sections: vec![
                // Every 8 bars for energy
                (1.0, 1.0), (9.0, 9.0), (17.0, 17.0), (25.0, 25.0),
                (33.0, 33.0), (41.0, 41.0), (49.0, 49.0), (57.0, 57.0),
                (65.0, 65.0), (73.0, 73.0), (81.0, 81.0), (89.0, 89.0),
                (97.0, 97.0), (105.0, 105.0), (113.0, 113.0), (121.0, 121.0),
                (129.0, 129.0), (137.0, 137.0), (145.0, 145.0), (153.0, 153.0),
                (161.0, 161.0), (169.0, 169.0), (177.0, 177.0), (185.0, 185.0),
                (193.0, 193.0), (201.0, 201.0), (209.0, 209.0), (217.0, 217.0),
            ],
        },
        TrackArrangement {
            name: "IMPACT",
            sections: vec![
                (1.0, 1.0),       // track start
                (33.0, 33.0),     // build start
                (65.0, 65.0),     // breakdown
                (97.0, 97.0),     // DROP 1
                (129.0, 129.0),   // DROP 2
                (161.0, 161.0),   // fadedown
                (193.0, 193.0),   // outro
            ],
        },
        TrackArrangement {
            name: "HIT",  // accent hits
            sections: vec![
                // Offbeat hits for groove
                (5.0, 5.0), (13.0, 13.0), (21.0, 21.0), (29.0, 29.0),
                (37.0, 37.0), (45.0, 45.0), (53.0, 53.0), (61.0, 61.0),
                (69.0, 69.0), (77.0, 77.0), (85.0, 85.0), (93.0, 93.0),
                (101.0, 101.0), (109.0, 109.0), (117.0, 117.0), (125.0, 125.0),
                (133.0, 133.0), (141.0, 141.0), (149.0, 149.0), (157.0, 157.0),
                (165.0, 165.0), (173.0, 173.0), (181.0, 181.0), (189.0, 189.0),
                (197.0, 197.0), (205.0, 205.0), (213.0, 213.0), (221.0, 221.0),
            ],
        },
        
        // === FX - SWEEPS (many more!) ===
        TrackArrangement {
            name: "SWEEP UP",
            sections: vec![
                // Short sweeps (2 bars)
                (7.0, 8.0),       // intro
                (15.0, 16.0),
                (23.0, 24.0),
                // Medium sweeps (4 bars)
                (29.0, 32.0),     // pre-build
                (45.0, 48.0),
                (61.0, 64.0),     // pre-breakdown
                (77.0, 80.0),
                // Long sweep before drop
                (89.0, 96.0),     // PRE-DROP 1 - 8 bar sweep!
                // More throughout
                (109.0, 112.0),
                (125.0, 128.0),
                (141.0, 144.0),
                (157.0, 160.0),
                (173.0, 176.0),
                (185.0, 192.0),   // pre-outro
            ],
        },
        TrackArrangement {
            name: "SWEEP DOWN",
            sections: vec![
                // After every major hit, sweep down
                (1.0, 4.0),       // track start
                (17.0, 20.0),
                (33.0, 36.0),     // build start
                (49.0, 52.0),
                (65.0, 72.0),     // breakdown start - long
                (81.0, 84.0),
                (97.0, 104.0),    // post-drop 1
                (113.0, 116.0),
                (129.0, 136.0),   // post-drop 2
                (145.0, 148.0),
                (161.0, 168.0),   // fadedown
                (177.0, 180.0),
                (193.0, 200.0),   // outro
                (209.0, 212.0),
            ],
        },
        TrackArrangement {
            name: "SWEEP UP 2",  // second sweep layer
            sections: vec![
                (13.0, 16.0),
                (29.0, 32.0),
                (53.0, 56.0),
                (61.0, 64.0),
                (89.0, 96.0),     // layer on pre-drop
                (121.0, 128.0),
                (153.0, 160.0),
                (185.0, 192.0),
            ],
        },
        TrackArrangement {
            name: "SWEEP DOWN 2",  // second down sweep
            sections: vec![
                (17.0, 24.0),
                (65.0, 80.0),     // long breakdown sweep
                (97.0, 112.0),    // post-drop decay
                (161.0, 176.0),   // fadedown atmosphere
            ],
        },
        
        // === FX - NOISE (white noise - more texture) ===
        TrackArrangement {
            name: "NOISE",
            sections: vec![
                (9.0, 16.0),      // intro texture
                (25.0, 32.0),     // pre-build
                (41.0, 48.0),     // build tension
                (57.0, 64.0),     // pre-breakdown
                (73.0, 80.0),     // breakdown texture
                (89.0, 96.0),     // PRE-DROP 1 - full noise
                (105.0, 112.0),   // drop 1 texture
                (121.0, 128.0),   // end drop 1
                (137.0, 144.0),   // drop 2 texture
                (153.0, 160.0),   // pre-fadedown
                (169.0, 176.0),   // fadedown texture
                (185.0, 192.0),   // pre-outro
            ],
        },
        TrackArrangement {
            name: "NOISE 2",  // second noise layer
            sections: vec![
                (29.0, 32.0),     // build accent
                (61.0, 64.0),     // pre-breakdown accent
                (89.0, 96.0),     // pre-drop layer
                (125.0, 128.0),   // end drop 1
                (157.0, 160.0),   // end drop 2
                (189.0, 192.0),   // pre-outro
            ],
        },
        
        // === ATMOSPHERE ===
        TrackArrangement {
            name: "ATMOS",
            sections: vec![
                (1.0, 64.0),
                (65.0, 96.0),
                (97.0, 224.0),    // through outro
            ],
        },
        TrackArrangement {
            name: "ATMOS 2",
            sections: vec![
                (65.0, 96.0),
                (129.0, 160.0),
            ],
        },
        TrackArrangement {
            name: "VOX",
            sections: vec![
                (81.0, 96.0),
                (113.0, 128.0),
                (145.0, 160.0),
            ],
        },
    ]
}

fn read_wav_duration(path: &str) -> Option<f64> {
    use std::io::{Read, Seek, SeekFrom};
    
    let mut file = File::open(path).ok()?;
    let mut header = [0u8; 44];
    file.read_exact(&mut header).ok()?;
    
    if &header[0..4] != b"RIFF" || &header[8..12] != b"WAVE" {
        return None;
    }
    
    file.seek(SeekFrom::Start(12)).ok()?;
    
    let mut chunk_header = [0u8; 8];
    let mut sample_rate: u32 = 0;
    let mut bits_per_sample: u16 = 0;
    let mut channels: u16 = 0;
    let mut data_size: u32 = 0;
    
    loop {
        if file.read_exact(&mut chunk_header).is_err() {
            break;
        }
        
        let chunk_id = &chunk_header[0..4];
        let chunk_size = u32::from_le_bytes([chunk_header[4], chunk_header[5], chunk_header[6], chunk_header[7]]);
        
        if chunk_id == b"fmt " {
            let mut fmt_data = vec![0u8; chunk_size as usize];
            file.read_exact(&mut fmt_data).ok()?;
            
            channels = u16::from_le_bytes([fmt_data[2], fmt_data[3]]);
            sample_rate = u32::from_le_bytes([fmt_data[4], fmt_data[5], fmt_data[6], fmt_data[7]]);
            bits_per_sample = u16::from_le_bytes([fmt_data[14], fmt_data[15]]);
        } else if chunk_id == b"data" {
            data_size = chunk_size;
            break;
        } else {
            file.seek(SeekFrom::Current(chunk_size as i64)).ok()?;
        }
    }
    
    if sample_rate == 0 || channels == 0 || bits_per_sample == 0 || data_size == 0 {
        return None;
    }
    
    let bytes_per_sample = (bits_per_sample / 8) as u32;
    let total_samples = data_size / (bytes_per_sample * channels as u32);
    let duration = total_samples as f64 / sample_rate as f64;
    
    Some(duration)
}

const GROUP_TRACK_TEMPLATE: &str = include_str!("../src/group_track_template.xml");

const DRUMS_COLOR: u32 = 69;
const BASS_COLOR: u32 = 13;
const MELODICS_COLOR: u32 = 26;
const FX_COLOR: u32 = 57;

struct IdAllocator {
    next_id: AtomicU32,
    used_ids: std::sync::Mutex<HashSet<u32>>,
}

impl IdAllocator {
    fn new(start: u32) -> Self {
        Self {
            next_id: AtomicU32::new(start),
            used_ids: std::sync::Mutex::new(HashSet::new()),
        }
    }

    fn alloc(&self) -> u32 {
        loop {
            let id = self.next_id.fetch_add(1, Ordering::SeqCst);
            let mut used = self.used_ids.lock().unwrap();
            if !used.contains(&id) {
                used.insert(id);
                return id;
            }
        }
    }

    fn reserve(&self, id: u32) {
        let mut used = self.used_ids.lock().unwrap();
        used.insert(id);
    }

    fn max_id(&self) -> u32 {
        self.next_id.load(Ordering::SeqCst)
    }
}

fn main() {
    let output_path = Path::new("/Users/wizard/Desktop/True_Techno.als");

    match generate_true_techno(output_path) {
        Ok(()) => {
            println!("Generated: {}", output_path.display());
            println!("\nTrue Techno Arrangement (224 bars / 7 min at 128 BPM)");
            println!("28 TRACKS with full FX complement\n");
            println!("DRUMS: KICK, CLAP, HAT, HAT 2, PERC, PERC 2, RIDE");
            println!("BASS:  BASS, SUB");
            println!("MELODICS: SYNTH 1-3, PAD 1-2, ARP");
            println!("FX: RISER 1-3, DOWNLIFTER, CRASH, IMPACT, HIT");
            println!("    SWEEP UP, SWEEP DOWN, NOISE, ATMOS 1-2, VOX\n");
            println!("Crashes every 16 bars, hits every 8 bars");
            println!("Risers/sweeps at all transitions");
            println!("\nElement entry/exit:");
            for arr in get_arrangement() {
                let sections: String = arr.sections.iter()
                    .map(|(s, e)| if s == e { format!("{}", s) } else { format!("{}-{}", s, e) })
                    .collect::<Vec<_>>()
                    .join(", ");
                println!("  {:<12} bars: {}", arr.name, sections);
            }
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

#[derive(Clone)]
struct SampleInfo {
    path: String,
    name: String,
    file_size: u64,
    duration_secs: f64,
    bpm: Option<f64>,
}

impl SampleInfo {
    fn from_db(path: &str, db_duration: f64, bpm: Option<f64>) -> Result<Self, String> {
        let metadata = std::fs::metadata(path).map_err(|e| format!("Cannot read {}: {}", path, e))?;
        let name = Path::new(path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("sample")
            .to_string();
        
        let duration_secs = read_wav_duration(path).unwrap_or(db_duration);
        
        Ok(Self {
            path: path.to_string(),
            name,
            file_size: metadata.len(),
            duration_secs,
            bpm,
        })
    }
    
    fn loop_bars(&self, project_bpm: f64) -> u32 {
        let bpm = self.bpm.unwrap_or(project_bpm);
        let duration = if self.duration_secs <= 0.0 || self.duration_secs > 300.0 {
            (4.0 * 60.0 * 4.0) / project_bpm
        } else {
            self.duration_secs
        };
        
        if bpm <= 0.0 {
            return 4;
        }
        let bars = (duration * bpm) / (60.0 * 4.0);
        if bars <= 0.75 { 1 }
        else if bars <= 1.5 { 1 }
        else if bars <= 3.0 { 2 }
        else if bars <= 6.0 { 4 }
        else if bars <= 12.0 { 8 }
        else { 16 }
    }
    
    fn xml_path(&self) -> String {
        self.path
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }
    
    fn xml_name(&self) -> String {
        self.name
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }
}

fn query_samples(
    include_patterns: &[&str],
    exclude_patterns: &[&str],
    require_loop: bool,
    count: usize,
) -> Vec<SampleInfo> {
    let conn = match Connection::open(DB_PATH) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Warning: Cannot open DB: {}", e);
            return vec![];
        }
    };
    
    let include_clause: String = include_patterns
        .iter()
        .flat_map(|p| vec![
            format!("al.path LIKE '%{}%'", p.to_lowercase()),
            format!("al.path LIKE '%{}%'", p),
        ])
        .collect::<Vec<_>>()
        .join(" OR ");
    
    let exclude_clause: String = exclude_patterns
        .iter()
        .map(|p| format!("AND al.path NOT LIKE '%{}%' AND al.path NOT LIKE '%{}%'", p.to_lowercase(), p))
        .collect::<Vec<_>>()
        .join(" ");
    
    let loop_clause = if require_loop { "AND al.path LIKE '%loop%'" } else { "" };
    
    let query = format!(
        "SELECT al.path, COALESCE(s.duration, 0), s.bpm 
         FROM audio_library al 
         JOIN audio_samples s ON al.sample_id = s.id 
         WHERE s.format = 'WAV' 
         AND ({})
         {}
         AND al.path LIKE '%MusicProduction/Samples%'
         AND al.path NOT LIKE '%Splice%'
         {}
         ORDER BY RANDOM() 
         LIMIT {}",
        include_clause, loop_clause, exclude_clause, count * 2
    );
    
    let mut stmt = match conn.prepare(&query) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Warning: Query error: {}", e);
            return vec![];
        }
    };
    
    stmt.query_map([], |row| {
        let path: String = row.get(0)?;
        let duration: f64 = row.get(1)?;
        let bpm: Option<f64> = row.get(2)?;
        Ok((path, duration, bpm))
    })
    .ok()
    .map(|rows| {
        rows.filter_map(|r| r.ok())
            .filter_map(|(path, duration, bpm)| {
                if !Path::new(&path).exists() {
                    return None;
                }
                SampleInfo::from_db(&path, duration, bpm).ok()
            })
            .take(count)
            .collect()
    })
    .unwrap_or_default()
}

// Section locators for arrangement navigation
fn get_locators() -> Vec<(&'static str, u32)> {
    vec![
        ("INTRO", INTRO_START),        // 1
        ("BUILD", BUILD1_START),       // 33
        ("BREAKDOWN", BREAKDOWN_START),// 65
        ("DROP 1", DROP1_START),       // 97
        ("DROP 2", DROP2_START),       // 129
        ("FADEDOWN", FADEDOWN_START),  // 161
        ("OUTRO", OUTRO_START),        // 193
    ]
}

fn create_locators_xml(ids: &IdAllocator) -> String {
    let locators: Vec<String> = get_locators()
        .iter()
        .map(|(name, bar)| {
            let id = ids.alloc();
            let time_beats = (*bar - 1) * 4; // bar 1 = beat 0
            format!(
                r#"<Locator Id="{}">
					<LomId Value="0" />
					<Time Value="{}" />
					<Name Value="{}" />
					<Annotation Value="" />
					<IsSongStart Value="false" />
				</Locator>"#,
                id, time_beats, name
            )
        })
        .collect();

    format!(
        "<Locators>\n\t\t\t{}\n\t\t</Locators>",
        locators.join("\n\t\t\t")
    )
}

fn generate_true_techno(output_path: &Path) -> Result<(), String> {
    let ids = IdAllocator::new(1000000);

    // Load 1 sample per track for consistency
    eprintln!("\n=== Loading samples (1 per track) ===");
    
    // DRUMS
    eprintln!("KICK:");
    let kick_samples = query_samples(&["kick"], &["no_kick", "no kick", "nokick", "without_kick", "without kick", "snare"], true, 1);
    eprintln!("CLAP:");
    let clap_samples = query_samples(&["clap", "snare"], &["kick"], true, 1);
    eprintln!("HAT:");
    let hat_samples = query_samples(&["hat", "hihat", "closed"], &["open", "ride"], true, 1);
    eprintln!("HAT 2:");
    let hat2_samples = query_samples(&["hat", "open", "hihat"], &["closed"], true, 1);
    eprintln!("PERC:");
    let perc_samples = query_samples(&["perc", "percussion", "shaker"], &["kick", "snare", "hat"], true, 1);
    eprintln!("PERC 2:");
    let perc2_samples = query_samples(&["perc", "conga", "bongo", "tom"], &["kick", "snare"], true, 1);
    eprintln!("RIDE:");
    let ride_samples = query_samples(&["ride", "cymbal"], &["crash", "hit"], true, 1);
    
    // BASS
    eprintln!("BASS:");
    let bass_samples = query_samples(&["bass", "bassline"], &["kick", "sub"], true, 1);
    eprintln!("SUB:");
    let sub_samples = query_samples(&["sub", "808", "low"], &["kick"], true, 1);
    
    // MELODICS - exclude disco/nudisco/funky stuff, keep it dark techno
    let exclude_melodics = &["pad", "bass", "drum", "disco", "nudisco", "nu_disco", "funky", "funk", "house", "edm", "pop", "tropical"];
    eprintln!("MAIN SYNTH:");
    let main_synth_samples = query_samples(&["lead", "techno", "dark", "acid", "industrial"], exclude_melodics, true, 1);
    eprintln!("SYNTH 1:");
    let synth1_samples = query_samples(&["synth", "acid", "sequence", "techno"], &["pad", "lead", "disco", "nudisco", "funky", "house"], true, 1);
    eprintln!("SYNTH 2:");
    let synth2_samples = query_samples(&["lead", "melody", "synth_lead", "dark"], &["pad", "disco", "nudisco", "funky", "house", "pop"], true, 1);
    eprintln!("SYNTH 3 (stabs):");
    let synth3_samples = query_samples(&["stab", "techno", "industrial", "hard"], &["pad", "disco", "nudisco", "funky", "house"], false, 1);
    eprintln!("PAD:");
    let pad_samples = query_samples(&["pad", "dark", "ambient", "drone"], &["drum", "stab", "disco", "nudisco", "funky", "bright"], true, 1);
    eprintln!("PAD 2:");
    let pad2_samples = query_samples(&["pad", "atmosphere", "drone", "dark"], &["drum", "kick", "stab", "disco", "nudisco", "funky"], true, 1);
    eprintln!("ARP:");
    let arp_samples = query_samples(&["arp", "arpegg", "sequence", "techno"], &["pad", "drum", "disco", "nudisco", "funky", "house"], true, 1);
    eprintln!("ARP 2:");
    let arp2_samples = query_samples(&["pluck", "stab", "arp", "dark"], &["pad", "drum", "chord", "disco", "nudisco", "funky", "house"], true, 1);
    
    // FX - RISERS
    eprintln!("RISER 1:");
    let riser1_samples = query_samples(&["riser", "uplifter"], &["down", "impact"], false, 1);
    eprintln!("RISER 2:");
    let riser2_samples = query_samples(&["build", "riser", "tension"], &["down", "impact"], false, 1);
    eprintln!("RISER 3 (short):");
    let riser3_samples = query_samples(&["whoosh", "sweep_up", "upsweep"], &["down"], false, 1);
    
    // FX - DOWNLIFTERS
    eprintln!("DOWNLIFTER:");
    let downlifter_samples = query_samples(&["downlifter", "downsweep", "down_sweep", "fall"], &["up", "riser"], false, 1);
    
    // FX - IMPACTS
    eprintln!("CRASH:");
    let crash_samples = query_samples(&["crash", "cymbal_crash"], &["loop", "ride"], false, 1);
    eprintln!("IMPACT:");
    let impact_samples = query_samples(&["impact", "boom", "thud"], &["loop", "riser"], false, 1);
    eprintln!("HIT:");
    let hit_samples = query_samples(&["hit", "fx_hit", "perc_shot"], &["loop", "riser", "crash"], false, 1);
    
    // FX - SWEEPS (multiple variations)
    eprintln!("SWEEP UP:");
    let sweep_up_samples = query_samples(&["sweep_up", "upsweep", "white_noise_up"], &["down"], false, 1);
    eprintln!("SWEEP DOWN:");
    let sweep_down_samples = query_samples(&["sweep_down", "downsweep", "white_noise_down"], &["up"], false, 1);
    eprintln!("SWEEP UP 2:");
    let sweep_up2_samples = query_samples(&["sweep", "riser", "build"], &["down", "impact"], false, 1);
    eprintln!("SWEEP DOWN 2:");
    let sweep_down2_samples = query_samples(&["fall", "drop", "down"], &["up", "sub"], false, 1);
    
    // FX - NOISE (multiple layers)
    eprintln!("NOISE:");
    let noise_samples = query_samples(&["noise", "white_noise", "hiss"], &["drum", "kick"], false, 1);
    eprintln!("NOISE 2:");
    let noise2_samples = query_samples(&["texture", "noise", "static"], &["drum", "kick", "bass"], false, 1);
    
    // FX - SNARE ROLLS (tension builders)
    eprintln!("SNARE ROLL:");
    let snare_roll_samples = query_samples(&["snare_roll", "snare_build", "snare_fill", "roll"], &["kick", "hat"], false, 1);
    
    // FX - DRUM FILLS (different lengths) - MUST be drum fills, not bass/synth
    eprintln!("FILL 1B (1 beat):");
    let fill_1b_samples = query_samples(
        &["drum_fill", "fill", "perc_hit", "tom_hit", "snare_hit", "drum_hit"],
        &["bass", "synth", "pad", "lead", "melody", "loop", "full", "8bar", "4bar", "chord"],
        false, 1
    );
    eprintln!("FILL 2B (2 beats):");
    let fill_2b_samples = query_samples(
        &["drum_fill", "fill", "snare_roll", "tom_roll", "drum_roll"],
        &["bass", "synth", "pad", "lead", "melody", "loop", "full", "8bar"],
        false, 1
    );
    eprintln!("FILL 4B (1 bar):");
    let fill_4b_samples = query_samples(
        &["drum_fill", "fill", "break", "drum_break", "tom_fill"],
        &["bass", "synth", "pad", "lead", "melody", "loop", "full", "8bar", "4bar", "chord", "breakdown"],
        false, 1
    );
    
    // FX - REVERSE (reverse crashes/cymbals for tension)
    eprintln!("REVERSE:");
    let reverse_samples = query_samples(&["reverse", "rev_crash", "rev_cymbal", "reversed"], &["loop"], false, 1);
    
    // FX - SUB DROP (impact on drop)
    eprintln!("SUB DROP:");
    let sub_drop_samples = query_samples(&["sub_drop", "808_hit", "sub_boom", "low_impact"], &["loop"], false, 1);
    
    // ATMOSPHERE
    eprintln!("ATMOS:");
    let atmos_samples = query_samples(&["atmos", "atmosphere", "ambient"], &["drum", "kick"], false, 1);
    eprintln!("ATMOS 2:");
    let atmos2_samples = query_samples(&["texture", "drone", "soundscape"], &["drum", "kick"], false, 1);
    eprintln!("VOX:");
    let vox_samples = query_samples(&["vox", "vocal", "voice"], &["drum"], false, 1);

    // Generate base ALS
    generate_empty_als(output_path)?;

    let file = File::open(output_path).map_err(|e| e.to_string())?;
    let mut decoder = GzDecoder::new(file);
    let mut xml = String::new();
    decoder.read_to_string(&mut xml).map_err(|e| e.to_string())?;

    // Reserve template IDs
    let id_re = Regex::new(r#"Id="(\d+)""#).unwrap();
    for cap in id_re.captures_iter(&xml) {
        if let Ok(id) = cap[1].parse::<u32>() {
            ids.reserve(id);
        }
    }

    // Extract audio track template
    let track_start = xml.find("<AudioTrack").ok_or("No AudioTrack found")?;
    let track_end = xml.find("</AudioTrack>").ok_or("No AudioTrack end found")? + "</AudioTrack>".len();
    let original_audio_track = xml[track_start..track_end].to_string();

    // Allocate group IDs
    let drums_group_id = ids.alloc();
    let melodics_group_id = ids.alloc();
    let fx_group_id = ids.alloc();

    // Create groups
    let drums_group = create_group_track("DRUMS", DRUMS_COLOR, drums_group_id, &ids)?;
    let melodics_group = create_group_track("MELODICS", MELODICS_COLOR, melodics_group_id, &ids)?;
    let fx_group = create_group_track("FX", FX_COLOR, fx_group_id, &ids)?;

    // Get arrangement structure
    let arrangements = get_arrangement();
    
    // Helper to find arrangement for a track
    let find_arr = |name: &str| -> Vec<(f64, f64)> {
        arrangements.iter()
            .find(|a| a.name == name)
            .map(|a| a.sections.clone())
            .unwrap_or_default()
    };

    // Create all tracks with TRUE arrangement
    // DRUMS
    let kick_track = create_arranged_track(&original_audio_track, "KICK", DRUMS_COLOR, drums_group_id as i32, &kick_samples, &find_arr("KICK"), &ids)?;
    let clap_track = create_arranged_track(&original_audio_track, "CLAP", DRUMS_COLOR, drums_group_id as i32, &clap_samples, &find_arr("CLAP"), &ids)?;
    let hat_track = create_arranged_track(&original_audio_track, "HAT", DRUMS_COLOR, drums_group_id as i32, &hat_samples, &find_arr("HAT"), &ids)?;
    let hat2_track = create_arranged_track(&original_audio_track, "HAT 2", DRUMS_COLOR, drums_group_id as i32, &hat2_samples, &find_arr("HAT 2"), &ids)?;
    let perc_track = create_arranged_track(&original_audio_track, "PERC", DRUMS_COLOR, drums_group_id as i32, &perc_samples, &find_arr("PERC"), &ids)?;
    let perc2_track = create_arranged_track(&original_audio_track, "PERC 2", DRUMS_COLOR, drums_group_id as i32, &perc2_samples, &find_arr("PERC 2"), &ids)?;
    let ride_track = create_arranged_track(&original_audio_track, "RIDE", DRUMS_COLOR, drums_group_id as i32, &ride_samples, &find_arr("RIDE"), &ids)?;
    
    // BASS
    let bass_track = create_arranged_track(&original_audio_track, "BASS", BASS_COLOR, -1, &bass_samples, &find_arr("BASS"), &ids)?;
    let sub_track = create_arranged_track(&original_audio_track, "SUB", BASS_COLOR, -1, &sub_samples, &find_arr("SUB"), &ids)?;
    
    // MELODICS
    let main_synth_track = create_arranged_track(&original_audio_track, "MAIN SYNTH", MELODICS_COLOR, melodics_group_id as i32, &main_synth_samples, &find_arr("MAIN SYNTH"), &ids)?;
    let synth1_track = create_arranged_track(&original_audio_track, "SYNTH 1", MELODICS_COLOR, melodics_group_id as i32, &synth1_samples, &find_arr("SYNTH 1"), &ids)?;
    let synth2_track = create_arranged_track(&original_audio_track, "SYNTH 2", MELODICS_COLOR, melodics_group_id as i32, &synth2_samples, &find_arr("SYNTH 2"), &ids)?;
    let synth3_track = create_arranged_track(&original_audio_track, "SYNTH 3", MELODICS_COLOR, melodics_group_id as i32, &synth3_samples, &find_arr("SYNTH 3"), &ids)?;
    let pad_track = create_arranged_track(&original_audio_track, "PAD", MELODICS_COLOR, melodics_group_id as i32, &pad_samples, &find_arr("PAD"), &ids)?;
    let pad2_track = create_arranged_track(&original_audio_track, "PAD 2", MELODICS_COLOR, melodics_group_id as i32, &pad2_samples, &find_arr("PAD 2"), &ids)?;
    let arp_track = create_arranged_track(&original_audio_track, "ARP", MELODICS_COLOR, melodics_group_id as i32, &arp_samples, &find_arr("ARP"), &ids)?;
    let arp2_track = create_arranged_track(&original_audio_track, "ARP 2", MELODICS_COLOR, melodics_group_id as i32, &arp2_samples, &find_arr("ARP 2"), &ids)?;
    
    // FX
    let riser1_track = create_arranged_track(&original_audio_track, "RISER 1", FX_COLOR, fx_group_id as i32, &riser1_samples, &find_arr("RISER 1"), &ids)?;
    let riser2_track = create_arranged_track(&original_audio_track, "RISER 2", FX_COLOR, fx_group_id as i32, &riser2_samples, &find_arr("RISER 2"), &ids)?;
    let riser3_track = create_arranged_track(&original_audio_track, "RISER 3", FX_COLOR, fx_group_id as i32, &riser3_samples, &find_arr("RISER 3"), &ids)?;
    let downlifter_track = create_arranged_track(&original_audio_track, "DOWNLIFTER", FX_COLOR, fx_group_id as i32, &downlifter_samples, &find_arr("DOWNLIFTER"), &ids)?;
    let crash_track = create_arranged_track(&original_audio_track, "CRASH", FX_COLOR, fx_group_id as i32, &crash_samples, &find_arr("CRASH"), &ids)?;
    let impact_track = create_arranged_track(&original_audio_track, "IMPACT", FX_COLOR, fx_group_id as i32, &impact_samples, &find_arr("IMPACT"), &ids)?;
    let hit_track = create_arranged_track(&original_audio_track, "HIT", FX_COLOR, fx_group_id as i32, &hit_samples, &find_arr("HIT"), &ids)?;
    let sweep_up_track = create_arranged_track(&original_audio_track, "SWEEP UP", FX_COLOR, fx_group_id as i32, &sweep_up_samples, &find_arr("SWEEP UP"), &ids)?;
    let sweep_down_track = create_arranged_track(&original_audio_track, "SWEEP DOWN", FX_COLOR, fx_group_id as i32, &sweep_down_samples, &find_arr("SWEEP DOWN"), &ids)?;
    let sweep_up2_track = create_arranged_track(&original_audio_track, "SWEEP UP 2", FX_COLOR, fx_group_id as i32, &sweep_up2_samples, &find_arr("SWEEP UP 2"), &ids)?;
    let sweep_down2_track = create_arranged_track(&original_audio_track, "SWEEP DOWN 2", FX_COLOR, fx_group_id as i32, &sweep_down2_samples, &find_arr("SWEEP DOWN 2"), &ids)?;
    let noise_track = create_arranged_track(&original_audio_track, "NOISE", FX_COLOR, fx_group_id as i32, &noise_samples, &find_arr("NOISE"), &ids)?;
    let noise2_track = create_arranged_track(&original_audio_track, "NOISE 2", FX_COLOR, fx_group_id as i32, &noise2_samples, &find_arr("NOISE 2"), &ids)?;
    let snare_roll_track = create_arranged_track(&original_audio_track, "SNARE ROLL", FX_COLOR, fx_group_id as i32, &snare_roll_samples, &find_arr("SNARE ROLL"), &ids)?;
    let fill_1b_track = create_arranged_track(&original_audio_track, "FILL 1B", DRUMS_COLOR, drums_group_id as i32, &fill_1b_samples, &find_arr("FILL 1B"), &ids)?;
    let fill_2b_track = create_arranged_track(&original_audio_track, "FILL 2B", DRUMS_COLOR, drums_group_id as i32, &fill_2b_samples, &find_arr("FILL 2B"), &ids)?;
    let fill_4b_track = create_arranged_track(&original_audio_track, "FILL 4B", DRUMS_COLOR, drums_group_id as i32, &fill_4b_samples, &find_arr("FILL 4B"), &ids)?;
    let reverse_track = create_arranged_track(&original_audio_track, "REVERSE", FX_COLOR, fx_group_id as i32, &reverse_samples, &find_arr("REVERSE"), &ids)?;
    let sub_drop_track = create_arranged_track(&original_audio_track, "SUB DROP", FX_COLOR, fx_group_id as i32, &sub_drop_samples, &find_arr("SUB DROP"), &ids)?;
    let atmos_track = create_arranged_track(&original_audio_track, "ATMOS", FX_COLOR, fx_group_id as i32, &atmos_samples, &find_arr("ATMOS"), &ids)?;
    let atmos2_track = create_arranged_track(&original_audio_track, "ATMOS 2", FX_COLOR, fx_group_id as i32, &atmos2_samples, &find_arr("ATMOS 2"), &ids)?;
    let vox_track = create_arranged_track(&original_audio_track, "VOX", FX_COLOR, fx_group_id as i32, &vox_samples, &find_arr("VOX"), &ids)?;

    // Build final XML - all tracks
    let before_track = &xml[..track_start];
    let after_track = &xml[track_end..];
    
    let all_tracks = vec![
        // DRUMS group
        &drums_group, &kick_track, &clap_track, &hat_track, &hat2_track, 
        &perc_track, &perc2_track, &ride_track, 
        &fill_1b_track, &fill_2b_track, &fill_4b_track,
        // BASS (no group)
        &bass_track, &sub_track,
        // MELODICS group
        &melodics_group, &main_synth_track, &synth1_track, &synth2_track, &synth3_track,
        &pad_track, &pad2_track, &arp_track, &arp2_track,
        // FX group
        &fx_group, &riser1_track, &riser2_track, &riser3_track,
        &downlifter_track, &crash_track, &impact_track, &hit_track,
        &sweep_up_track, &sweep_down_track, &sweep_up2_track, &sweep_down2_track,
        &noise_track, &noise2_track,
        &snare_roll_track, &reverse_track, &sub_drop_track,
        &atmos_track, &atmos2_track, &vox_track,
    ].into_iter().map(|s| s.as_str()).collect::<Vec<_>>().join("\n\t\t\t");
    
    let mut xml = format!("{}{}{}", before_track, all_tracks, after_track);

    // Update NextPointeeId
    let next_id = ids.max_id() + 1000;
    let next_id_re = Regex::new(r#"<NextPointeeId Value="\d+" />"#).unwrap();
    xml = next_id_re.replace(&xml, format!(r#"<NextPointeeId Value="{}" />"#, next_id)).to_string();

    // Hide mixer
    xml = xml.replace(
        r#"<MixerInArrangement Value="1" />"#,
        r#"<MixerInArrangement Value="0" />"#,
    );

    // Add locators at section boundaries
    let locators_xml = create_locators_xml(&ids);
    xml = xml.replace(
        "<Locators>\n\t\t\t<Locators />\n\t\t</Locators>",
        &format!("<Locators>\n\t\t\t{}\n\t\t</Locators>", locators_xml),
    );
    // Also try alternate format
    xml = xml.replace(
        "<Locators><Locators /></Locators>",
        &format!("<Locators>{}</Locators>", locators_xml),
    );

    // Set tempo to 128 BPM
    let tempo_re = Regex::new(r#"<Tempo>\s*<LomId Value="0" />\s*<Manual Value="[^"]+" />"#).unwrap();
    xml = tempo_re.replace(&xml, r#"<Tempo>
						<LomId Value="0" />
						<Manual Value="128" />"#).to_string();
    
    let tempo_event_re = Regex::new(r#"<FloatEvent Id="\d+" Time="-63072000" Value="[^"]+" />"#).unwrap();
    xml = tempo_event_re.replace(&xml, r#"<FloatEvent Id="0" Time="-63072000" Value="128" />"#).to_string();

    // Write output
    let output_file = File::create(output_path).map_err(|e| e.to_string())?;
    let mut encoder = GzEncoder::new(output_file, Compression::default());
    encoder.write_all(xml.as_bytes()).map_err(|e| e.to_string())?;
    encoder.finish().map_err(|e| e.to_string())?;

    eprintln!("\nMax ID used: {}", ids.max_id());
    Ok(())
}

fn create_audio_clip(sample: &SampleInfo, color: u32, clip_id: u32, start_bar: f64, end_bar: f64) -> String {
    let beats_per_bar = 4.0;
    // Both bars are 1-indexed, so subtract 1 before converting to beats
    // Bar 1 = beat 0, bar 16 = beat 60, bar 16.25 = beat 61
    let start_beat = (start_bar - 1.0) * beats_per_bar;
    let end_beat = (end_bar - 1.0) * beats_per_bar;
    
    // Clip length in beats
    let clip_length_beats = end_beat - start_beat;
    
    let loop_bars = sample.loop_bars(PROJECT_BPM);
    let sample_loop_beats = loop_bars as f64 * beats_per_bar;
    
    // Cap loop to clip length - don't let sample loop beyond the clip boundary
    let loop_beats = if clip_length_beats < sample_loop_beats {
        clip_length_beats
    } else {
        sample_loop_beats
    };
    
    // WarpMarker tells Ableton: "at SecTime seconds into the sample, we should be at BeatTime beats"
    // To sync correctly at PROJECT_BPM, we calculate: how many seconds = loop_beats at PROJECT_BPM
    // This forces Ableton to stretch/compress the sample to match our target tempo
    //
    // Formula: warp_sec = (loop_beats * 60) / PROJECT_BPM
    // At 128 BPM: 4 beats (1 bar) = 1.875 sec, 16 beats (4 bars) = 7.5 sec
    let warp_sec = (loop_beats * 60.0) / PROJECT_BPM;
    
    format!(r#"<AudioClip Id="{clip_id}" Time="{start_beat}">
										<LomId Value="0" />
										<LomIdView Value="0" />
										<CurrentStart Value="{start_beat}" />
										<CurrentEnd Value="{end_beat}" />
										<Loop>
											<LoopStart Value="0" />
											<LoopEnd Value="{loop_beats}" />
											<StartRelative Value="0" />
											<LoopOn Value="true" />
											<OutMarker Value="{loop_beats}" />
											<HiddenLoopStart Value="0" />
											<HiddenLoopEnd Value="{loop_beats}" />
										</Loop>
										<Name Value="{name}" />
										<Annotation Value="" />
										<Color Value="{color}" />
										<LaunchMode Value="0" />
										<LaunchQuantisation Value="0" />
										<TimeSignature>
											<TimeSignatures>
												<RemoteableTimeSignature Id="0">
													<Numerator Value="4" />
													<Denominator Value="4" />
													<Time Value="0" />
												</RemoteableTimeSignature>
											</TimeSignatures>
										</TimeSignature>
										<Envelopes>
											<Envelopes />
										</Envelopes>
										<ScrollerTimePreserver>
											<LeftTime Value="0" />
											<RightTime Value="{end_beat}" />
										</ScrollerTimePreserver>
										<TimeSelection>
											<AnchorTime Value="0" />
											<OtherTime Value="0" />
										</TimeSelection>
										<Legato Value="false" />
										<Ram Value="false" />
										<GrooveSettings>
											<GrooveId Value="-1" />
										</GrooveSettings>
										<Disabled Value="false" />
										<VelocityAmount Value="0" />
										<FollowAction>
											<FollowTime Value="4" />
											<IsLinked Value="true" />
											<LoopIterations Value="1" />
											<FollowActionA Value="4" />
											<FollowActionB Value="0" />
											<FollowChanceA Value="100" />
											<FollowChanceB Value="0" />
											<JumpIndexA Value="1" />
											<JumpIndexB Value="1" />
											<FollowActionEnabled Value="false" />
										</FollowAction>
										<Grid>
											<FixedNumerator Value="1" />
											<FixedDenominator Value="16" />
											<GridIntervalPixel Value="20" />
											<Ntoles Value="2" />
											<SnapToGrid Value="true" />
											<Fixed Value="false" />
										</Grid>
										<FreezeStart Value="0" />
										<FreezeEnd Value="0" />
										<IsWarped Value="true" />
										<TakeId Value="1" />
										<SampleRef>
											<FileRef>
												<RelativePathType Value="0" />
												<RelativePath Value="" />
												<Path Value="{path}" />
												<Type Value="2" />
												<LivePackName Value="" />
												<LivePackId Value="" />
												<OriginalFileSize Value="{file_size}" />
												<OriginalCrc Value="0" />
											</FileRef>
											<LastModDate Value="0" />
											<SourceContext>
												<SourceContext Id="0">
													<OriginalFileRef>
														<FileRef Id="0">
															<RelativePathType Value="0" />
															<RelativePath Value="" />
															<Path Value="{path}" />
															<Type Value="2" />
															<LivePackName Value="" />
															<LivePackId Value="" />
															<OriginalFileSize Value="{file_size}" />
															<OriginalCrc Value="0" />
														</FileRef>
													</OriginalFileRef>
													<BrowserContentPath Value="" />
													<LocalFiltersJson Value="" />
												</SourceContext>
											</SourceContext>
											<SampleUsageHint Value="0" />
											<DefaultDuration Value="{loop_beats}" />
											<DefaultSampleRate Value="44100" />
										</SampleRef>
										<Onsets>
											<UserOnsets />
											<HasUserOnsets Value="false" />
										</Onsets>
										<WarpMode Value="0" />
										<GranularityTones Value="30" />
										<GranularityTexture Value="65" />
										<FluctuationTexture Value="25" />
										<TransientResolution Value="6" />
										<TransientLoopMode Value="2" />
										<TransientEnvelope Value="100" />
										<ComplexProFormants Value="100" />
										<ComplexProEnvelope Value="128" />
										<Sync Value="true" />
										<HiQ Value="true" />
										<Fade Value="true" />
										<Fades>
											<FadeInLength Value="0" />
											<FadeOutLength Value="0" />
											<ClipFadesAreInitialized Value="true" />
											<CrossfadeLength Value="0" />
											<FadeInCurveSkew Value="0" />
											<FadeInCurveSlope Value="0" />
											<FadeOutCurveSkew Value="0" />
											<FadeOutCurveSlope Value="0" />
											<IsDefaultFadeIn Value="true" />
											<IsDefaultFadeOut Value="true" />
										</Fades>
										<PitchCoarse Value="0" />
										<PitchFine Value="0" />
										<SampleVolume Value="1" />
										<MarkerDensity Value="2" />
										<AutoWarpTolerance Value="4" />
										<WarpMarkers>
											<WarpMarker Id="0" SecTime="0" BeatTime="0" />
											<WarpMarker Id="1" SecTime="{warp_sec}" BeatTime="{loop_beats}" />
										</WarpMarkers>
										<SavedWarpMarkersForStretched />
										<MarkersGenerated Value="true" />
										<IsSongTempoLeader Value="false" />
									</AudioClip>"#,
        clip_id = clip_id,
        start_beat = start_beat,
        end_beat = end_beat,
        loop_beats = loop_beats,
        name = sample.xml_name(),
        color = color,
        path = sample.xml_path(),
        file_size = sample.file_size,
        warp_sec = warp_sec
    )
}

fn create_group_track(name: &str, color: u32, group_id: u32, ids: &IdAllocator) -> Result<String, String> {
    let mut track = GROUP_TRACK_TEMPLATE.to_string();

    let id_re = Regex::new(r#"Id="(\d+)""#).unwrap();
    let mut replacements: Vec<(String, String)> = Vec::new();
    
    for cap in id_re.captures_iter(&track) {
        let old = format!(r#"Id="{}""#, &cap[1]);
        let new_id = ids.alloc();
        let new = format!(r#"Id="{}""#, new_id);
        replacements.push((old, new));
    }
    
    for (old, new) in replacements {
        track = track.replacen(&old, &new, 1);
    }

    let track_id_re = Regex::new(r#"<GroupTrack Id="\d+""#).unwrap();
    track = track_id_re.replace(&track, format!(r#"<GroupTrack Id="{}""#, group_id)).to_string();

    track = track.replace(
        r#"<EffectiveName Value="Drums" />"#,
        &format!(r#"<EffectiveName Value="{}" />"#, name),
    );
    track = track.replace(
        r#"<UserName Value="Drums" />"#,
        &format!(r#"<UserName Value="{}" />"#, name),
    );

    let color_re = Regex::new(r#"<Color Value="\d+" />"#).unwrap();
    track = color_re.replace_all(&track, format!(r#"<Color Value="{}" />"#, color)).to_string();

    eprintln!("GroupTrack {}: ID={}", name, group_id);
    Ok(track)
}

fn create_arranged_track(
    template: &str,
    name: &str,
    color: u32,
    group_id: i32,
    samples: &[SampleInfo],
    sections: &[(f64, f64)],
    ids: &IdAllocator,
) -> Result<String, String> {
    let mut track = template.to_string();

    // Replace all IDs
    let id_re = Regex::new(r#"Id="(\d+)""#).unwrap();
    let mut replacements: Vec<(String, String)> = Vec::new();
    
    for cap in id_re.captures_iter(&track) {
        let old = format!(r#"Id="{}""#, &cap[1]);
        let new_id = ids.alloc();
        let new = format!(r#"Id="{}""#, new_id);
        replacements.push((old, new));
    }
    
    for (old, new) in replacements {
        track = track.replacen(&old, &new, 1);
    }

    // Set name
    let name_re = Regex::new(r#"<EffectiveName Value="[^"]*" />"#).unwrap();
    track = name_re.replace(&track, format!(r#"<EffectiveName Value="{}" />"#, name)).to_string();
    
    let username_re = Regex::new(r#"(<EffectiveName Value="[^"]*" />\s*<UserName Value=")[^"]*(" />)"#).unwrap();
    track = username_re.replace(&track, format!(r#"${{1}}{}${{2}}"#, name)).to_string();

    // Set color
    let color_re = Regex::new(r#"<Color Value="\d+" />"#).unwrap();
    track = color_re.replace_all(&track, format!(r#"<Color Value="{}" />"#, color)).to_string();

    // Set group
    track = track.replacen(
        r#"<TrackGroupId Value="-1" />"#,
        &format!(r#"<TrackGroupId Value="{}" />"#, group_id),
        1,
    );

    // Route to group if in a group
    if group_id != -1 {
        track = track.replacen(
            r#"<Target Value="AudioOut/Main" />"#,
            r#"<Target Value="AudioOut/GroupTrack" />"#,
            1,
        );
        track = track.replacen(
            r#"<UpperDisplayString Value="Master" />"#,
            r#"<UpperDisplayString Value="Group" />"#,
            1,
        );
    }

    // Set volume to -12dB (except KICK which is 0dB)
    let volume_re = Regex::new(r#"(<Volume>\s*<LomId Value="0" />\s*<Manual Value=")[^"]+(" />)"#).unwrap();
    let volume_value = if name == "KICK" { "1" } else { "0.251188643" };
    track = volume_re.replace(&track, format!(r#"${{1}}{}${{2}}"#, volume_value)).to_string();

    // Create clips for each section using the SAME sample (no switching)
    let mut clips: Vec<String> = Vec::new();
    
    if !samples.is_empty() {
        // Use only the first sample for consistency across the arrangement
        let sample = &samples[0];
        for &(start_bar, end_bar) in sections.iter() {
            let clip_id = ids.alloc();
            clips.push(create_audio_clip(sample, color, clip_id, start_bar, end_bar));
        }
    }
    
    let clips_xml = clips.join("\n");
    track = track.replacen(
        "<Events />",
        &format!("<Events>\n{}\n\t\t\t\t\t\t\t\t\t\t\t\t\t</Events>", clips_xml),
        1,
    );

    let section_str: String = sections.iter()
        .map(|&(s, e)| {
            if s == e {
                if s.fract() == 0.0 { format!("{}", s as u32) } else { format!("{:.2}", s) }
            } else if s.fract() == 0.0 && e.fract() == 0.0 {
                format!("{}-{}", s as u32, e as u32)
            } else {
                format!("{:.2}-{:.2}", s, e)
            }
        })
        .collect::<Vec<_>>()
        .join(", ");
    eprintln!("Track {}: {} clips at bars [{}]", name, clips.len(), section_str);
    Ok(track)
}
