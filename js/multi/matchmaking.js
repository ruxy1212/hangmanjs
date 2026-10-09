// js/multi/matchmaking.js
// Open Challenges Lobby & WebRTC Matchmaking Coordinator with Firebase RTDB cross-browser discovery

import { BotPlayer } from './bot-player.js';
import { PeerSync } from './peer-sync.js';
import { leaderboardManager } from '../engine/leaderboard.js';
import { ref, set, onValue, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export class MatchmakingManager {
    constructor({ onMatchFound, onStatusUpdate, onRoomsUpdated }) {
        this.onMatchFound = onMatchFound;
        this.onStatusUpdate = onStatusUpdate;
        this.onRoomsUpdated = onRoomsUpdated;

        this.openRooms = new Map();
        this.hostedRoom = null;
        this.heartbeatTimer = null;
        this.staleCheckerTimer = null;
        this.peerSync = null;
        this.bot = null;
        this.currentOpponentHandlers = null;
        this.firebaseUnsubRooms = null;

        this.initDiscovery();
    }

    get db() {
        return leaderboardManager.db;
    }

    initDiscovery() {
        // 1. Same-browser local discovery channel
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.discoveryChannel = new BroadcastChannel('hng_lobby_discovery');
                this.discoveryChannel.onmessage = (event) => {
                    const data = event.data;
                    if (!data) return;

                    if (data.type === 'announce_match' && data.room) {
                        if (this.hostedRoom && data.room.id === this.hostedRoom.id) return;
                        data.room.lastSeen = Date.now();
                        this.openRooms.set(data.room.id, data.room);
                        this.notifyRoomsUpdated();
                    } else if (data.type === 'query_matches') {
                        if (this.hostedRoom) {
                            this.broadcastAnnouncement();
                        }
                    } else if (data.type === 'cancel_match' && data.roomId) {
                        if (this.openRooms.has(data.roomId)) {
                            this.openRooms.delete(data.roomId);
                            this.notifyRoomsUpdated();
                        }
                    }
                };
            } catch (e) {
                console.warn("BroadcastChannel error:", e);
            }
        }

        // 2. Cross-browser global Firebase Realtime Database rooms listener
        this.initFirebaseRoomsListener();

        // 3. Purge stale local broadcast rooms older than 10 seconds
        this.staleCheckerTimer = setInterval(() => {
            const now = Date.now();
            let changed = false;
            for (const [id, room] of this.openRooms.entries()) {
                if (room.isLocal && now - (room.lastSeen || 0) > 10000) {
                    this.openRooms.delete(id);
                    changed = true;
                }
            }
            if (changed) {
                this.notifyRoomsUpdated();
            }
        }, 3000);

        this.queryOpenMatches();
    }

    initFirebaseRoomsListener() {
        if (!this.db) {
            // If Firebase not ready yet, retry in 500ms
            setTimeout(() => this.initFirebaseRoomsListener(), 500);
            return;
        }

        const roomsRef = ref(this.db, 'games/rooms');
        this.firebaseUnsubRooms = onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            // Preserve local rooms, but sync all cloud rooms
            const localRooms = new Map();
            for (const [id, r] of this.openRooms.entries()) {
                if (r.isLocal) localRooms.set(id, r);
            }
            this.openRooms.clear();

            // Re-add local rooms
            for (const [id, r] of localRooms.entries()) {
                this.openRooms.set(id, r);
            }

            if (data) {
                const now = Date.now();
                for (const roomId in data) {
                    const room = data[roomId];
                    if (!room) continue;

                    // Filter: must be waiting, not our own hosted room, and not expired (> 15 minutes)
                    const isOurRoom = this.hostedRoom && this.hostedRoom.id === roomId;
                    const isFresh = !room.createdAt || (now - room.createdAt < 900000);

                    if (room.status === 'waiting' && !isOurRoom && isFresh) {
                        this.openRooms.set(roomId, room);
                    }
                }
            }

            this.notifyRoomsUpdated();
        }, (error) => {
            console.warn("Firebase rooms listen error:", error);
        });
    }

    queryOpenMatches() {
        if (this.discoveryChannel) {
            this.discoveryChannel.postMessage({ type: 'query_matches' });
        }
    }

    notifyRoomsUpdated() {
        if (this.onRoomsUpdated) {
            this.onRoomsUpdated(Array.from(this.openRooms.values()));
        }
    }

    broadcastAnnouncement() {
        if (this.discoveryChannel && this.hostedRoom) {
            this.discoveryChannel.postMessage({
                type: 'announce_match',
                room: { ...this.hostedRoom, isLocal: true }
            });
        }
    }

    hostMatch({ username = 'Host', mode = 'slingshot', difficulty = 0, wordMode = 'builtin', customWord = null } = {}) {
        this.cancel();

        const roomId = 'duel_' + Math.random().toString(36).substring(2, 9);
        this.hostedRoom = {
            id: roomId,
            hostName: username,
            mode,
            difficulty: parseInt(difficulty, 10),
            wordMode,
            customWord,
            status: 'waiting',
            createdAt: Date.now(),
            lastSeen: Date.now()
        };

        if (this.onStatusUpdate) {
            this.onStatusUpdate(`Room created: ${roomId}. Waiting for challenger...`);
        }

        // 1. Publish to Firebase RTDB for cross-browser discovery
        if (this.db) {
            const roomRef = ref(this.db, `games/rooms/${roomId}`);
            set(roomRef, this.hostedRoom).catch(e => console.warn("Failed to set room in Firebase:", e));
            onDisconnect(roomRef).remove().catch(() => {});
        }

        // 2. Setup WebRTC PeerSync
        this.peerSync = new PeerSync({
            onOpponentConnected: () => {
                this.stopHeartbeat();

                // Remove room from open list
                if (this.db) {
                    remove(ref(this.db, `games/rooms/${roomId}`)).catch(() => {});
                }
                if (this.discoveryChannel) {
                    this.discoveryChannel.postMessage({ type: 'cancel_match', roomId });
                }

                if (this.onMatchFound) {
                    this.onMatchFound({
                        isBot: false,
                        isHost: true,
                        opponentName: "Guest Challenger",
                        room: this.hostedRoom,
                        peerSyncInstance: this.peerSync,
                        sendToOpponent: (msg) => {
                            if (this.peerSync) this.peerSync.sendMessage(msg);
                        }
                    });
                }
            },
            onOpponentMessage: (data) => {
                this.handlePeerMessage(data);
            },
            onOpponentDisconnected: () => {
                if (this.currentOpponentHandlers?.onOpponentDisconnected) {
                    this.currentOpponentHandlers.onOpponentDisconnected();
                }
            }
        });

        this.peerSync.createRoom(roomId);

        // 3. Local BroadcastChannel announcement heartbeat
        this.broadcastAnnouncement();
        this.heartbeatTimer = setInterval(() => {
            this.broadcastAnnouncement();
        }, 2000);

        return this.hostedRoom;
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    cancelHosting() {
        if (this.hostedRoom) {
            const roomId = this.hostedRoom.id;
            this.stopHeartbeat();

            // Remove from Firebase
            if (this.db) {
                remove(ref(this.db, `games/rooms/${roomId}`)).catch(() => {});
            }

            // Remove from local BroadcastChannel
            if (this.discoveryChannel) {
                this.discoveryChannel.postMessage({ type: 'cancel_match', roomId });
            }

            this.hostedRoom = null;
        }
        if (this.peerSync) {
            this.peerSync.disconnect();
            this.peerSync = null;
        }
    }

    joinMatch(room, guestUsername = 'Guest') {
        this.cancel();

        if (this.onStatusUpdate) {
            this.onStatusUpdate(`Connecting to ${room.hostName}'s match...`);
        }

        // Mark room as playing in Firebase so others won't click it
        if (this.db && room.id) {
            set(ref(this.db, `games/rooms/${room.id}/status`), 'playing').catch(() => {});
        }

        this.peerSync = new PeerSync({
            onOpponentConnected: () => {
                if (this.onMatchFound) {
                    this.onMatchFound({
                        isBot: false,
                        isHost: false,
                        opponentName: room.hostName || "Host",
                        room,
                        peerSyncInstance: this.peerSync,
                        sendToOpponent: (msg) => {
                            if (this.peerSync) this.peerSync.sendMessage(msg);
                        }
                    });
                }
            },
            onOpponentMessage: (data) => {
                this.handlePeerMessage(data);
            },
            onOpponentDisconnected: () => {
                if (this.currentOpponentHandlers?.onOpponentDisconnected) {
                    this.currentOpponentHandlers.onOpponentDisconnected();
                }
            }
        });

        this.peerSync.joinRoom(room.id);
    }

    playVsComputer({ mode = 'slingshot', difficulty = 0, wordMode = 'builtin', customWord = null } = {}) {
        this.cancel();

        this.bot = new BotPlayer({
            difficulty: parseInt(difficulty, 10),
            onGuess: (data) => {
                if (this.currentOpponentHandlers?.onGuess) {
                    this.currentOpponentHandlers.onGuess(data);
                }
            },
            onSolve: () => {
                if (this.currentOpponentHandlers?.onSolve) {
                    this.currentOpponentHandlers.onSolve();
                }
            },
            onHang: () => {
                if (this.currentOpponentHandlers?.onHang) {
                    this.currentOpponentHandlers.onHang();
                }
            }
        });

        const roomConfig = {
            mode,
            difficulty: parseInt(difficulty, 10),
            wordMode,
            customWord
        };

        if (this.onMatchFound) {
            this.onMatchFound({
                isBot: true,
                isHost: true,
                opponentName: "Computer",
                room: roomConfig,
                botInstance: this.bot,
                sendToOpponent: (msg) => {}
            });
        }
    }

    handlePeerMessage(msg) {
        if (!msg) return;

        if (msg.action === 'init_game' && this.currentOpponentHandlers?.onInitGame) {
            this.currentOpponentHandlers.onInitGame(msg);
        } else if (msg.action === 'guess' && this.currentOpponentHandlers?.onGuess) {
            this.currentOpponentHandlers.onGuess(msg.data);
        } else if (msg.action === 'solve' && this.currentOpponentHandlers?.onSolve) {
            this.currentOpponentHandlers.onSolve();
        } else if (msg.action === 'hang' && this.currentOpponentHandlers?.onHang) {
            this.currentOpponentHandlers.onHang();
        } else if (msg.action === 'next_level' && this.currentOpponentHandlers?.onNextLevel) {
            this.currentOpponentHandlers.onNextLevel(msg);
        }
    }

    registerOpponentHandlers(handlers) {
        this.currentOpponentHandlers = handlers;
    }

    cancel() {
        this.cancelHosting();
        if (this.bot) {
            this.bot.stop();
            this.bot = null;
        }
        if (this.peerSync) {
            this.peerSync.disconnect();
            this.peerSync = null;
        }
    }
}
