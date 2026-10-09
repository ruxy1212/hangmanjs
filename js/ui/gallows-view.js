// js/ui/gallows-view.js
// Handles gallows graphics, character progression, and opponent ghost silhouette rendering

export class GallowsView {
    constructor({ playerContainer, opponentContainer = null }) {
        this.playerContainer = playerContainer;
        this.opponentContainer = opponentContainer;
    }

    renderPlayerStage(failCount, isHappy = false) {
        if (!this.playerContainer) return;
        this.playerContainer.innerHTML = this.getStageHtml(failCount, isHappy, false);
    }

    renderOpponentStage(failCount, isHappy = false) {
        if (!this.opponentContainer) return;
        this.opponentContainer.innerHTML = this.getStageHtml(failCount, isHappy, true);
    }

    getStageHtml(fail, isHappy, isGhost) {
        const hold0 = '<div style="background-image: url(img/';
        const hold2 = '.png);"></div>';
        let content = '';

        if (fail === 0) {
            content = `${hold0}f1${hold2}`;
        } else if (fail === 1) {
            content = `${hold0}gallow-off${hold2}${hold0}f1${hold2}`;
        } else if (fail >= 10) {
            content = `${hold0}knell${hold2}${hold0}f10b${hold2}${hold0}gallow-on${hold2}${hold0}f10a${hold2}`;
        } else {
            const prefix = isHappy ? 'c' : 'f';
            content = `${hold0}gallow-off${hold2}${hold0}${prefix}${fail}${hold2}`;
        }

        const ghostClass = isGhost ? 'opponent-ghost-inner' : 'player-stage-inner';
        return `<div class="${ghostClass}">${content}</div>`;
    }
}
