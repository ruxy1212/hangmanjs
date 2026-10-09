// js/multi/bot-player.js
// Realistic Computer Bot for fallback multiplayer matchmaking

export class BotPlayer {
    constructor({ difficulty = 0, onGuess, onSolve, onHang }) {
        this.difficulty = difficulty;
        this.onGuess = onGuess;
        this.onSolve = onSolve;
        this.onHang = onHang;
        this.name = "Computer";
        this.timer = null;
        this.isRunning = false;

        // Common letter frequency order in English
        this.letterFrequency = ["E", "T", "A", "O", "I", "N", "S", "H", "R", "D", "L", "C", "U", "M", "W", "F", "G", "Y", "P", "B", "V", "K", "J", "X", "Q", "Z"];
        this.guessedKeys = new Set();
        this.failCount = 0;
        this.maxFails = 10;
        this.wordLetters = new Set();
        this.solvedLetters = new Set();
    }

    startRound(word) {
        this.stop();
        this.isRunning = true;
        this.guessedKeys.clear();
        this.solvedLetters.clear();
        this.failCount = 0;
        this.wordLetters = new Set(word.toUpperCase().replace(/[^A-Z]/g, '').split(''));

        this.scheduleNextGuess();
    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    scheduleNextGuess() {
        if (!this.isRunning) return;

        // Human-like thinking time: 2.2 to 5.2 seconds
        const delay = 2200 + Math.random() * 3000;
        this.timer = setTimeout(() => {
            this.makeGuess();
        }, delay);
    }

    makeGuess() {
        if (!this.isRunning) return;

        // Decide whether to pick a correct letter or a mistake based on difficulty
        // Magician: 35% miss chance, Immortal: 10% miss chance
        const missChances = [0.35, 0.25, 0.18, 0.10];
        const missRate = missChances[this.difficulty] || 0.25;

        const remainingCorrect = Array.from(this.wordLetters).filter(l => !this.guessedKeys.has(l));
        const unguessed = this.letterFrequency.filter(l => !this.guessedKeys.has(l));

        let pick = null;
        if (remainingCorrect.length > 0 && Math.random() > missRate) {
            // Pick a correct letter
            pick = remainingCorrect[Math.floor(Math.random() * remainingCorrect.length)];
        } else {
            // Pick from common frequency pool
            pick = unguessed[0] || 'A';
        }

        this.guessedKeys.add(pick);
        const isCorrect = this.wordLetters.has(pick);

        if (isCorrect) {
            this.solvedLetters.add(pick);
            if (this.onGuess) {
                this.onGuess({ letter: pick, isCorrect: true, failCount: this.failCount, solvedCount: this.solvedLetters.size });
            }

            if (this.solvedLetters.size === this.wordLetters.size) {
                this.isRunning = false;
                if (this.onSolve) this.onSolve();
                return;
            }
        } else {
            this.failCount++;
            if (this.onGuess) {
                this.onGuess({ letter: pick, isCorrect: false, failCount: this.failCount, solvedCount: this.solvedLetters.size });
            }

            if (this.failCount >= this.maxFails) {
                this.isRunning = false;
                if (this.onHang) this.onHang();
                return;
            }
        }

        this.scheduleNextGuess();
    }
}
