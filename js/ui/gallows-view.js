// js/ui/gallows-view.js
// Handles shared gallows graphics, player character sprite, and opponent ghost silhouette rendering

export class GallowsView {
    constructor({ gallowsContainer, playerContainer, opponentContainer = null }) {
        this.gallowsContainer = gallowsContainer;
        this.playerContainer = playerContainer;
        this.opponentContainer = opponentContainer;
        this.playerFail = 0;
        this.opponentFail = 0;
    }

    reset() {
        this.playerFail = 0;
        this.opponentFail = 0;
        if (this.gallowsContainer) {
            this.gallowsContainer.innerHTML = '';
        }
        if (this.playerContainer) {
            this.playerContainer.innerHTML = '<div style="background-image: url(img/f1.png);"></div>';
        }
        if (this.opponentContainer) {
            this.opponentContainer.innerHTML = '<div style="background-image: url(img/f1.png);"></div>';
        }
    }

    renderPlayerStage(failCount, isHappy = false) {
        this.playerFail = failCount;
        this.updateSharedGallows();

        if (this.playerContainer) {
            this.playerContainer.innerHTML = this.getCharacterSpriteHtml(failCount, isHappy);
        }
    }

    renderOpponentStage(failCount, isHappy = false) {
        this.opponentFail = failCount;
        this.updateSharedGallows();

        if (this.opponentContainer) {
            this.opponentContainer.innerHTML = this.getCharacterSpriteHtml(failCount, isHappy);
        }
    }

    updateSharedGallows() {
        if (!this.gallowsContainer) return;
        const maxFail = Math.max(this.playerFail, this.opponentFail);
        const hold0 = '<div style="background-image: url(img/';
        const hold2 = '.png);"></div>';

        if (this.playerFail >= 10 || this.opponentFail >= 10) {
            // Hanging gallows state
            this.gallowsContainer.innerHTML = `${hold0}knell${hold2}${hold0}gallow-on${hold2}`;
        } else if (maxFail >= 1) {
            // Wooden gallows erected
            this.gallowsContainer.innerHTML = `${hold0}gallow-off${hold2}`;
        } else {
            // Stage clean before any mistake
            this.gallowsContainer.innerHTML = '';
        }
    }

    getCharacterSpriteHtml(fail, isHappy) {
        const hold0 = '<div style="background-image: url(img/';
        const hold2 = '.png);"></div>';

        if (fail === 0) {
            return `${hold0}f1${hold2}`;
        } else if (fail >= 10) {
            return `${hold0}f10b${hold2}${hold0}f10a${hold2}`;
        } else {
            const prefix = isHappy ? 'c' : 'f';
            return `${hold0}${prefix}${fail}${hold2}`;
        }
    }
}
