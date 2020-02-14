<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item-group v-model="active">
          <v-list-item link @click="active=0" :to="{ name: 'user-list' }">
            <v-list-item-action>
              <v-icon>mdi-contact-mail</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Users</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="1">
            <v-list-item-action>
              <v-icon>mdi-contact-mail</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Tokens</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-content class="pa-2">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col class="text-center">
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
import Axios from 'axios';

export default {
  props: {
    source: String,
  },

  created() {
    if (!sessionStorage.getItem('token')) {
      this.$router.push({ name: 'login' });
    } else {
      Axios.defaults.headers = {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      };
      // ping server
    }
  },

  data: () => ({
    active: 0,
    drawer: null,
  }),
};
</script>
