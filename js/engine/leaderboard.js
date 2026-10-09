// js/engine/leaderboard.js
// Firebase Realtime Database Global Leaderboard with Device ID and customizable nickname

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAT_eenN3lS26peDKTxWKa3H8qrl3DL5T4",
    authDomain: "multihangman-35515.firebaseapp.com",
    databaseURL: "https://multihangman-35515-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "multihangman-35515",
    storageBucket: "multihangman-35515.appspot.com",
    messagingSenderId: "1039000061263",
    appId: "1:1039000061263:web:2ab630cb2234e960f0b13a"
};

export class LeaderboardManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.deviceId = this.getOrCreateDeviceId();
        this.username = localStorage.getItem('hng_player_name') || 'Player_' + this.deviceId.substring(0, 4);
        this.initFirebase();
    }

    initFirebase() {
        try {
            this.app = initializeApp(firebaseConfig);
            this.db = getDatabase(this.app);
        } catch (e) {
            console.warn("Firebase initialization failed:", e);
        }
    }

    getOrCreateDeviceId() {
        let id = localStorage.getItem('hng_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
            localStorage.setItem('hng_device_id', id);
        }
        return id;
    }

    setUsername(newName) {
        if (!newName || !newName.trim()) return;
        this.username = newName.trim().substring(0, 20);
        localStorage.setItem('hng_player_name', this.username);
        // Sync username to leaderboard entry
        this.updateProfile();
    }

    getUsername() {
        return this.username;
    }

    async updateScore({ hscore = 0, tpoints = 0, pwords = 0, tgames = 0 } = {}) {
        if (!this.db) return;
        try {
            const playerRef = ref(this.db, `games/leaderboard/${this.deviceId}`);
            const snapshot = await get(playerRef);
            const prev = snapshot.val() || {};

            const updatedHscore = Math.max(prev.hscore || 0, hscore);
            const updatedTpoints = Math.max(prev.tpoints || 0, tpoints);
            const updatedPwords = Math.max(prev.pwords || 0, pwords);
            const updatedTgames = Math.max(prev.tgames || 0, tgames);

            await set(playerRef, {
                deviceId: this.deviceId,
                username: this.username,
                hscore: updatedHscore,
                tpoints: updatedTpoints,
                pwords: updatedPwords,
                tgames: updatedTgames,
                updatedAt: Date.now()
            });
        } catch (e) {
            console.warn("Failed to sync score to Firebase:", e);
        }
    }

    async updateProfile() {
        if (!this.db) return;
        try {
            const playerRef = ref(this.db, `games/leaderboard/${this.deviceId}/username`);
            await set(playerRef, this.username);
        } catch (e) {
            console.warn("Failed to update profile username:", e);
        }
    }

    async getTopScores(limit = 25) {
        if (!this.db) return [];
        try {
            const q = ref(this.db, 'games/leaderboard');
            const snapshot = await get(q);
            if (!snapshot.exists()) return [];

            const list = [];
            snapshot.forEach(child => {
                const val = child.val();
                if (val && typeof val === 'object') {
                    list.push(val);
                }
            });
            // Sort by highest score descending
            list.sort((a, b) => (b.hscore || 0) - (a.hscore || 0));
            return list.slice(0, limit);
        } catch (e) {
            console.warn("Failed to fetch leaderboard:", e);
            // Graceful fallback to local device record
            return [{
                deviceId: this.deviceId,
                username: this.username,
                hscore: JSON.parse(localStorage.getItem('hngset') || '{}').hscore || 0
            }];
        }
    }

}

export const leaderboardManager = new LeaderboardManager();
