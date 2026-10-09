// js/multi/tournament.js
// Mini-Cup Tournament Bracket System (4-Player Knockout Ladder)

import { BotPlayer } from './bot-player.js';

export class TournamentManager {
    constructor({ playerUsername = 'Player', difficulty = 1 }) {
        this.playerUsername = playerUsername;
        this.difficulty = difficulty;
        this.currentRound = 1; // 1 = Semifinals, 2 = Finals
        this.champion = null;

        // Default 4-player bracket seeds
        this.bracket = {
            semifinal1: {
                player1: this.playerUsername,
                player2: "Ghost_Rider",
                winner: null
            },
            semifinal2: {
                player1: "Shadow_Blade",
                player2: "Cipher_Master",
                winner: null
            },
            final: {
                player1: null,
                player2: null,
                winner: null
            }
        };
    }

    startTournament() {
        this.currentRound = 1;
        // Simulate opponent match in semifinal 2
        this.bracket.semifinal2.winner = Math.random() > 0.5 ? "Shadow_Blade" : "Cipher_Master";
        return this.bracket;
    }

    advancePlayer(wonMatch) {
        if (this.currentRound === 1) {
            if (wonMatch) {
                this.bracket.semifinal1.winner = this.playerUsername;
                this.bracket.final.player1 = this.playerUsername;
                this.bracket.final.player2 = this.bracket.semifinal2.winner;
                this.currentRound = 2;
                return { advanced: true, isFinal: true, opponent: this.bracket.final.player2 };
            } else {
                this.bracket.semifinal1.winner = this.bracket.semifinal1.player2;
                return { advanced: false, eliminated: true };
            }
        } else if (this.currentRound === 2) {
            if (wonMatch) {
                this.bracket.final.winner = this.playerUsername;
                this.champion = this.playerUsername;
                return { advanced: true, isChampion: true };
            } else {
                this.bracket.final.winner = this.bracket.final.player2;
                this.champion = this.bracket.final.player2;
                return { advanced: false, eliminated: true, isRunnerUp: true };
            }
        }
    }
}
