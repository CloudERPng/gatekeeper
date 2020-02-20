<template>
  <v-data-table
    :expanded.sync="expanded"
    :headers="headers"
    :items="tokens"
    item-key="id"
    sort-by="calories"
    class="elevation-1"
    :search="search"
    show-expand
    :single-expand="singleExpand"
    :loading="loading"
    loading-text="Loading..."

  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Tokens</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card elevation="0">
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line hide-details>
          </v-text-field>
        </v-card-title>
      </v-card>
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
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length" class="wrap">
        <div>
          <div>{{ item.token }}, {{ item.valid }}</div>
          <div v-if="item.valid === 'Yes'" class="ma-2 text-center">
            <v-btn color="error" @click="invalidate(item)">Invalidate</v-btn>
          </div>
        </div>
        </td>
    </template>
  </v-data-table>
</template>

<script>
import Axios from 'axios';

export default {
  name: 'TokenList',

  data: () => ({
    expanded: [],
    tokens: [],
    defaultItem: {
      id: '',
      domain: '',
      valid: false,
      date: '',
      user: '',
    },
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Domain', value: 'domain' },
      { text: 'User', value: 'user' },
      { text: 'Valid', value: 'valid' },
      { text: 'Created on', value: 'date' },
    ],
    loading: false,
    search: '',
    singleExpand: false,
    snackbar: '',
    snackMessage: '',
    user: '',
  }),

  created() {
    this.initialize();
  },

  methods: {
    goToToken(e) {
      this.$router.push(
        {
          name: 'token-detail',
          params: {
            id: e.id,
          },
        },
      );
    },
    async initialize() {
      try {
        Axios.defaults.headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };
        this.loading = true;
        const response = await Axios.get('http://46.101.158.103/tokens', { params: { all: 1 } });
        const { data } = response;
        this.tokens = data.map((item) => ({
          id: item.id,
          token: item.token || '',
          domain: item.domain || '',
          valid: item.is_valid ? 'Yes' : 'No',
          date: item.date_created,
          user: item.user.email,
        }));
        this.loading = false;
      } catch (err) {
        this.snackMessage = 'Could not fetch data to initialise this page.';
        this.snackbar = true;
      }
    },

    async invalidate(item) {
      Axios.defaults.headers = {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      };
      this.loading = true;
      try {
        await Axios.post('http://46.101.158.103/tokens/invalidate', { id: item.id });
        // if an error is not thrown, we can safely assume that the `is_valid` property
        // is now false. No need for a round trip
        const token = this.tokens.find((_token) => _token.id === item.id);
        token.valid = 'No';
      } catch (err) {
        this.snackMessage = 'There was a problem. The token was not invalidated.';
        this.snackbar = true;
        this.loading = false;
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.wrap {
  word-break: break-all;
}
</style>
