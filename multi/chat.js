// chat.js
const createButton = document.getElementById("create-button");
const joinButton = document.getElementById("join-button");
const conversationsDiv = document.getElementById("conversations");
const conversationScreen = document.getElementById("conversation-screen");
const chatDiv = document.getElementById("chat");
const messageInput = document.getElementById("message-input");

const conversations = [];

createButton.addEventListener("click", () => {
    // Generate a random conversation ID
    const conversationID = Math.random().toString(36).substr(2, 9);

    // Add the conversation to the list of conversations
    conversations.push({ id: conversationID, recipient: null });

    // Show the waiting screen for the sender
    conversationScreen.style.display = "block";
    conversationsDiv.innerHTML = "<p>Waiting for recipient to join...</p>";
    messageInput.readOnly = true;

    // Start WebRTC for the sender
    startWebRTC(conversationID, "sender");
});

joinButton.addEventListener("click", () => {
    if (conversations.length === 0) {
        conversationsDiv.innerHTML = "<p>No conversations available.</p>";
    } else {
        conversationsDiv.innerHTML = "";
        conversations.forEach((conversation) => {
            if (conversation.recipient === null) {
                const joinButton = document.createElement("button");
                joinButton.textContent = `Join Conversation ${conversation.id}`;
                joinButton.addEventListener("click", () => {
                    // Set the recipient for this conversation
                    conversation.recipient = "Recipient";
                    // Show the conversation screen for the recipient
                    conversationScreen.style.display = "block";
                    chatDiv.innerHTML = "<p>Chat started. Send your message...</p>";
                    messageInput.readOnly = false;

                    // Start WebRTC for the recipient
                    startWebRTC(conversation.id, "recipient");
                });
                conversationsDiv.appendChild(joinButton);
            }
        });
    }
});

const peerConnectionConfig = {
    iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
};

function startWebRTC(conversationID, role) {
    const peerConnection = new RTCPeerConnection(peerConnectionConfig);

    // Send ICE candidate to the peer
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignal(conversationID, role, "candidate", event.candidate);
        }
    };

    // Set up the data channel for messaging
    const dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.onmessage = (event) => {
        const message = event.data;
        chatDiv.innerHTML += `<p><b>${role === "sender" ? "Sender" : "Recipient"}:</b> ${message}</p>`;
    };
    dataChannel.onopen = () => {
        messageInput.readOnly = false;
    };
    dataChannel.onclose = () => {
        messageInput.readOnly = true;
    };

    // Set up the offer or answer for peer connection
    if (role === "sender") {
        peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            sendSignal(conversationID, role, "offer", offer);
        });
    } else if (role === "recipient") {
        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
            dataChannel.onmessage = (event) => {
                const message = event.data;
                chatDiv.innerHTML += `<p><b>${role === "sender" ? "Sender" : "Recipient"}:</b> ${message}</p>`;
            };
            dataChannel.onopen = () => {
                messageInput.readOnly = false;
            };
            dataChannel.onclose = () => {
                messageInput.readOnly = true;
            };
        };

        // The recipient will receive the offer and send the answer
        receiveSignal(conversationID, "sender").then((offer) => {
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            peerConnection.createAnswer().then((answer) => {
                peerConnection.setLocalDescription(answer);
                sendSignal(conversationID, role, "answer", answer);
            });
        });
    }
}

function sendSignal(conversationID, role, signalType, signal) {
    // Simulate sending the signal to the peer over the LAN (you'd need to handle actual signaling in a real-world application)
    receiveSignal(conversationID, role === "sender" ? "recipient" : "sender", signalType, signal);
}

function receiveSignal(conversationID, role, signalType, signal) {
    // Simulate receiving the signal from the peer over the LAN (you'd need to handle actual signaling in a real-world application)
    return Promise.resolve(signal);
}

messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && !messageInput.readOnly) {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value;
    if (message.trim() !== "") {
        chatDiv.innerHTML += `<p><b>Sender:</b> ${message}</p>`;
        sendMessageOverDataChannel(message);
        messageInput.value = "";
        messageInput.readOnly = true;
    }
}

function sendMessageOverDataChannel(message) {
    const dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.send(message);
    dataChannel.onopen = () => {
        messageInput.readOnly = false;
    };
    dataChannel.onclose = () => {
        messageInput.readOnly = true;
    };
}
