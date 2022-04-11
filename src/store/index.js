import Vue from "vue";
import Vuex from "vuex";
import { getAPI } from "../axios-api";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null, 
    APIData: ''
  },
  mutations: {
    updateStorage (state, { access, refresh }) {
      state.accessToken = access,
      state.refreshToken = refresh
    },
    destroyToken (state) {
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  getters: {
    loggedIn (state) {
      return !!state.accessToken
    }
  },
  actions: {
    userLogout (context) {
      if (context.getters.loggedIn) {
        context.commit('destroyToken')
      } 
    },
    userLogin (context, userCredentials) {
      return new Promise((resolve, reject) => {
        getAPI.post('/api-token/', {
          username: userCredentials.username,
          password: userCredentials.password
        }) 
        .then( response => {
          localStorage.setItem('accessToken', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          context.commit('updateStorage', { 
                          access: response.data.access, 
                          refresh: response.data.refresh})
          resolve()
        })
        .catch( err => {
          console.log(err)
          reject()
        })
      })
    },
    fetchAccessToken(context) {
      context.commit('updateStorage', { access: localStorage.getItem('accessToken'),
                                        refresh: localStorage.getItem('refreshToken')});
    }
  },
  modules: {

  }
});
