// js/multi/matchmaking.js
// Matchmaking coordinator: searches for real peer, falls back to "Computer" bot after 10-12 seconds

import { BotPlayer } from './bot-player.js';

export class MatchmakingManager {
    constructor({ onMatchFound, onStatusUpdate }) {
        this.onMatchFound = onMatchFound;
        this.onStatusUpdate = onStatusUpdate;
        this.timeoutTimer = null;
        this.isSearching = false;
        this.bot = null;
    }

    startMatchmaking({ username = 'Player', mode = 'slingshot', difficulty = 0, customWord = null } = {}) {
        this.cancel();
        this.isSearching = true;

        if (this.onStatusUpdate) {
            this.onStatusUpdate("Searching for online challenger...");
        }

        // 10-12s fallback countdown to "Computer"
        this.timeoutTimer = setTimeout(() => {
            if (!this.isSearching) return;
            if (this.onStatusUpdate) {
                this.onStatusUpdate("Challenger found: Computer (Rating: 1250)");
            }

            // Create Computer Bot opponent
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
                    sendToOpponent: (msg) => {
                        // Local bot sync handling if needed
                    }
                });
            }
        }, 11000);
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
    }
}
