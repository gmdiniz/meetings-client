<template>
    <div class="meetings">
        <div>
            <h1>Lista de reuniões</h1>
            <div v-for="meeting in meetingsList" :key="meeting.id">
                <a href="">{{ meeting.title }}</a>
            </div>
        </div>
        <div>
            <video id="localVideo" autoplay playsinline controls="false"/>
        </div>
    </div>    
</template>

<script>
    import { getAPI } from '../axios-api'
    import { mapState } from 'vuex'

    export default {
        name: "Meetings",
        onIdle () {
            this.$store.dispatch('userLogout')
            .then(() => {
                this.$router.push({ name: 'login' })
            })
        },
        data: function () {
            return {
                meetingsList: [],
                getUserMedia: function () {
                    const constraints = {
                        'video': true,
                        'audio': true
                    }
                    navigator.mediaDevices.getUserMedia(constraints)
                    .then(stream => {
                        console.log('Got MediaStream:', stream);
                    })
                    .catch(error => {
                        console.error('Error accessing media devices.', error);
                    });
                },
                playVideo: async function playVideoFromCamera() {
                    try {
                        const constraints = {'video': true, 'audio': true};
                        const stream = await navigator.mediaDevices.getUserMedia(constraints);
                        const videoElement = document.querySelector('video#localVideo');
                        videoElement.srcObject = stream;
                    } catch(error) {
                        console.error('Error opening video camera.', error);
                    }
                }
            };
        },
        computed: mapState(['APIData']), 
        created: function () {
            getAPI.get('/videoconf/list_meetings', { headers: { Authorization: `Bearer ${this.$store.state.accessToken}` } })
            .then( response => {
                this.$store.state.APIData = response.data
                this.meetingsList = response.data
            })
            .catch( error => {
                console.log(error)
            })

            this.getUserMedia()
            this.playVideo()
        }
    };
</script>

<style scoped>
    .meetings {
        width: 99vw;
        height: 96vh;       
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
        justify-content: space-evenly;
    }

    #localVideo {
        border-radius: 100px;
    }
</style>