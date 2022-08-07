<template>
    <div>
        <main class="box">
            <h2>LOGIN</h2>
            <form v-on:submit.prevent="login">
                <div class="input-box">
                    <label for="userName">USERNAME</label>
                    <input type="text" 
                           name="userName" 
                           autocomplete="off"   
                           id="userName" 
                           v-model="username" 
                           placeholder="insira seu username" 
                           required/>
                </div>
                
                <div class="input-box">
                    <label for="userPassword">SENHA</label>
                    <input type="password" 
                           name="userPassword" 
                           autocomplete="off"
                           id="userPassword" 
                           v-model="password" 
                           placeholder="insira sua senha"
                           required/>
                </div>

                <p v-if="incorrectAuth" class="incorrenct-creds">Nome de login ou senha incorretos, por favor tente novamente</p>

                <div class="buttons-wrapper">
                    <button class="action-button" type="submit" style="float: left">Enviar</button>
                    <button class="action-button" style="float: left;" v-on:click="registerRoute()">Cadastrar</button>
                </div>

            </form>
        </main>
        <footer>
        </footer>
    </div>
</template>

<script>
    export default {
        name: "LoginForm",
        data: function () {
            return {
                username: '',
                password: '',
                incorrectAuth: false,
                registerRoute() {
                    this.$router.push({ name: 'register' });
                } 
            };
        },
        methods: {
            login () {
                this.$store.dispatch('userLogin', {
                    username: this.username,
                    password: this.password
                })
                .then(() => {
                    this.$router.push({ name: 'meetings' })
                })
                .catch(err => {
                    console.log(err)
                    this.incorrectAuth = true
                })
            }
        }
    }
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    body {
        font-family: sans-serif;
        height: 100vh;
        margin: 0;
        padding: 0;
    }

    header {
        display: none;  
    }

    .incorrenct-creds {
        color: #aa5050;
        font-weight: 600;
    }

    .box {
        background-color: #0f0e17;
        border-radius: 10px;
        box-shadow: 0 15px 25px rgb(0 0 0 / 80%);
        margin: auto auto;
        padding: 40px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: left;
        width: 25%;
        height: 40%;
    }

    input {
        width: 100%;
    }

    .box h2 {
        margin: 0 0 42px 0;
        padding: 0;
        color: #fff;
        text-align: center;
    }

    .buttons-wrapper {
        margin: 42px 0;
    }

    .input-box label {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
    }

    .action-button:hover {
        opacity: 0.8;
    }
</style>