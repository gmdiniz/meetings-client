<template>
  <div class="login">
    <LoginForm /> 
  </div>
</template>

<script>
  import LoginForm from "@/components/LoginComponent.vue";

  export default {
    name: "Login",
    components: {
      LoginForm,
    }
  };
</script>

<style scoped>
  html {
      width: 100vw;
      height: 100vh;
      background: #a7a9be;
  }
</style>