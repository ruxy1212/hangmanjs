// js/engine/hangman-engine.js
// Core game state management for single player and multiplayer rounds

import { createWordCommitment, testGuessedLetter } from './security.js';
import { soundManager } from '../audio/sound-manager.js';

export const DIFFICULTY = {
    MAGICIAN: 0,
    VISERION: 1,
    INFERNO: 2,
    IMMORTAL: 3
};

export const DIFFICULTY_NAMES = ['Magician', 'Viserion', 'Inferno', 'Immortal'];
export const BASE_SCORES = [8, 20, 50, 120];

export class HangmanEngine {
    constructor() {
        this.commitment = null;
        this.guessedKeys = new Set();
        this.solvedLetters = new Set();
        this.revealedSlots = [];
        this.failCount = 0;
        this.maxFails = 10;
        this.isGameOver = false;
        this.isWon = false;
        this.mode = 'slingshot'; // 'slingshot' | 'arcadian'
        this.difficulty = DIFFICULTY.MAGICIAN;
        this.arcadeLevel = 1;
        this.maxArcadeLevel = 20;
        this.accumulatedScore = 0;
        this.timerSeconds = 16;
        this.timerInterval = null;
        this.onStateChange = null; // callback for UI
        this.onTimerTick = null;
        this.onGameOver = null;
        this.revealedAnswer = null;
    }

    /**
     * Initializes a new round given a word and its hints
     */
    async startRound({ word, hints = [], mode = 'slingshot', difficulty = DIFFICULTY.MAGICIAN, arcadeLevel = 1, accumulatedScore = 0 }) {
        this.stopTimer();
        this.mode = mode;
        this.difficulty = parseInt(difficulty, 10);
        this.arcadeLevel = arcadeLevel;
        this.accumulatedScore = accumulatedScore;
        this.failCount = 0;
        this.isGameOver = false;
        this.isWon = false;
        this.guessedKeys.clear();
        this.solvedLetters.clear();

        // Create secure cryptographic commitment
        this.commitment = await createWordCommitment(word, hints);
        this.revealedSlots = new Array(this.commitment.length).fill('');

        // Pre-fill spaces or hyphens
        for (const idx of this.commitment.spaceIndices) {
            this.revealedSlots[idx] = ' ';
        }

        if (this.difficulty === DIFFICULTY.IMMORTAL) {
            this.startTimer();
        }

        this.notifyState();
    }

    startTimer() {
        this.stopTimer();
        this.timerSeconds = 16;
        if (this.onTimerTick) this.onTimerTick(this.timerSeconds);

        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            if (this.onTimerTick) this.onTimerTick(this.timerSeconds);
            if (this.timerSeconds <= 0) {
                this.stopTimer();
                this.endRound(false, 'TIMEOUT');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Player letter guess action
     */
    async guessLetter(letter) {
        if (this.isGameOver || !this.commitment) return null;
        const upper = letter.toUpperCase();
        if (this.guessedKeys.has(upper)) return null;

        this.guessedKeys.add(upper);

        // In Immortal mode, every guess resets the 16s clock
        if (this.difficulty === DIFFICULTY.IMMORTAL && !this.isGameOver) {
            this.startTimer();
        }

        const evalResult = await testGuessedLetter(upper, this.commitment, this.solvedLetters);

        if (evalResult.isCorrect) {
            // Fill slots
            for (const pos of evalResult.positions) {
                this.revealedSlots[pos] = upper;
            }
            soundManager.playClick();

            // Check if entire word is solved
            if (evalResult.remainingDistinct === 0) {
                this.endRound(true, 'SOLVED');
            } else {
                this.notifyState({ lastGuess: upper, isCorrect: true });
            }
            return { isCorrect: true, positions: evalResult.positions, remaining: evalResult.remainingDistinct };
        } else {
            // Wrong guess
            this.failCount++;
            soundManager.playWarn();

            if (this.failCount >= this.maxFails) {
                this.endRound(false, 'HANGED');
            } else {
                this.notifyState({ lastGuess: upper, isCorrect: false });
            }
            return { isCorrect: false, failCount: this.failCount };
        }
    }

    getHint() {
        if (!this.commitment || !this.commitment.hints || this.commitment.hints.length === 0) {
            return "No hints available.";
        }
        const hints = this.commitment.hints;
        return hints[Math.floor(Math.random() * hints.length)];
    }

    isHintAvailable() {
        if (this.difficulty === DIFFICULTY.MAGICIAN && this.failCount >= 1) return true;
        if (this.difficulty === DIFFICULTY.VISERION && this.failCount >= 5) return true;
        return false;
    }

    endRound(won, reason) {
        this.stopTimer();
        this.isGameOver = true;
        this.isWon = won;
        this.revealedAnswer = this.commitment ? this.commitment._reveal() : '';

        let roundPoints = 0;
        let bonus = 0;

        if (won) {
            soundManager.playCheer();
            const base = BASE_SCORES[this.difficulty] || 8;
            if (this.mode === 'arcadian') {
                roundPoints = base * this.arcadeLevel;
            } else {
                roundPoints = base;
            }

            // Flawless bonus
            if (this.failCount === 0) {
                bonus += 20;
            }
        } else {
            soundManager.playDie();
            if (this.mode === 'arcadian') {
                // If arcade failed, divided penalty
                this.accumulatedScore = Math.floor(this.accumulatedScore / (this.arcadeLevel || 1));
            }
        }

        const summary = {
            won,
            reason,
            answer: this.revealedAnswer,
            failCount: this.failCount,
            roundPoints,
            bonus,
            totalRoundEarned: roundPoints + bonus,
            arcadeLevel: this.arcadeLevel
        };

        if (won) {
            this.accumulatedScore += summary.totalRoundEarned;
        }

        this.notifyState();
        if (this.onGameOver) {
            this.onGameOver(summary);
        }
    }

    getPercentage() {
        if (!this.revealedSlots || this.revealedSlots.length === 0) return 0;
        const totalLetters = this.revealedSlots.filter(s => s !== ' ').length;
        const solved = this.revealedSlots.filter(s => s !== '' && s !== ' ').length;
        return totalLetters > 0 ? Math.round((solved / totalLetters) * 100) : 0;
    }

    notifyState(extra = {}) {
        if (this.onStateChange) {
            this.onStateChange({
                revealedSlots: [...this.revealedSlots],
                guessedKeys: Array.from(this.guessedKeys),
                failCount: this.failCount,
                maxFails: this.maxFails,
                isGameOver: this.isGameOver,
                isWon: this.isWon,
                isHintAvailable: this.isHintAvailable(),
                percentage: this.getPercentage(),
                arcadeLevel: this.arcadeLevel,
                accumulatedScore: this.accumulatedScore,
                ...extra
            });
        }
    }
}
