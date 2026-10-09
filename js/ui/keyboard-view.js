// js/ui/keyboard-view.js
// Handles virtual on-screen keyboard, touch events, and physical keyboard bindings

export class KeyboardView {
    constructor({ container, onKeyPress, onHintClick }) {
        this.container = container;
        this.onKeyPress = onKeyPress;
        this.onHintClick = onHintClick;
        this.keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.keyElements = new Map();
        this.hintElement = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';

        for (const ch of this.keys) {
            const span = document.createElement('span');
            span.className = `key key__${ch}`;
            span.innerText = ch;
            span.dataset.key = ch;
            span.setAttribute('data', '');

            span.addEventListener('click', () => {
                if (!span.getAttribute('data')) {
                    this.onKeyPress(ch);
                }
            });

            this.container.appendChild(span);
            this.keyElements.set(ch, span);
        }

        // Hint button 'i'
        const hint = document.createElement('span');
        hint.className = 'key hint unsee';
        hint.innerText = 'i';
        hint.addEventListener('click', () => {
            if (this.onHintClick) this.onHintClick();
        });
        this.container.appendChild(hint);
        this.hintElement = hint;

        // Physical keyboard event listener
        this.boundKeyHandler = (e) => {
            if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            const key = e.key.toUpperCase();
            if (this.keys.includes(key)) {
                const el = this.keyElements.get(key);
                if (el && !el.getAttribute('data')) {
                    this.onKeyPress(key);
                }
            }
        };
        window.addEventListener('keydown', this.boundKeyHandler);
    }

    reset() {
        for (const [ch, el] of this.keyElements.entries()) {
            el.setAttribute('data', '');
            el.classList.remove('key-correct', 'key-wrong');
        }
        if (this.hintElement) {
            this.hintElement.className = 'key hint unsee';
        }
    }

    markKey(letter, isCorrect) {
        const el = this.keyElements.get(letter.toUpperCase());
        if (el) {
            el.setAttribute('data', isCorrect ? 'true' : 'false');
            el.classList.add(isCorrect ? 'key-correct' : 'key-wrong');
        }
    }

    setHintVisible(visible) {
        if (this.hintElement) {
            this.hintElement.className = visible ? 'key hint' : 'key hint unsee';
        }
    }

    destroy() {
        if (this.boundKeyHandler) {
            window.removeEventListener('keydown', this.boundKeyHandler);
        }
    }
}
