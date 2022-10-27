<template>
    <div class="meeting-room">
        <div id="video-call-div">
            <video muted id="local-video" ref="local-video" autoplay></video>
            <div id="main-content">
                <video id="remote-video" :class="{expanded: !isChatVisible}" ref="remote-video" class="remote-video" autoplay></video>
                <div id="chat-component" ref="chat-component" class="chat-wrapper" v-show="isChatVisible">
                    <div class="incoming-messages">
                        <div class="incoming-message" v-for="(message, index) in messages" :key="index">
                            <div class="user-name">
                                • {{ message.user }} • {{ message.event_time }} •
                            </div>
                            <div class="user-message">
                                {{ message.message }}
                            </div>
                            <hr class="solid">
                        </div>
                    </div>
                    <div class="input-messages">   
                        <input v-model="message" v-on:keyup.enter="sendMessage()" type="text" class="input-message">
                        <a v-on:click="sendMessage()" class="send-icon">
                            <mdicon name="arrow-right-box"/> 
                        </a>
                    </div>
                </div>
            </div>
            <div class="call-action-div">
                <ul class="wrapper">
                    <li v-on:click="muteVideo()" class="icon facebook">
                        <span class="tooltip">Mute video</span>
                        <mdicon name="camera-off"/> 
                    </li>
                    <li v-on:click="muteAudio()" class="icon twitter">
                        <span class="tooltip">Mute audio</span>
                        <mdicon name="microphone-off"/> 
                    </li>
                    <li v-on:click="toggleChat()" class="icon github">
                        <span class="tooltip">Chat</span>
                        <mdicon name="forum"/> 
                    </li>
                    <li v-on:click="leaveRoom()" class="icon instagram">
                        <span class="tooltip">Deixar reunião</span>
                        <mdicon name="exit-to-app"/> 
                    </li>
                </ul>
            </div>
        </div>
    </div>    
</template>

<script>
    import { mapGetters, mapState } from 'vuex'

    export default {
        name: "MeetingRoom",
        data: function () {
            return {
                messages: [],
                peers: {},
                localStream: null,
                isAudio: true,
                isVideo: true,
                isChatVisible: false,
                message: "",
                channelId: "",
                peerMediaElements: [],
                socketServer: null,
                meetingsList: [],
                roomId: this.$route.params.roomId,
            };
        },
        computed: {
            ...mapState(['APIData']),
            ...mapGetters({loggedUser: 'userLogin'}),
        }, 
        methods: {
            muteAudio() {
                this.isAudio = !this.isAudio
                this.localStream.getAudioTracks()[0].enabled = this.isAudio
            },
            muteVideo() {
                this.isVideo = !this.isVideo
                this.localStream.getVideoTracks()[0].enabled = this.isVideo
            },   
            leaveRoom() {
                this.$router.push({ name: 'meetings' });
            },
            toggleChat() {
                this.isChatVisible = !this.isChatVisible
            },
            sendMessage() {
                this.sendSocketServerMessage({
                    message: this.message,
                    userLogin: this.loggedUser,
                    type: 'live_chat'
                })

                this.message = "";
            },
            startCall() {
                const params = { 
                    video: true,
                    audio: true
                }
                navigator.getUserMedia(params, this.userStreamHandler, console.log)
            },
            showUserMedia(stream) {
                this.$refs['local-video'].srcObject = stream
            },
            userStreamHandler(stream) {
                this.localStream = stream
                this.showUserMedia(stream)
                this.initWebsocket()
            },
            initWebsocket() {
                this.socketServer = new WebSocket(
                    `ws://127.0.0.1:8000/ws/chat/${this.$route.params.roomId.replaceAll('-', '')}/`
                )
            },
            socketServerOnMessageHandler(e) {
                let data = JSON.parse(e.data);
                this.channelId = data.self_id
                const handler = {             
                    live_chat: this.livechatEventHandler,
                    add_peer: this.addPeerEventHandler,
                    relaySessionDescription: this.relaySessionDescriptionEventHandler,
                    relayICECandidate: this.relayICECandidateEventHandler
                }[data.event_type]

                handler(data)
            },
            livechatEventHandler(message) {
                this.messages.push(message);
            },
            addPeerEventHandler(data) {
                const iceServers = [{urls:"stun:stun.l.google.com:19302"}]
                var peerId = data.channel_to_pair;
                
                var peerConnection = new RTCPeerConnection(
                    {iceServers},
                    {optional: [{"DtlsSrtpKeyAgreement": true}]} 
                );
                this.peers[peerId] = peerConnection;

                peerConnection.onicecandidate = ({candidate}) => {
                    if (!candidate) {
                        return;
                    }
                    this.sendSocketServerMessage({
                        type: 'relayICECandidate',
                        peer_id: peerId,
                        ice_candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate
                        }
                    })
                }

                peerConnection.ontrack = ({streams}) => {
                    const stream = streams[0]

                    this.$refs['remote-video'].srcObject = stream
                    this.peerMediaElements[peerId] = stream
                }

                peerConnection.addStream(this.localStream); // problema de corrida

                if (!data.create_offer) {
                    return
                }
                peerConnection.createOffer(
                    (localDescription) => { 
                        peerConnection.setLocalDescription(
                            // revisar isso aqui
                            localDescription,
                            () => this.sendSocketEventForRelaySessionDescription(peerId, localDescription),
                            () => alert("Offer setLocalDescription failed!")
                        );
                    },
                    (error) => console.log("Error sending offer: ", error)
                );
            },
            sendSocketEventForRelaySessionDescription(peerId, local_description) {
                this.sendSocketServerMessage({
                    type: 'relaySessionDescription',
                    peer_id: peerId,
                    session_description: local_description
                })
                alert("Offer setLocalDescription succeed!")
            },
            sendSocketServerMessage(data) {
                this.socketServer.send(
                    JSON.stringify(data)
                );
            },
            relaySessionDescriptionEventHandler(data) {
                var peerId = data.peer_id;
                var peer = this.peers[peerId];
                var remoteDescription = data.session_description;

                var desc = new RTCSessionDescription(remoteDescription);
                peer.setRemoteDescription(desc).then(() => {
                    this.createOfferAnswer(remoteDescription, peer. peerId)
                }) // revisar isso aqui dps
            },
            createOfferAnswer(remoteDescription, peer, peerId) {
                if (remoteDescription.type != "offer") {
                    return;
                } 
                peer.createAnswer(localDescription => {
                    this.answerCreationHandler(localDescription, peer, peerId)
                },
                function(error) {
                    console.log("Erro ao criar resposta: ", error);
                    console.log(error);
                });
            },
            answerCreationHandler(localDescription, peer, peerId) {
                // closure aqui
                console.log("Answer description is: ", localDescription);
                peer.setLocalDescription(localDescription, 
                    ()=>{ 
                        this.sendSocketServerMessage({
                            type: 'relaySessionDescription',
                                peer_id: peerId,
                                session_description: localDescription
                        })
                    },
                    function() { 
                        alert("Answer setLocalDescription failed!"); 
                    }
                );
            },
            relayICECandidateEventHandler(data) {
                const peer = this.peers[data.peer_id];
                const iceCandidate = data.ice_candidate;
                peer.addIceCandidate(new RTCIceCandidate(iceCandidate));
            }
        },
        created() {
            this.startCall();
        },
        mounted() {
            // this.socketServer.onmessage = this.socketServerOnMessageHandler

            // this.socketServer.onclose = e => {
            //     console.error("Erro no socket!");
            //     console.error(e);
            // };
            
            // this.socketServer.onerror = e => {
            //     console.error("Erro no socket!");
            //     console.error(e);
            // };
        }
    };
</script>

<style scoped>
    #video-call-div {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        overflow: hidden;
        height: 100vh;
        background: #16161a;
    }

    #local-video {
        position: absolute;
        top: 0;
        left: 0;
        margin: 20px;
        max-width: 20%;
        max-height: 20%;
        background: #ffffff;
    }

    #main-content {
        border-radius: 12px;
        height: 100vh;
        display: flex;
        justify-content: space-between;
    }

    .remote-video {
        height: 80vh;
        align-self: center;
        width: 75vw;
        background: rgb(255, 255, 255, 0.3);
        margin: 32px 0 32px 32px;
        transition: all 0.3s;
    }

    .remote-video.expanded {
        width: 95vw;
    }

    #chat-component {
        display: flex;
    }

    
    .chat-wrapper {
        background: #a7a9be;
        border-radius: 12px;
        height: 90vh;
        place-self: center;
        display: flex;
        flex-direction: column;
        padding: 16px;
        margin: 24px 32px;
        width: 20vw;
        transition: all 0.3s;
        z-index: 100;
    }

    .incoming-messages {
        color: #4e4e4e;
        font-weight: 600;
        text-align: left;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        max-height: 88%;
        overflow: auto;
    }

    .incoming-message {
        background-color: hsl(0deg 0% 100% / 30%);
        border-radius: 10px;
        margin-top: 20px;
        overflow: auto;
        min-height: 70px;
        padding: 8px 12px;
    }

    .user-name {
        font-size: 14px;
        font-weight: 300;
        margin-bottom: 10px;
    }
    
    .user-message {
        font-size: 20px;
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        margin-left: 10px;
    }

    .input-messages {
        display: flex;
        width: inherit;
        position: fixed;
        bottom: 50px
    }
    
    .send-icon {
        position: relative;
        align-self: center;
        right: 40px;
    }

    input {
        font-family: 'Roboto', sans-serif;
        color: #333;
        font-size: 1.2rem;
        border-radius: 0.2rem;
        width: 100%;
        background-color: rgb(255, 255, 255);
        border: none;
        display: block;
        margin-bottom: 12px !important;
        border-bottom: 0.3rem solid transparent;
        transition: all 0.3s;
        height: 42px;
        padding: 12px;
    }

    .call-action-div {
        position: sticky;
        bottom: 0;
    }
    
    .wrapper {
        display: inline-flex;
        list-style: none;
    }

    .wrapper .icon {
        position: relative;
        background: #ffffff;
        border-radius: 50%;
        padding: 15px;
        margin: 10px;
        width: 30px;
        height: 30px;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        box-shadow: 0 10px 10px rgb(0 0 0 / 10%);
        transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .wrapper .tooltip {
        position: absolute;
        top: 0;
        font-size: 14px;
        background: #ffffff;
        color: #ffffff;
        padding: 5px 8px;
        border-radius: 5px;
        box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .wrapper .tooltip::before {
        position: absolute;
        content: "";
        height: 8px;
        width: 8px;
        background: #ffffff;
        bottom: -3px;
        left: 50%;
        transform: translate(-50%) rotate(45deg);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .wrapper .icon:hover .tooltip {
        top: -45px;
        opacity: 1;
        visibility: visible;
    }

    .wrapper .icon:hover span,
    .wrapper .icon:hover .tooltip {
        text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.1);
    }

    .wrapper .facebook:hover,
    .wrapper .facebook:hover .tooltip,
    .wrapper .facebook:hover .tooltip::before {
        background: #1877F2;
        color: #ffffff;
    }

    .wrapper .twitter:hover,
    .wrapper .twitter:hover .tooltip,
    .wrapper .twitter:hover .tooltip::before {
        background: #1DA1F2;
        color: #ffffff;
    }

    .wrapper .instagram:hover,
    .wrapper .instagram:hover .tooltip,
    .wrapper .instagram:hover .tooltip::before {
        background: #E4405F;
        color: #ffffff;
    }

    .wrapper .github:hover,
    .wrapper .github:hover .tooltip,
    .wrapper .github:hover .tooltip::before {
        background: #333333;
        color: #ffffff;
    }

    .wrapper .youtube:hover,
    .wrapper .youtube:hover .tooltip,
    .wrapper .youtube:hover .tooltip::before {
        background: #CD201F;
        color: #ffffff;
    }
</style>