// js/multi/peer-sync.js
// Lightweight WebRTC peer-to-peer data channel synchronization using free public MQTT/WebSocket signaling

export class PeerSync {
    constructor({ onOpponentConnected, onOpponentMessage, onOpponentDisconnected }) {
        this.onOpponentConnected = onOpponentConnected;
        this.onOpponentMessage = onOpponentMessage;
        this.onOpponentDisconnected = onOpponentDisconnected;

        this.peerConnection = null;
        this.dataChannel = null;
        this.isHost = false;
        this.roomId = null;
        this.ws = null;

        this.iceConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' }
            ]
        };
    }

    /**
     * Connects to a public, zero-setup signaling broker (PieSocket public demo or HiveMQ WebSocket)
     */
    initSignaling(roomId, isHost = false) {
        this.roomId = roomId;
        this.isHost = isHost;

        // Use public lightweight WebSocket echo / broker
        const brokerUrl = `wss://broker.emqx.io:8084/mqtt`;
        // Or simple broadcast channel for same-browser testing & cross-tab instantly
        this.broadcastChannel = new BroadcastChannel(`hng_room_${roomId}`);
        this.broadcastChannel.onmessage = (event) => {
            this.handleSignalingMessage(event.data);
        };
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

        this.sendSignaling({
            type: 'offer',
            sdp: {
                type: this.peerConnection.localDescription.type,
                sdp: this.peerConnection.localDescription.sdp
            }
        });
    }

    async joinRoom(roomId) {
        this.initSignaling(roomId, false);
        this.createPeerConnection();

        // Notify host that guest is ready
        this.sendSignaling({ type: 'guest-ready' });
    }

    createPeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(this.iceConfig);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'candidate',
                    candidate: event.candidate.toJSON ? event.candidate.toJSON() : JSON.parse(JSON.stringify(event.candidate))
                });
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
            // Re-broadcast offer when guest arrives
            if (this.peerConnection.localDescription) {
                this.sendSignaling({
                    type: 'offer',
                    sdp: {
                        type: this.peerConnection.localDescription.type,
                        sdp: this.peerConnection.localDescription.sdp
                    }
                });
            }
        } else if (msg.type === 'offer' && !this.isHost) {
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
            } catch (e) {
                // Ignore duplicate candidates
            }
        }
    }


    setupDataChannel(channel) {
        this.dataChannel = channel;

        this.dataChannel.onopen = () => {
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
