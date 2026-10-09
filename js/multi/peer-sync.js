// js/multi/peer-sync.js
// Hybrid WebRTC peer-to-peer data channel synchronization using Firebase RTDB and local BroadcastChannel

import { leaderboardManager } from '../engine/leaderboard.js';
import { ref, set, onValue, remove, push, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export class PeerSync {
    constructor({ onOpponentConnected, onOpponentMessage, onOpponentDisconnected }) {
        this.onOpponentConnected = onOpponentConnected;
        this.onOpponentMessage = onOpponentMessage;
        this.onOpponentDisconnected = onOpponentDisconnected;

        this.peerConnection = null;
        this.dataChannel = null;
        this.isHost = false;
        this.roomId = null;
        this.broadcastChannel = null;
        this.firebaseUnsubs = [];

        this.iceConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' }
            ]
        };
    }

    get db() {
        return leaderboardManager.db;
    }

    initSignaling(roomId, isHost = false) {
        this.roomId = roomId;
        this.isHost = isHost;

        // Local BroadcastChannel for instant same-browser cross-tab
        try {
            this.broadcastChannel = new BroadcastChannel(`hng_room_${roomId}`);
            this.broadcastChannel.onmessage = (event) => {
                this.handleSignalingMessage(event.data);
            };
        } catch (e) {
            console.warn("BroadcastChannel not supported:", e);
        }
    }

    sendSignaling(data) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(data);
        }
    }

    async createRoom(roomId) {
        this.initSignaling(roomId, true);
        this.createPeerConnection();

        // Create data channel as host
        this.dataChannel = this.peerConnection.createDataChannel('hangman-duel', {
            ordered: true
        });
        this.setupDataChannel(this.dataChannel);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        const offerData = {
            type: 'offer',
            sdp: {
                type: this.peerConnection.localDescription.type,
                sdp: this.peerConnection.localDescription.sdp
            }
        };

        // 1. Broadcast locally
        this.sendSignaling(offerData);

        // 2. Publish to Firebase RTDB for cross-browser signaling
        if (this.db) {
            const sigRef = ref(this.db, `games/signaling/${roomId}`);
            const offerRef = ref(this.db, `games/signaling/${roomId}/offer`);
            await set(offerRef, offerData.sdp);
            onDisconnect(sigRef).remove();

            // Listen for guest answer in Firebase
            const answerRef = ref(this.db, `games/signaling/${roomId}/answer`);
            const unsubAnswer = onValue(answerRef, async (snapshot) => {
                const answer = snapshot.val();
                if (answer && this.peerConnection && this.peerConnection.signalingState !== 'stable') {
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                }
            });
            this.firebaseUnsubs.push(unsubAnswer);

            // Listen for guest ICE candidates in Firebase
            const guestCandidatesRef = ref(this.db, `games/signaling/${roomId}/guestCandidates`);
            const unsubCandidates = onValue(guestCandidatesRef, (snapshot) => {
                const candidates = snapshot.val();
                if (candidates && this.peerConnection) {
                    for (const key in candidates) {
                        try {
                            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidates[key]));
                        } catch (e) {}
                    }
                }
            });
            this.firebaseUnsubs.push(unsubCandidates);
        }
    }

    async joinRoom(roomId) {
        this.initSignaling(roomId, false);
        this.createPeerConnection();

        // Broadcast ready locally
        this.sendSignaling({ type: 'guest-ready' });

        // Check Firebase for offer
        if (this.db) {
            const sigRef = ref(this.db, `games/signaling/${roomId}`);
            onDisconnect(ref(this.db, `games/signaling/${roomId}/answer`)).remove();

            const offerRef = ref(this.db, `games/signaling/${roomId}/offer`);
            const unsubOffer = onValue(offerRef, async (snapshot) => {
                const offer = snapshot.val();
                if (offer && this.peerConnection && !this.peerConnection.remoteDescription) {
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);

                    const answerData = {
                        type: this.peerConnection.localDescription.type,
                        sdp: this.peerConnection.localDescription.sdp
                    };

                    this.sendSignaling({ type: 'answer', sdp: answerData });
                    await set(ref(this.db, `games/signaling/${roomId}/answer`), answerData);
                }
            });
            this.firebaseUnsubs.push(unsubOffer);

            // Listen for host ICE candidates in Firebase
            const hostCandidatesRef = ref(this.db, `games/signaling/${roomId}/hostCandidates`);
            const unsubCandidates = onValue(hostCandidatesRef, (snapshot) => {
                const candidates = snapshot.val();
                if (candidates && this.peerConnection) {
                    for (const key in candidates) {
                        try {
                            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidates[key]));
                        } catch (e) {}
                    }
                }
            });
            this.firebaseUnsubs.push(unsubCandidates);
        }
    }

    createPeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(this.iceConfig);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const candData = event.candidate.toJSON ? event.candidate.toJSON() : JSON.parse(JSON.stringify(event.candidate));
                // Broadcast locally
                this.sendSignaling({
                    type: 'candidate',
                    candidate: candData
                });

                // Write to Firebase
                if (this.db && this.roomId) {
                    const targetPath = this.isHost ? 'hostCandidates' : 'guestCandidates';
                    push(ref(this.db, `games/signaling/${this.roomId}/${targetPath}`), candData).catch(() => {});
                }
            }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            const state = this.peerConnection.iceConnectionState;
            if (['disconnected', 'failed', 'closed'].includes(state)) {
                if (this.onOpponentDisconnected) this.onOpponentDisconnected();
            }
        };

        this.peerConnection.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };
    }

    async handleSignalingMessage(msg) {
        if (!msg || !this.peerConnection) return;

        if (msg.type === 'guest-ready' && this.isHost) {
            if (this.peerConnection.localDescription) {
                this.sendSignaling({
                    type: 'offer',
                    sdp: {
                        type: this.peerConnection.localDescription.type,
                        sdp: this.peerConnection.localDescription.sdp
                    }
                });
            }
        } else if (msg.type === 'offer' && !this.isHost && !this.peerConnection.remoteDescription) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.sendSignaling({
                type: 'answer',
                sdp: {
                    type: this.peerConnection.localDescription.type,
                    sdp: this.peerConnection.localDescription.sdp
                }
            });
        } else if (msg.type === 'answer' && this.isHost) {
            if (this.peerConnection.signalingState !== 'stable') {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }
        } else if (msg.type === 'candidate') {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {}
        }
    }

    setupDataChannel(channel) {
        this.dataChannel = channel;

        this.dataChannel.onopen = () => {
            // Clean up signaling node once connected
            if (this.db && this.roomId && this.isHost) {
                remove(ref(this.db, `games/signaling/${this.roomId}`)).catch(() => {});
            }
            if (this.onOpponentConnected) this.onOpponentConnected();
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.onOpponentMessage) this.onOpponentMessage(data);
            } catch (e) {
                console.warn("Invalid data received on P2P channel:", event.data);
            }
        };

        this.dataChannel.onclose = () => {
            if (this.onOpponentDisconnected) this.onOpponentDisconnected();
        };
    }

    sendMessage(payload) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(payload));
        }
    }

    disconnect() {
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
        if (this.firebaseUnsubs.length > 0) {
            this.firebaseUnsubs.forEach(unsub => {
                try { unsub(); } catch (e) {}
            });
            this.firebaseUnsubs = [];
        }
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }
}
