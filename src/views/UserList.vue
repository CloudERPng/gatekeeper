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
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">New User</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.name" label="Dessert name"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.calories" label="Calories"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.fat" label="Fat (g)"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.carbs" label="Carbs (g)"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.protein" label="Protein (g)"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
      <v-icon small @click="deleteItem(item)">delete</v-icon>
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
    dialog: false,
    editedIndex: -1,
    editedItem: {
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
      { text: 'Is Administrator', value: 'admin' },
    ],
    loading: false,
    search: '',
    users: [],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New User' : 'Edit User';
    },
  },

  watch: {
    dialog(val) {
      // eslint-disable-next-line no-unused-expressions
      val || this.close();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    goToUser(e) {
      console.log(e);
    },
    async initialize() {
      try {
        Axios.defaults.headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };
        this.loading = true;
        const response = await Axios.get('http://127.0.0.1:3000/users');
        const { data } = response;
        this.users = data.map((item) => ({
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
        console.log(err);
      }
    },

    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = { ...item };
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.users.indexOf(item);
      this.users.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = { ...this.defaultItem };
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.users[this.editedIndex], this.editedItem);
      } else {
        this.users.push(this.editedItem);
      }
      this.close();
    },
  },
};
</script>
