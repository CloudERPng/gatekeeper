<template>
  <v-app id="inspire">
    <v-content>
      <v-container
        class="fill-height"
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            sm="8"
            md="4"
          >
            <v-snackbar
              top
              v-model="snackbar"
            >
              {{ snackMessage }}
              <v-btn
                color="pink"
                text
                @click="snackbar = false"
              >
                Close
              </v-btn>
            </v-snackbar>
            <v-card class="elevation-12">
              <v-toolbar
                color="primary"
                dark
                flat
              >
                <v-toolbar-title>Login</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field
                    label="Login"
                    name="login"
                    prepend-icon="person"
                    type="text"
                    v-model="username"
                  />

                  <v-text-field
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="lock"
                    type="password"
                    v-model="password"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="login">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';
import serverUrl from '../main';

export default Vue.extend({
  name: 'LoginForm',

  data: () => ({
    password: '',
    showPassword: false,
    snackbar: false,
    snackMessage: 'Authentication failed. Please try again.',
    username: '',
  }),

  methods: {
    async login() {
      try {
        const response = await Axios.post(`${serverUrl}/login`, {
          username: this.username,
          password: this.password,
        });

        const { token } = response.data;
        if (token) {
          sessionStorage.setItem('token', token);
          this.$router.push({ name: 'Home' });
        } else {
          this.snackbar = true;
        }
      } catch (err) {
        this.snackbar = true;
      }
    },
  },
});
</script>
