// js/multi/matchmaking.js
// Open Challenges Lobby & WebRTC Matchmaking Coordinator

import { BotPlayer } from './bot-player.js';
import { PeerSync } from './peer-sync.js';

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

        this.initDiscovery();
    }

    initDiscovery() {
        if (typeof BroadcastChannel === 'undefined') return;

        this.discoveryChannel = new BroadcastChannel('hng_lobby_discovery');
        this.discoveryChannel.onmessage = (event) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'announce_match' && data.room) {
                // Ignore our own hosted room in the open list
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

        // Periodically purge stale rooms older than 6 seconds
        this.staleCheckerTimer = setInterval(() => {
            const now = Date.now();
            let changed = false;
            for (const [id, room] of this.openRooms.entries()) {
                if (now - (room.lastSeen || 0) > 6000) {
                    this.openRooms.delete(id);
                    changed = true;
                }
            }
            if (changed) {
                this.notifyRoomsUpdated();
            }
        }, 2500);

        // Query immediately
        this.queryOpenMatches();
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
                room: this.hostedRoom
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
            createdAt: Date.now(),
            lastSeen: Date.now()
        };

        if (this.onStatusUpdate) {
            this.onStatusUpdate(`Room created: ${roomId}. Waiting for challenger...`);
        }

        // Setup WebRTC Host
        this.peerSync = new PeerSync({
            onOpponentConnected: () => {
                this.stopHeartbeat();
                // Take room off the public lobby board
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

        // Start heartbeat broadcasting
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
