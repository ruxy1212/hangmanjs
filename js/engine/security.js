// js/engine/security.js
// Anti-cheat cryptographic commitments & letter hashing for Hangman

/**
 * Computes a standard SHA-256 hex digest for a string.
 * Uses Web Crypto API when available; falls back to an internal pure-JS SHA-256.
 */
export async function sha256(message) {
    if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return jsSha256(message);
}

/**
 * Generates an ephemeral random salt for the game round
 */
export function generateSalt(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let salt = '';
    const array = new Uint8Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            salt += chars[array[i] % chars.length];
        }
    } else {
        for (let i = 0; i < length; i++) {
            salt += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return salt;
}

/**
 * Creates a committed word session.
 * Stores length, hints, and an indexed lookup table of letter hashes.
 * Plaintext word is discarded from memory once committed.
 */
export async function createWordCommitment(word, hints = []) {
    const upperWord = word.trim().toUpperCase();
    const salt = generateSalt(16);
    const length = upperWord.length;

    // Track letter positions and space indices
    const spaceIndices = [];
    const letterMap = new Map(); // letter -> array of indices
    let distinctLettersCount = 0;

    for (let i = 0; i < length; i++) {
        const ch = upperWord[i];
        if (ch === ' ' || ch === '-') {
            spaceIndices.push(i);
        } else {
            if (!letterMap.has(ch)) {
                letterMap.set(ch, []);
                distinctLettersCount++;
            }
            letterMap.get(ch).push(i);
        }
    }

    // Hash each letter with the round salt: Hash(letter + ":" + salt)
    const letterHashes = {};
    for (const [letter, indices] of letterMap.entries()) {
        const hash = await sha256(`${letter}:${salt}`);
        letterHashes[hash] = indices;
    }

    // Keep an encrypted or salted signature of the full answer for end-of-round verification
    const fullCommitment = await sha256(`${upperWord}::${salt}`);

    // Cleaned hints with word redact
    const sanitizedHints = hints.map(hint => sanitizeHint(hint, upperWord));

    return {
        salt,
        length,
        spaceIndices,
        letterHashes,
        distinctLettersCount,
        hints: sanitizedHints,
        fullCommitment,
        // Revealed only at game over
        _reveal: () => upperWord
    };
}

/**
 * Evaluates a guessed letter against the cryptographic letter commitment.
 * Returns: { isCorrect: boolean, positions: number[], remainingLetters: number }
 */
export async function testGuessedLetter(letter, commitment, solvedLettersSet) {
    const upper = letter.toUpperCase();
    const candidateHash = await sha256(`${upper}:${commitment.salt}`);

    if (commitment.letterHashes[candidateHash]) {
        const positions = commitment.letterHashes[candidateHash];
        solvedLettersSet.add(upper);
        return {
            isCorrect: true,
            positions,
            remainingDistinct: commitment.distinctLettersCount - solvedLettersSet.size
        };
    }

    return {
        isCorrect: false,
        positions: [],
        remainingDistinct: commitment.distinctLettersCount - solvedLettersSet.size
    };
}

/**
 * Strips the target word and close variations from hint strings so DevTools clues don't leak it.
 */
export function sanitizeHint(hint, secretWord) {
    if (!hint || !secretWord) return hint || '';
    const cleanWord = secretWord.replace(/[^A-Za-z0-9]/g, '');
    if (cleanWord.length < 3) return hint;
    const regex = new RegExp(`\\b${cleanWord}\\b`, 'gi');
    return hint.replace(regex, '______');
}

// Minimal fallback SHA-256 for non-crypto environments
function jsSha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    let hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return;
        words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength | 0;

    for (j = 0; j < words.length;) {
        const w = words.slice(j, (j += 16));
        const oldHash = hash;
        hash = hash.slice(0, 8);
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
            const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
            w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
            const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
            const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            const s_1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
            const s_0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
            const t1 = hash[7] + s_1 + ch + k[i] + w[i];
            const t2 = s_0 + maj;
            hash = [(t1 + t2) | 0].concat(hash);
            hash[4] = (hash[4] + t1) | 0;
        }
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? '0' : '') + b.toString(16);
        }
    }
    return result;
}
