// js/multi/peer-sync.js
// Lightweight WebRTC peer-to-peer data channel synchronization for simultaneous duels

export class PeerSync {
    constructor({ onOpponentConnected, onOpponentMessage, onOpponentDisconnected }) {
        this.onOpponentConnected = onOpponentConnected;
        this.onOpponentMessage = onOpponentMessage;
        this.onOpponentDisconnected = onOpponentDisconnected;

        this.peerConnection = null;
        this.dataChannel = null;
        this.isHost = false;
        this.iceConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };
    }

    createConnection() {
        this.peerConnection = new RTCPeerConnection(this.iceConfig);

        this.peerConnection.oniceconnectionstatechange = () => {
            if (['disconnected', 'failed', 'closed'].includes(this.peerConnection.iceConnectionState)) {
                if (this.onOpponentDisconnected) this.onOpponentDisconnected();
            }
        };

        this.peerConnection.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };
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
                console.warn("Invalid message from peer:", event.data);
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
