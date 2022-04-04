<template>
    <div class="meetings">
        <h1>Lista de reuniões</h1>
        <div v-for="meeting in meetingsList" :key="meeting.id">
            <a href="">{{ meeting.title }}</a>
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
                meetingsList: []
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
        }
    };
</script>

<style scoped>

</style>