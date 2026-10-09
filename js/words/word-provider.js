// js/words/word-provider.js
// Provides words from built-in curated dictionary, Datamuse API, and DictionaryAPI

export class WordProvider {
    constructor() {
        this.offlineWords = [];
        this.usedIndices = new Set();
        this.cache = new Map();
    }

    async init() {
        try {
            const resp = await fetch('msc/secph.txt');
            if (resp.ok) {
                const data = await resp.json();
                this.offlineWords = data.span || [];
            }
        } catch (e) {
            console.warn("Failed to load local secph.txt, using fallback array", e);
            this.offlineWords = [
                ["HANGMAN", "A word guessing game", "Classic paper & pencil game"],
                ["JAVASCRIPT", "The language of the web", "Runs in all browsers"],
                ["SUPER MARIO", "Famous video game character", "Jumps on Goombas and turtles"],
                ["ELEPHANT", "Largest living land animal", "Has a long trunk and large ears"],
                ["GALAXY", "System of millions or billions of stars", "Held together by gravitational attraction"]
            ];
        }
    }

    /**
     * Gets a word according to mode: 'builtin', 'online', or custom.
     * Returns: { word: string, hints: string[] }
     */
    async getWord({ mode = 'builtin', difficulty = 0, customWord = null } = {}) {
        if (customWord && customWord.trim()) {
            const clean = customWord.trim().toUpperCase();
            const hints = await this.fetchDefinition(clean);
            return {
                word: clean,
                hints: hints.length ? hints : ["Custom challenge from opponent!"]
            };
        }

        if (mode === 'online') {
            try {
                const onlineWord = await this.fetchOnlineWord(difficulty);
                if (onlineWord) return onlineWord;
            } catch (err) {
                console.warn("Online word fetch failed, falling back to local pool", err);
            }
        }

        // Built-in offline pool
        return this.getRandomBuiltin(difficulty);
    }

    getRandomBuiltin(difficulty = 0) {
        if (!this.offlineWords || this.offlineWords.length === 0) {
            return { word: "HANGMAN", hints: ["A popular word game"] };
        }

        const minLengths = [3, 4, 6, 8];
        const minLen = minLengths[difficulty] || 3;

        // Try to pick a fresh word matching length criteria
        let attempts = 0;
        let chosen = null;
        while (attempts < 100) {
            const idx = Math.floor(Math.random() * this.offlineWords.length);
            const entry = this.offlineWords[idx];
            const word = entry[0];
            if (!this.usedIndices.has(idx) && word.length >= minLen) {
                this.usedIndices.add(idx);
                chosen = entry;
                break;
            }
            attempts++;
        }

        if (!chosen) {
            this.usedIndices.clear();
            const idx = Math.floor(Math.random() * this.offlineWords.length);
            chosen = this.offlineWords[idx];
        }

        const word = chosen[0];
        const hints = chosen.slice(1).filter(h => typeof h === 'string' && h.trim().length > 0);
        return { word, hints };
    }

    /**
     * Fetch random word with definition via Datamuse API
     */
    async fetchOnlineWord(difficulty = 0) {
        const lengthRules = [
            { min: 4, max: 5 },
            { min: 5, max: 7 },
            { min: 7, max: 9 },
            { min: 9, max: 13 }
        ];
        const rule = lengthRules[difficulty] || lengthRules[1];
        const spPattern = '?'.repeat(Math.floor((rule.min + rule.max) / 2));

        // Datamuse API: popular nouns/adjectives
        const url = `https://api.datamuse.com/words?sp=${spPattern}&md=d&max=40`;
        const resp = await fetch(url);
        if (!resp.ok) return null;

        const data = await resp.json();
        const valid = data.filter(item => 
            item.word && 
            /^[a-z]+$/i.test(item.word) &&
            item.defs && item.defs.length > 0
        );

        if (valid.length === 0) return null;

        const pick = valid[Math.floor(Math.random() * valid.length)];
        const cleanWord = pick.word.toUpperCase();
        const hints = pick.defs.map(d => {
            // Strip pos tag e.g. "n\t"
            return d.replace(/^[a-z]+\t/i, '').trim();
        });

        return {
            word: cleanWord,
            hints: hints.length ? hints : ["No hint available"]
        };
    }

    /**
     * Fetches definitions for custom words via Free Dictionary API
     */
    async fetchDefinition(word) {
        try {
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
            const resp = await fetch(url);
            if (!resp.ok) return [];

            const data = await resp.json();
            const hints = [];
            if (Array.isArray(data) && data[0] && data[0].meanings) {
                for (const meaning of data[0].meanings) {
                    if (meaning.definitions) {
                        for (const def of meaning.definitions) {
                            if (def.definition) {
                                hints.push(def.definition);
                                if (hints.length >= 3) break;
                            }
                        }
                    }
                    if (hints.length >= 3) break;
                }
            }
            return hints;
        } catch (e) {
            return [];
        }
    }
}

export const wordProvider = new WordProvider();
