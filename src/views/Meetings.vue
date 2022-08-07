<template>
    <div class="meetings">
        <div class="local-media-wrapper">
            <video muted id="local-media" autoplay></video>
            <div class="call-action-div">
                <div class="wrapper">
                    <div v-on:click="muteVideo()" class="icon facebook">
                        <span class="tooltip">Mutar video</span>
                        <mdicon name="camera-off"/> 
                    </div>
                    <div v-on:click="muteAudio()" class="icon twitter">
                        <span class="tooltip">Mutar audio</span>
                        <mdicon name="microphone-off"/> 
                    </div>
                </div>
            </div>
        </div>
        <div class="room-form">
            <input v-model="routRoomId" placeholder="Inserir id da call" type="text" id="username-input" /><br>
            <button v-on:click="startCall()">Criar uma chamada</button>
            <button v-on:click="joinCall()">Entrar em uma chamada</button>
        </div>
    </div>    
</template>

<script>
    import { mapState } from 'vuex'
    import { v4 as uuidv4 } from 'uuid';

    let isAudio = true;
    let isVideo = true;

    export default {
        name: "Meetings",
        data: function () {
            return {
                meetingsList: [],
                localStream: null,
                peerConn: null,
                routRoomId: '',
                startCall() {
                    let randomRoomId = uuidv4();
                    this.$router.push({ name: 'room/', params: { roomId: randomRoomId } });
                },
                joinCall() {
                    if (!this.routRoomId) {
                        alert("Insira um ID válido");
                        return;
                    }
                    this.$router.push({ name: 'room/', params: { roomId: this.routRoomId } });
                },
                startMedia() {
                    navigator.getUserMedia({
                        video: {
                            frameRate: 24,
                            width: {
                                min: 480, ideal: 720, max: 1280
                            },
                            aspectRatio: 1.33333
                        },
                        audio: true
                    }, (stream) => {
                        this.localStream = stream
                        document.getElementById("local-media").srcObject = this.localStream
                    }, (error) => {
                        console.log(error)
                    })
                },
                muteAudio() {
                    isAudio = !isAudio
                    this.localStream.getAudioTracks()[0].enabled = isAudio
                },
                muteVideo() {
                    isVideo = !isVideo
                    this.localStream.getVideoTracks()[0].enabled = isVideo
                },   
            };
        },
        computed: mapState(['APIData']), 
        created: function () {
            this.startMedia();
            // getAPI.get('/videoconf/list_meetings', { headers: { Authorization: `Bearer ${this.$store.state.accessToken}` } })
            // .then( response => {
            //     this.$store.state.APIData = response.data
            //     this.meetingsList = response.data
            // })
            // .catch( error => {
            //     console.log(error)
            // })
        }
    };
</script>

<style scoped>
    .meetings {
        margin: auto auto;
        position: absolute;
        top: 50%;
        left: 50%;
        height: 100%;
        transform: translate(-50%, -50%);
        width: 100%;
        justify-content: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #local-media {
        border-radius: 12px;
        box-shadow: 0 15px 25px rgb(0 0 0 / 80%);
    }

    .local-media-wrapper {
        display: flex;
        flex-direction: column;
    }

    .room-form {
        padding: 40px;
        width: 30%;
        background-color: #0f0e17;
        border-radius: 10px;
        box-shadow: 0 15px 25px rgb(0 0 0 / 80%);
    }

    .call-action-div {
        bottom: 100px;
        position: relative;
    }
    
    input {
        width: 100%;
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