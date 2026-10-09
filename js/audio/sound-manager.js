// js/audio/sound-manager.js
// Centralized audio controller for music, sound fx, and persistence

class SoundManager {
    constructor() {
        this.musicTracks = [
            "msc/AftertheRain.mp3",
            "msc/ThroughtheArbor.mp3",
            "msc/SundialDreams.mp3",
            "msc/TheEnchantedGarden.mp3",
            "msc/Butterfly.mp3",
            "msc/StrawHats.mp3",
            "msc/AnotherRealm.mp3",
            "msc/WaterLillies.mp3",
            "msc/FairyWings.mp3",
            "msc/PaperClouds.mp3"
        ];
        this.currentTrackIndex = 0;
        this.bgm = null;
        this.muted = true;

        this.sfx = {
            click: new Howl({ src: ["msc/click.mp3"], volume: 0.25, preload: true }),
            warn: new Howl({ src: ["msc/warn.mp3"], volume: 0.25, preload: true }),
            boo: new Howl({ src: ["msc/boo.mp3"], volume: 0.35, preload: true }),
            cheer: new Howl({ src: ["msc/cheer.mp3"], volume: 0.35, preload: true }),
            gallows: new Howl({ src: ["msc/gallows.mp3"], volume: 0.4, preload: true })
        };
    }

    init(soundEnabled = false) {
        this.muted = !soundEnabled;
        this.playNextMusic();
    }

    playNextMusic() {
        if (this.bgm) {
            this.bgm.unload();
        }
        const src = this.musicTracks[this.currentTrackIndex];
        this.bgm = new Howl({
            src: [src],
            volume: 0.15,
            mute: this.muted,
            html5: true,
            onend: () => {
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
                this.playNextMusic();
            },
            onplayerror: () => {
                this.bgm.once('unlock', () => {
                    this.bgm.play();
                });
            }
        });
        this.bgm.play();
    }

    setMute(isMuted) {
        this.muted = isMuted;
        if (this.bgm) {
            this.bgm.mute(isMuted);
        }
    }

    playClick() {
        if (!this.muted) this.sfx.click.play();
    }

    playWarn() {
        if (!this.muted) this.sfx.warn.play();
    }

    playBoo() {
        if (!this.muted) this.sfx.boo.play();
    }

    playCheer() {
        if (!this.muted) this.sfx.cheer.play();
    }

    playDie() {
        if (!this.muted) this.sfx.gallows.play();
    }
}

export const soundManager = new SoundManager();
