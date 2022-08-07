import Vue from "vue";
import Vuex from "vuex";
import { getAPI } from "../axios-api";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null, 
    userLogin: localStorage.getItem('userLogin') || null, 
    APIData: ''
  },
  mutations: {
    updateStorage (state, { access, refresh, userLogin }) {
      state.accessToken = access,
      state.refreshToken = refresh
      state.userLogin = userLogin
    },
    destroyToken (state) {
      state.accessToken = null
      state.refreshToken = null
      state.userLogin = null
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userLogin');
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
          localStorage.setItem('userLogin', userCredentials.username);
          context.commit('updateStorage', { 
                          access: response.data.access, 
                          refresh: response.data.refresh,
                          userLogin: userCredentials.username
                        })
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
                                        refresh: localStorage.getItem('refreshToken'),
                                        userLogin: localStorage.getItem('userLogin')
                                      });
    }
  },
  modules: {

  }
});
