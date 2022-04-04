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
    export default {
        name: "Meeting",
        data: function () {
            return {
                meetingsList: []
            };
        },
        created: function () {
            getAPI.get('/videoconf/list_meetings',)
            .then( response => {
                console.log(response.data)
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