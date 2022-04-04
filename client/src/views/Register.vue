<template>
  <div class="register">
    <RegisterForm /> 
  </div>
</template>

<script>
  import RegisterForm from "@/components/RegisterComponent.vue";

  export default {
    name: "Login",
    components: {
      RegisterForm,
    }
  };
</script>

<style scoped>

</style>