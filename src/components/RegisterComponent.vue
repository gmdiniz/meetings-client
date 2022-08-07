<template>
    <div>
        <main class="box">
            <h2>CADASTRO</h2>
            <form>
                <div class="input-box">
                    <label for="userName">USERNAME</label>
                    <input type="text" name="userName" id="userName" placeholder="insira seu username" required/>
                </div>

                <div class="input-box">
                    <label for="userPassword">SENHA</label>
                    <input type="password" name="userPassword" id="userPassword" placeholder="insira sua senha"
                    required/>
                </div>

                <div class="input-box">
                    <label for="userConfirmPassword">CONFIRME SUA SENHA</label>
                    <input type="password" name="userPassword" id="userConfirmPassword"
                    placeholder="insira sua senha novamente"
                    required/>
                </div>

                <div class="buttons-wrapper">
                    <button class="action-button" type="submit" style="float: left">CADASTRAR</button>
                    <button class="action-button" style="float: left;" v-on:click="loginRout()">LOGIN</button>
                </div>
                    
            </form>
        </main>
        <footer>
        </footer>
    </div>
</template>

<script>
export default {
    name: "RegisterForm",
    data: function () {
        return {
            loginRout() {
                this.$router.push({ name: 'login' });
            }
        };
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
        height: 50%;
    }

    input {
        width: 100%;
    }

    .box h2 {
        margin: 0 0 30px 0;
        padding: 0;
        color: #fff;
        text-align: center;
    }

    .input-box label {
        color: #fff;
    }

    .buttons-wrapper {
        margin: 30px 0;
    }

    .action-button:hover {
        opacity: 0.8;
    }
</style>