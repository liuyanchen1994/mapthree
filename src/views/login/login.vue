<template>
  <div class="login">
    <div class="box-login">
      <div class="box-list">
        <div class="box-group">
          <div class="group-list group-title">登录</div>
          <div class="group-list group-user">
            <div class="group-left"><img src="@/../public/image/login/user.png" alt="用户名"></div>
            <div class="group-right">
              <Input class="login-input" v-model="temp.user" />
            </div>
          </div>
          <div class="group-list group-pwd">
            <div class="group-left"><img src="@/../public/image/login/pwd.png" alt="密码"></div>
            <div class="group-right">
              <Input class="login-input" v-model="temp.pwd" type="password" />
            </div>
          </div>
          <div class="group-list group-rpwd">
            <div class="group-left"></div>
            <div class="group-right">
              <Checkbox v-model="temp.rpwd">记住密码</Checkbox>
            </div>
          </div>
          <div class="group-login" @click="handleLogin">登录 </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data () {
    return {
      temp: {
        user: "",
        pwd: "",
        rpwd: false
      },
    }
  },
  mounted () { },
  methods: {
    handleLogin () {
      sessionStorage.setItem("user", this.temp.user);
      this.$router.push({ name: 'home' });
    }
  },
}
</script>