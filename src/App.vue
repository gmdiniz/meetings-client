<template>
  <div id="app">
    <link rel="stylesheet" href="/path/to/reset-css/reset.css" />
    <router-view />
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "app",
  methods: {
    ...mapActions([
      'fetchAccessToken'
    ]),
  },
  created() {
    this.fetchAccessToken();
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

html {
  font-family: 'Roboto', sans-serif;
  width: 100vw;
  height: 100vh;
  background: #a7a9be;
} 

button {
  font-family: sans-serif;
  background: #ff8906;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  color: #fffffe;
  cursor: pointer;
  font-weight: 600;
  padding: 10px 20px;
  letter-spacing: 2px;
  outline: none;
  text-transform: uppercase;
  text-decoration: none;
  margin: 0 16px 16px 0;
  display: inline-block;
  height: 42px;
}

input {
  display: flex;
  flex-direction: column;
  background: transparent;
  border: none;
  border-bottom: 1px solid #fff;
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px;
  margin: 12px 0 30px 0;
  outline: none;
  padding: 10px 0;
}

</style>
