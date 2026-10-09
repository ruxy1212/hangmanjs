// js/multi/matchmaking.js
// Matchmaking coordinator: supports Room Code duels, random matchmaking, and fallback to "Computer" bot

import { BotPlayer } from './bot-player.js';
import { PeerSync } from './peer-sync.js';

export class MatchmakingManager {
    constructor({ onMatchFound, onStatusUpdate }) {
        this.onMatchFound = onMatchFound;
        this.onStatusUpdate = onStatusUpdate;
        this.timeoutTimer = null;
        this.isSearching = false;
        this.bot = null;
        this.peerSync = null;
    }

    startMatchmaking({ username = 'Player', mode = 'slingshot', difficulty = 0, roomCode = null, customWord = null } = {}) {
        this.cancel();
        this.isSearching = true;

        if (roomCode) {
            // Join specific room
            this.connectDirectPeer(roomCode, false, difficulty, customWord);
            return;
        }

        if (this.onStatusUpdate) {
            this.onStatusUpdate("Searching for online challenger...");
        }

        // Try local peer broadcast room discovery
        const discoveryRoom = 'global_lobby';
        this.peerSync = new PeerSync({
            onOpponentConnected: () => {
                this.onPeerMatched("Online Challenger");
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
        this.peerSync.createRoom(discoveryRoom);

        // 11s fallback countdown to "Computer"
        this.timeoutTimer = setTimeout(() => {
            if (!this.isSearching) return;
            if (this.onStatusUpdate) {
                this.onStatusUpdate("Challenger found: Computer (Rating: 1250)");
            }

            // Cleanup peer search
            if (this.peerSync) {
                this.peerSync.disconnect();
                this.peerSync = null;
            }

            // Spawn Computer Bot opponent
            this.bot = new BotPlayer({
                difficulty,
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

            this.isSearching = false;
            if (this.onMatchFound) {
                this.onMatchFound({
                    isBot: true,
                    opponentName: "Computer",
                    botInstance: this.bot,
                    sendToOpponent: (msg) => {}
                });
            }
        }, 11000);
    }

    connectDirectPeer(roomCode, isHost, difficulty, customWord) {
        if (this.onStatusUpdate) {
            this.onStatusUpdate(`Connecting to room ${roomCode}...`);
        }

        this.peerSync = new PeerSync({
            onOpponentConnected: () => {
                this.onPeerMatched("P2P Challenger");
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

        if (isHost) {
            this.peerSync.createRoom(roomCode);
        } else {
            this.peerSync.joinRoom(roomCode);
        }
    }

    onPeerMatched(opponentName) {
        if (!this.isSearching) return;
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
        this.isSearching = false;

        if (this.onMatchFound) {
            this.onMatchFound({
                isBot: false,
                opponentName,
                peerSyncInstance: this.peerSync,
                sendToOpponent: (msg) => {
                    if (this.peerSync) this.peerSync.sendMessage(msg);
                }
            });
        }
    }

    handlePeerMessage(msg) {
        if (!msg) return;
        if (msg.action === 'guess' && this.currentOpponentHandlers?.onGuess) {
            this.currentOpponentHandlers.onGuess(msg.data);
        } else if (msg.action === 'solve' && this.currentOpponentHandlers?.onSolve) {
            this.currentOpponentHandlers.onSolve();
        } else if (msg.action === 'hang' && this.currentOpponentHandlers?.onHang) {
            this.currentOpponentHandlers.onHang();
        }
    }

    registerOpponentHandlers(handlers) {
        this.currentOpponentHandlers = handlers;
    }

    cancel() {
        this.isSearching = false;
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
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
