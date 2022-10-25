<template>
    <div class="meeting-room">
        <div id="video-call-div">
            <video muted id="local-video" autoplay></video>
            <div id="main-content">
                <video id="remote-video" class="remote-video" autoplay></video>
                <div id="chat-component" class="chat-wrapper">
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
    import { mapState } from 'vuex'
    // import { Peer } from "peerjs";
    // import { v4 as uuidv4 } from 'uuid';

    let localStream
    let peerConn
    let peer_media_elements = []
    let peers = {}
    let isAudio = true;
    let isVideo = true;
    let ICE_SERVERS = [
        {urls:"stun:stun.l.google.com:19302"}
    ];

    export default {
        name: "MeetingRoom",
        data: function () {
            return {
                messages: [],
                message: "",
                channelId: "",
                loggedUser: this.$store.state.userLogin,
                socketServer: new WebSocket(
                    `ws://127.0.0.1:8000/ws/chat/${this.$route.params.roomId.replaceAll('-', '')}/`
                ),
                meetingsList: [],
                roomId: this.$route.params.roomId,
                startCall() {
                    navigator.getUserMedia({
                        video: true,
                        audio: true
                    }, (stream) => {
                        localStream = stream
                        document.getElementById("local-video").srcObject = localStream
                        // document.getElementById("remote-video").srcObject = localStream

                        let configuration = {
                            iceServers: [
                                {
                                    "urls": ["stun:stun.l.google.com:19302", 
                                    "stun:stun1.l.google.com:19302", 
                                    "stun:stun2.l.google.com:19302"]
                                }
                            ]
                        }

                        peerConn = new RTCPeerConnection(configuration)
                        console.table(peerConn)

                    }, (error) => {
                        console.log(error)
                    })
                },
                muteAudio() {
                    isAudio = !isAudio
                    localStream.getAudioTracks()[0].enabled = isAudio
                },
                muteVideo() {
                    isVideo = !isVideo
                    localStream.getVideoTracks()[0].enabled = isVideo
                },   
                leaveRoom() {
                    this.$router.push({ name: 'meetings' });
                },
                toggleChat() {
                    if (document.getElementById("chat-component").style.display == 'none') {
                        document.getElementById("chat-component").style.display = 'flex';
                        document.getElementById("remote-video").style.width = '70vw';
                    } else {
                        document.getElementById("chat-component").style.display = 'none';
                        document.getElementById("remote-video").style.width = '95vw';
                    }

                },
                sendMessage() {
                    this.socketServer.send(
                        JSON.stringify({
                            message: this.message,
                            userLogin: this.loggedUser,
                            type: 'live_chat'
                        })
                    );

                    this.message = "";
                }
            };
        },
        computed: mapState(['APIData']), 
        mounted() {
            this.startCall();

            // this.socketServer.onopen = e => {
            //     console.log("open");
            //     console.log(e);
            // };

            this.socketServer.onmessage = e => {
                const data = JSON.parse(e.data);
                this.channelId = data.self_id

                if(data.event_type == 'live_chat') {
                    const message = data;
                    this.messages.push(message);
                } else if (data.event_type == 'add_peer'){
                    console.log('Signaling server said to add peer:', data.channel_to_pair);
                    var peer_id = data.channel_to_pair;
                    
                    var peer_connection = new RTCPeerConnection(
                        {"iceServers": ICE_SERVERS},
                        {"optional": [{"DtlsSrtpKeyAgreement": true}]} 
                    );
                    peers[peer_id] = peer_connection;

                    peer_connection.onicecandidate = function(event) {
                        if (event.candidate) {
                            this.socketServer.send(
                                JSON.stringify({
                                    type: 'relayICECandidate',
                                    peer_id: peer_id,
                                    'ice_candidate': {
                                        'sdpMLineIndex': event.candidate.sdpMLineIndex,
                                        'candidate': event.candidate.candidate
                                    }
                                })
                            );
                        }
                    }

                    peer_connection.ontrack = function(event) {
                        document.getElementById("remote-video").srcObject = event.streams[0]
                        peer_media_elements[peer_id] = document.getElementById("remote-video").srcObject;
                    }

                    peer_connection.addStream(localStream);

                    if (data.create_offer) {
                        console.log("Creating RTC offer to ", peer_id);
                        peer_connection.createOffer(
                            function (local_description) { 
                                console.log("Local offer description is: ", local_description);
                                peer_connection.setLocalDescription(
                                    local_description,
                                    sendSocketEventForRelaySessionDescription(peer_id, local_description),
                                    function() { 
                                        alert("Offer setLocalDescription failed!"); 
                                    }
                                );
                            },
                            function (error) {
                                console.log("Error sending offer: ", error);
                            }
                        );
                    }
                } else if (data.event_type == 'relaySessionDescription') {
                    onSessionDescription(data)
                } else if (data.event_type == 'relayICECandidate') {
                    onIceCandidate(data)
                }
            };

            function onIceCandidate(config) {
                var peer = peers[config.peer_id];
                var ice_candidate = config.ice_candidate;
                peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
            }

            function sendSocketEventForRelaySessionDescription(peer_id, local_description) {
                this.socketServer.send(
                    JSON.stringify({
                        type: 'relaySessionDescription',
                        peer_id: peer_id,
                        session_description: local_description
                    })
                );
                alert("Offer setLocalDescription succeed!")
            }

            function onSessionDescription(config) {
                console.log('Remote description received: ', config);
                var peer_id = config.peer_id;
                var peer = peers[peer_id];
                var remote_description = config.session_description;
                console.log(config.session_description);

                var desc = new RTCSessionDescription(remote_description);
                var stuff = peer.setRemoteDescription(desc, 
                    function() {
                        console.log("setRemoteDescription succeeded");
                        if (remote_description.type == "offer") {
                            console.log("Creating answer");
                            peer.createAnswer(
                                function(local_description) {
                                    console.log("Answer description is: ", local_description);
                                    peer.setLocalDescription(local_description,
                                        function() { 

                                            this.socketServer.send(
                                                JSON.stringify({
                                                    type: 'relaySessionDescription',
                                                    peer_id: peer_id,
                                                    session_description: local_description
                                                })
                                            );
                                            console.log("Answer setLocalDescription succeeded");
                                        },
                                        function() { 
                                            alert("Answer setLocalDescription failed!"); 
                                        }
                                    );
                                },
                                function(error) {
                                    console.log("Error creating answer: ", error);
                                    console.log(peer);
                                });
                        }
                    },
                    function(error) {
                        console.log("setRemoteDescription error: ", error);
                    }
                );
                console.log("Session description: ", desc);
                console.log("Stuff Object: ", stuff);
            }

            this.socketServer.onclose = e => {
                console.error("Erro no socket!");
                console.error(e);
            };
            
            this.socketServer.onerror = e => {
                console.error("Erro no socket!");
                console.error(e);
            };
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
        width: 70vw;
        background: rgb(255, 255, 255, 0.3);
        margin: 32px 0 32px 32px;
        transition: all 0.3s;
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