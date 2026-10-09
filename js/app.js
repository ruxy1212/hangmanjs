// js/app.js
// Main application entry point: single SPA coordinator for Single Player, Multiplayer, and Leaderboard

import { HangmanEngine, DIFFICULTY_NAMES, BASE_SCORES } from './engine/hangman-engine.js';
import { wordProvider } from './words/word-provider.js';
import { soundManager } from './audio/sound-manager.js';
import { GallowsView } from './ui/gallows-view.js';
import { KeyboardView } from './ui/keyboard-view.js';
import { MatchmakingManager } from './multi/matchmaking.js';
import { leaderboardManager } from './engine/leaderboard.js';

class HangmanApp {
    constructor() {
        this.engine = new HangmanEngine();
        this.gallowsView = null;
        this.keyboardView = null;
        this.matchmaking = null;

        this.currentMode = 'single'; // 'single' | 'multi'
        this.currentSubMode = 'slingshot'; // 'slingshot' | 'arcadian'
        this.difficulty = 0;
        this.useArena = false;
        this.wordSource = 'builtin'; // 'builtin' | 'online' | 'custom'

        this.activeMultiSession = null;
        this.opponentFail = 0;
        this.opponentSolved = 0;

        this.stats = this.loadStats();
        this.arenaBackgrounds = [
            "255, 255, 255", "222, 222, 222", "231, 218, 218", "231, 225, 218", 
            "231, 231, 218", "224, 231, 218", "218, 231, 223", "218, 231, 230", 
            "218, 222, 231", "224, 218, 231", "231, 218, 230", "216, 180, 180", 
            "216, 199, 180", "215, 216, 180", "194, 216, 180", "180, 216, 193", 
            "180, 208, 216", "180, 186, 216", "192, 180, 216", "216, 180, 211"
        ];
    }

    async init() {
        await wordProvider.init();
        soundManager.init(this.stats.soundEnabled);

        // Preload image assets
        this.preloadAssets();

        // Initialize UI Views
        this.gallowsView = new GallowsView({
            playerContainer: document.querySelector('.phold'),
            opponentContainer: document.querySelector('.opponent-ghost-hold')
        });

        this.keyboardView = new KeyboardView({
            container: document.querySelector('.keyboard'),
            onKeyPress: (letter) => this.handleKeyPress(letter),
            onHintClick: () => this.handleHintClick()
        });

        // Setup Engine Callbacks
        this.engine.onStateChange = (state) => this.renderGameState(state);
        this.engine.onTimerTick = (seconds) => this.renderTimer(seconds);
        this.engine.onGameOver = (summary) => this.handleGameOver(summary);

        // Setup Matchmaking
        this.matchmaking = new MatchmakingManager({
            onMatchFound: (session) => this.onMultiplayerMatchFound(session),
            onStatusUpdate: (text) => this.updateMatchmakingStatus(text)
        });

        this.bindEvents();
        this.updateProfileDisplay();
        this.removePreloader();
    }

    preloadAssets() {
        const images = [
            "img/gallow-off.png", "img/gallow-on.png", "img/knell.png",
            "img/c1.png", "img/c2.png", "img/c3.png", "img/c4.png", "img/c5.png",
            "img/c6.png", "img/c7.png", "img/c8.png", "img/c9.png",
            "img/f1.png", "img/f2.png", "img/f3.png", "img/f4.png", "img/f5.png",
            "img/f6.png", "img/f7.png", "img/f8.png", "img/f9.png",
            "img/f10a.png", "img/f10b.png"
        ];
        for (let i = 1; i <= 20; i++) {
            images.push(`img/img${i}.png`);
        }
        for (const src of images) {
            const img = new Image();
            img.src = src;
        }
    }

    loadStats() {
        const saved = localStorage.getItem('hngset');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return {
            soundEnabled: false,
            arena: false,
            tpoints: 0,
            tgames: 0,
            nwords: 0,
            fwords: 0,
            hscore: 0,
            pwords: 0,
            multiWins: 0
        };
    }

    saveStats() {
        localStorage.setItem('hngset', JSON.stringify(this.stats));
        // Sync to cloud leaderboard
        leaderboardManager.updateScore({
            hscore: this.stats.hscore,
            tpoints: this.stats.tpoints,
            pwords: this.stats.pwords,
            tgames: this.stats.tgames
        });
    }

    removePreloader() {
        const preload = document.querySelector('.preload');
        const main = document.querySelector('.main');
        if (preload) {
            preload.style.pointerEvents = 'none';
            preload.style.opacity = '0';
        }
        if (main) {
            main.style.pointerEvents = 'none';
        }
        setTimeout(() => {
            if (preload) preload.style.display = 'none';
            if (main) main.style.display = 'none';
            if (typeof window.rstate !== 'undefined') window.rstate = false;
        }, 350);
    }


    bindEvents() {
        // Sound Switch
        const soundSwitches = document.querySelectorAll('.snd');
        soundSwitches.forEach(sw => {
            sw.checked = this.stats.soundEnabled;
            sw.addEventListener('change', (e) => {
                this.stats.soundEnabled = e.target.checked;
                soundManager.setMute(!e.target.checked);
                this.saveStats();
            });
        });

        // Close to Home
        const closeBtn = document.querySelector('.gclose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.confirmExitGame());
        }

        // Profile Name Editor
        const editNameBtn = document.querySelector('#btn-edit-username');
        if (editNameBtn) {
            editNameBtn.addEventListener('click', () => this.promptEditUsername());
        }

        // Leaderboard Open
        const openLbBtn = document.querySelector('#btn-open-leaderboard');
        if (openLbBtn) {
            openLbBtn.addEventListener('click', () => this.showLeaderboard());
        }

        // Single Player Start Button
        const startSingleBtn = document.querySelector('#btn-start-single');
        if (startSingleBtn) {
            startSingleBtn.addEventListener('click', () => {
                const isArcade = document.querySelector('#single-opt-arcadian')?.checked;
                const diff = document.querySelector('#single-difficulty-select')?.value || 0;
                const arena = document.querySelector('#single-arena-toggle')?.checked || false;
                this.startSingleGame({ mode: isArcade ? 'arcadian' : 'slingshot', difficulty: diff, arena });
            });
        }

        // Multiplayer Start Button
        const startMultiBtn = document.querySelector('#btn-start-multi');
        if (startMultiBtn) {
            startMultiBtn.addEventListener('click', () => {
                const isArcade = document.querySelector('#multi-opt-arcadian')?.checked;
                const isOnline = document.querySelector('#multi-src-online')?.checked;
                const isCustom = document.querySelector('#multi-src-custom')?.checked;
                const customVal = document.querySelector('#multi-custom-word-input')?.value.trim();
                const diff = document.querySelector('#multi-difficulty-select')?.value || 0;
                if (isCustom && !customVal) {
                    if (window.Swal) Swal.fire({ text: 'Please enter a custom word!', icon: 'warning' });
                    else alert('Please enter a custom word!');
                    return;
                }
                this.initiateMultiMatchmaking({
                    mode: isArcade ? 'arcadian' : 'slingshot',
                    wordMode: isCustom ? 'custom' : (isOnline ? 'online' : 'builtin'),
                    difficulty: diff,
                    customWord: isCustom ? customVal : null
                });
            });
        }
    }


    promptEditUsername() {
        const current = leaderboardManager.getUsername();
        const entered = prompt("Enter your player name:", current);
        if (entered && entered.trim()) {
            leaderboardManager.setUsername(entered.trim());
            this.updateProfileDisplay();
        }
    }

    updateProfileDisplay() {
        const nameEl = document.querySelector('.profile-name-tag');
        if (nameEl) {
            nameEl.innerText = leaderboardManager.getUsername();
        }
    }

    async showLeaderboard() {
        const modal = document.querySelector('.leaderboard-modal');
        const list = document.querySelector('.leaderboard-list');
        if (!modal || !list) return;

        list.innerHTML = '<li class="loading-tag">Loading global rankings...</li>';
        modal.classList.remove('unsee');

        const scores = await leaderboardManager.getTopScores(20);
        list.innerHTML = '';

        if (scores.length === 0) {
            list.innerHTML = '<li>No rankings recorded yet. Be the first!</li>';
            return;
        }

        const myDeviceId = leaderboardManager.deviceId;
        scores.forEach((entry, idx) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-entry' + (entry.deviceId === myDeviceId ? ' my-entry' : '');
            li.innerHTML = `
                <span class="lb-rank">#${idx + 1}</span>
                <span class="lb-name">${escapeHtml(entry.username || 'Anonymous')}</span>
                <span class="lb-score">${entry.hscore || 0} pts</span>
            `;
            list.appendChild(li);
        });
    }

    closeLeaderboard() {
        const modal = document.querySelector('.leaderboard-modal');
        if (modal) modal.classList.add('unsee');
    }

    // --- Single Player Game Flows ---
    async startSingleGame({ mode = 'slingshot', difficulty = 0, arena = false } = {}) {
        this.currentMode = 'single';
        this.currentSubMode = mode;
        this.difficulty = parseInt(difficulty, 10);
        this.useArena = arena;

        this.hideAllModals();
        this.keyboardView.reset();
        this.updateArenaBackground(1);

        const wordData = await wordProvider.getWord({
            mode: 'builtin',
            difficulty: this.difficulty
        });

        await this.engine.startRound({
            word: wordData.word,
            hints: wordData.hints,
            mode: this.currentSubMode,
            difficulty: this.difficulty,
            arcadeLevel: 1,
            accumulatedScore: 0
        });

        this.setInGameVisibility(true, false);
    }

    // --- Multiplayer Rush Game Flows ---
    startMultiplayerLobby() {
        this.currentMode = 'multi';
        this.showModal('.multi-modal');
        this.showMultiPage(1);
    }

    showMultiPage(pageNumber) {
        document.querySelectorAll('.multi-page').forEach((p, idx) => {
            p.classList.toggle('unsee', idx + 1 !== pageNumber);
        });
    }

    async initiateMultiMatchmaking({ mode = 'slingshot', difficulty = 0, wordMode = 'builtin', customWord = null } = {}) {
        this.currentSubMode = mode;
        this.difficulty = parseInt(difficulty, 10);
        this.wordSource = wordMode;
        this.pendingCustomWord = customWord;

        this.showMultiPage(3);
        this.updateMatchmakingStatus("Finding an opponent for Word Rush...");

        this.matchmaking.startMatchmaking({
            username: leaderboardManager.getUsername(),
            mode: this.currentSubMode,
            difficulty: this.difficulty,
            customWord
        });
    }

    updateMatchmakingStatus(statusText) {
        const statusEl = document.querySelector('.matchmaking-status-text');
        if (statusEl) statusEl.innerText = statusText;
    }

    async onMultiplayerMatchFound(session) {
        this.activeMultiSession = session;
        this.hideAllModals();
        this.keyboardView.reset();
        this.opponentFail = 0;
        this.opponentSolved = 0;

        // Visual ghost opponent container enabled
        this.setInGameVisibility(true, true);
        this.gallowsView.renderOpponentStage(0, false);

        // Fetch shared mystery word (or custom word with auto-fetched hints)
        const wordData = await wordProvider.getWord({
            mode: this.wordSource,
            difficulty: this.difficulty,
            customWord: this.pendingCustomWord
        });


        // Register opponent bot or peer listeners
        this.matchmaking.registerOpponentHandlers({
            onGuess: (data) => {
                this.opponentFail = data.failCount;
                this.opponentSolved = data.solvedCount;
                this.gallowsView.renderOpponentStage(this.opponentFail, data.isCorrect);
            },
            onSolve: () => {
                // Opponent finished first! Instant win for opponent, instant loss for player
                this.engine.endRound(false, 'OPPONENT_WON');
            },
            onHang: () => {
                // Opponent hanged! Player instantly wins this level
                this.engine.endRound(true, 'OPPONENT_HANGED');
            }
        });

        // Start player round
        await this.engine.startRound({
            word: wordData.word,
            hints: wordData.hints,
            mode: this.currentSubMode,
            difficulty: this.difficulty,
            arcadeLevel: 1,
            accumulatedScore: 0
        });

        // Start Bot if applicable
        if (session.isBot && session.botInstance) {
            session.botInstance.startRound(wordData.word);
        }
    }

    cancelMatchmaking() {
        if (this.matchmaking) {
            this.matchmaking.cancel();
        }
        this.showMultiPage(1);
    }

    // --- Key / Hint Inputs ---
    async handleKeyPress(letter) {
        const res = await this.engine.guessLetter(letter);
        if (!res) return;

        this.keyboardView.markKey(letter, res.isCorrect);

        // Visual update
        if (res.isCorrect) {
            this.gallowsView.renderPlayerStage(this.engine.failCount, true);
            this.comboCount = (this.comboCount || 0) + 1;
            if (this.comboCount >= 3) {
                this.showComboBadge(`${this.comboCount}x COMBO! 🔥`);
            }
        } else {
            this.gallowsView.renderPlayerStage(this.engine.failCount, false);
            this.comboCount = 0;
            this.triggerScreenShake();
        }

        // Broadcast guess to opponent if in multiplayer
        if (this.currentMode === 'multi' && this.activeMultiSession) {
            this.activeMultiSession.sendToOpponent({
                action: 'guess',
                data: {
                    letter,
                    isCorrect: res.isCorrect,
                    failCount: this.engine.failCount,
                    solvedCount: this.engine.solvedLetters.size
                }
            });
        }
    }

    triggerScreenShake() {
        document.body.classList.remove('shake');
        void document.body.offsetWidth; // reflow
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 400);
    }

    showComboBadge(text) {
        const badge = document.createElement('div');
        badge.className = 'combo-badge';
        badge.innerText = text;
        document.body.appendChild(badge);
        setTimeout(() => badge.remove(), 850);
    }

    spawnConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
        for (let i = 0; i < 45; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.8 + 's';
            piece.style.transform = `scale(${0.5 + Math.random() * 0.8})`;
            container.appendChild(piece);
        }
        setTimeout(() => container.remove(), 3000);
    }



    handleHintClick() {
        const hint = this.engine.getHint();
        if (window.Swal) {
            Swal.fire({
                title: 'Hint',
                text: hint,
                icon: 'info',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Hint: ${hint}`);
        }
    }

    renderGameState(state) {
        // Render mystery word slots
        const wordContainer = document.querySelector('.word');
        if (wordContainer) {
            wordContainer.innerHTML = '';
            for (const ch of state.revealedSlots) {
                const span = document.createElement('span');
                span.className = 'l' + (ch === ' ' ? ' ls' : '');
                span.innerHTML = ch === '' ? '&nbsp;' : ch;
                wordContainer.appendChild(span);
            }
        }

        // Percentage & Level indicator
        const percentEl = document.querySelector('.gpercent');
        if (percentEl) {
            const modeText = this.currentSubMode === 'arcadian' ? `Arcade ${state.arcadeLevel}` : 'Slingshot';
            percentEl.innerHTML = `<span>${modeText}</span> (<span>${state.percentage}</span>%)`;
        }

        // Hint availability
        this.keyboardView.setHintVisible(state.isHintAvailable);
    }

    renderTimer(seconds) {
        const timerEl = document.querySelector('.gtimer');
        if (!timerEl) return;

        if (this.difficulty === 3 && !this.engine.isGameOver) {
            timerEl.className = 'gtimer' + (seconds <= 5 ? ' ptimer' : '');
            timerEl.innerText = seconds.toString().padStart(2, '0');
        } else {
            timerEl.className = 'gtimer ptimer unsee';
        }
    }

    async handleGameOver(summary) {
        // Stop any running bot
        if (this.activeMultiSession?.botInstance) {
            this.activeMultiSession.botInstance.stop();
        }

        // Notify peer if in multiplayer
        if (this.currentMode === 'multi' && this.activeMultiSession) {
            if (summary.won) {
                this.activeMultiSession.sendToOpponent({ action: 'solve' });
            } else if (summary.reason === 'HANGED') {
                this.activeMultiSession.sendToOpponent({ action: 'hang' });
            }
        }

        // Update stats
        this.stats.tgames++;
        if (summary.won) {
            this.spawnConfetti();
            this.stats.nwords++;
            this.stats.tpoints += summary.totalRoundEarned;
            if (summary.failCount === 0) this.stats.pwords++;
            if (this.currentMode === 'multi') this.stats.multiWins++;
        } else {
            this.stats.fwords++;
        }

        this.stats.hscore = Math.max(this.stats.hscore, this.engine.accumulatedScore);
        this.saveStats();

        // If in Arcadian mode and won, or opponent failed, can advance automatically
        if (this.currentSubMode === 'arcadian' && summary.won && this.engine.arcadeLevel < 20) {
            await this.sleep(1200);
            this.advanceArcadeLevel();
            return;
        }

        // Show verdict modal
        this.showVerdict(summary);
    }

    async advanceArcadeLevel() {
        const nextLevel = this.engine.arcadeLevel + 1;
        this.keyboardView.reset();
        this.updateArenaBackground(nextLevel);

        const wordData = await wordProvider.getWord({
            mode: this.wordSource === 'online' ? 'online' : 'builtin',
            difficulty: this.difficulty
        });

        await this.engine.startRound({
            word: wordData.word,
            hints: wordData.hints,
            mode: 'arcadian',
            difficulty: this.difficulty,
            arcadeLevel: nextLevel,
            accumulatedScore: this.engine.accumulatedScore
        });

        if (this.activeMultiSession?.botInstance) {
            this.activeMultiSession.botInstance.startRound(wordData.word);
        }
    }

    showVerdict(summary) {
        const modal = document.querySelector('.verdict-modal');
        if (!modal) return;

        const titleEl = modal.querySelector('.v-title');
        const descEl = modal.querySelector('.v-desc');
        const pointsEl = modal.querySelector('.v-points');

        if (summary.won) {
            const perfectText = summary.failCount === 0 ? "Perfect! " : "";
            titleEl.innerText = `${perfectText}Way to Go!`;
            descEl.innerText = `You solved the word: "${summary.answer}"`;
            pointsEl.innerText = `+${summary.totalRoundEarned} Points`;
        } else {
            titleEl.innerText = "Game Over!";
            descEl.innerText = `The secret word was: "${summary.answer}"`;
            pointsEl.innerText = summary.reason === 'OPPONENT_WON' ? 'Opponent finished first!' : 'Better luck next time!';
        }

        // Update stats breakdown in modal
        modal.querySelector('.tp1').innerText = this.stats.tpoints;
        modal.querySelector('.tp2').innerText = this.stats.tgames;
        modal.querySelector('.tp3').innerText = this.stats.nwords;
        modal.querySelector('.tp4').innerText = this.stats.fwords;
        modal.querySelector('.tp5').innerText = this.stats.hscore;
        modal.querySelector('.tp6').innerText = this.stats.pwords;

        modal.classList.remove('unsee');
    }

    updateArenaBackground(stage) {
        const body = document.body;
        if (this.useArena) {
            const bgIndex = ((stage - 1) % 20) + 1;
            body.style.backgroundImage = `url(img/img${bgIndex}.png)`;
        } else {
            const col = this.arenaBackgrounds[((stage - 1) % 20)];
            body.style.backgroundImage = 'none';
            body.style.backgroundColor = `rgb(${col})`;
        }
    }

    setInGameVisibility(inGame, isMulti = false) {
        document.querySelector('.home').classList.toggle('unsee', inGame);
        document.querySelector('.word').classList.toggle('unsee', !inGame);
        document.querySelector('.penalty').classList.toggle('unsee', !inGame);
        document.querySelector('.keyarea').classList.toggle('unsee', !inGame);
        document.querySelector('.gpercent').classList.toggle('unsee', !inGame);
        document.querySelector('.gclose').classList.toggle('unsee', !inGame);

        const ghostContainer = document.querySelector('.opponent-ghost-hold');
        if (ghostContainer) {
            ghostContainer.classList.toggle('unsee', !(inGame && isMulti));
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal, .help, .verdict-modal, .leaderboard-modal').forEach(m => {
            m.classList.add('unsee');
        });
    }

    showModal(selector) {
        this.hideAllModals();
        const m = document.querySelector(selector);
        if (m) m.classList.remove('unsee');
    }

    confirmExitGame() {
        if (!window.Swal) {
            if (confirm("Forfeit current game?")) this.returnToHome();
            return;
        }
        Swal.fire({
            title: "Forfeit Game?",
            text: "Are you sure you want to return to the main menu?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Exit'
        }).then((result) => {
            if (result.isConfirmed) {
                this.returnToHome();
            }
        });
    }

    returnToHome() {
        this.engine.stopTimer();
        if (this.activeMultiSession?.botInstance) {
            this.activeMultiSession.botInstance.stop();
        }
        this.hideAllModals();
        this.setInGameVisibility(false, false);
        document.body.style.backgroundImage = 'url(img/img10.png)';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.app = new HangmanApp();
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        window.app.init();
    });
} else {
    window.app.init();
}

