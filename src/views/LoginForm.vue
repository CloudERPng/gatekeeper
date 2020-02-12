<template>
  <v-app>
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title class="pb-0">
        <h1>Login</h1>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Username" prepend-icon="mdi-account-circle" v-model="username" />
          <v-text-field
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            v-model="password"
          />
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="info" @click="login">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';

export default Vue.extend({
  name: 'LoginForm',

  data: () => ({
    showPassword: false,
    username: '',
    password: '',
  }),

  methods: {
    async login() {
      try {
        const response = await Axios.post('http://127.0.0.1:3000/login', {
          username: this.username,
          password: this.password,
        });

        if (response.status === 200) {
          this.$router.push({ name: 'Home' });
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
});
</script>
