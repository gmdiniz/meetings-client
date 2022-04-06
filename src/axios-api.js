import axios from 'axios'

const getAPI = axios.create({
    baseURL: 'https://meetings-restapi.herokuapp.com',
    timeout: 1000,
})

export { getAPI }