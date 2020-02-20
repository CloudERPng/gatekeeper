<template>
  <v-data-table
    :headers="headers"
    :items="users"
    sort-by="calories"
    class="elevation-1"
    :search="search"
    :loading="loading"
    loading-text="Loading..."
    @click:row="goToUser"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Users</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          dark class="mb-2"
          @click="$router.push({ name: 'new-user' })">
          New User
        </v-btn>
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
  </v-data-table>
</template>

<script>
import Axios from 'axios';

export default {
  name: 'UserList',
  data: () => ({
    defaultItem: {
      id: '',
      customer: '',
      email: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      alias_username: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      alias_password: '',
      role: '',
      active: 'No',
      admin: 'No',
    },
    headers: [
      { text: 'ID', value: 'id' },
      {
        text: 'Customer',
        align: 'left',
        sortable: true,
        value: 'customer',
      },
      { text: 'Email', value: 'email' },
      { text: 'Alias Username', value: 'alias_username' },
      { text: 'Alias Password', value: 'alias_password' },
      { text: 'Role', value: 'role' },
      { text: 'Active', value: 'active', sortable: false },
      { text: 'Staff', value: 'admin' },
    ],
    loading: false,
    search: '',
    snackbar: '',
    snackMessage: '',
    users: [],
  }),

  created() {
    this.initialize();
  },

  methods: {
    goToUser(e) {
      this.$router.push(
        {
          name: 'user-detail',
          params: {
            id: e.id,
          },
          query: {
            relations: ['customer'],
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
        const response = await Axios.get('http://phrase.website/users');
        const { data } = response;
        this.users = data.map((item) => ({
          id: item.id,
          customer: item.customer ? item.customer.name : '',
          email: item.email,
          // eslint-disable-next-line @typescript-eslint/camelcase
          alias_username: item.alias ? item.alias.alias_username : '',
          // eslint-disable-next-line @typescript-eslint/camelcase
          alias_password: item.alias ? item.alias.alias_password : '',
          role: item.role || '',
          active: item.active ? 'Yes' : 'No',
          admin: item.is_superuser ? 'Yes' : 'No',
        }));
        this.loading = false;
      } catch (err) {
        this.snackMessage = 'Could not fetch data to initialise the page.';
        this.snackbar = true;
      }
    },
  },
};
</script>
