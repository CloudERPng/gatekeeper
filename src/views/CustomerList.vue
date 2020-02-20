<template>
  <v-data-table
    :headers="headers"
    :items="customers"
    sort-by="calories"
    class="elevation-1"
    :search="search"
    :loading="loading"
    loading-text="Loading..."
    @click:row="goToCustomer"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Customers</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          dark class="mb-2"
          @click="$router.push({ name: 'new-customer' })">
          New Customer
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
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import Axios from 'axios';

export default {
  name: 'CustomerList',
  data: () => ({
    customers: [],
    defaultItem: {
      id: '',
      name: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      erpnext_address: '',
      disabled: false,
    },
    headers: [
      { text: 'ID', value: 'id' },
      {
        text: 'Name',
        align: 'left',
        sortable: true,
        value: 'name',
      },
      { text: 'Instance URL', value: 'erpnextAddress' },
      { text: 'API Key', value: 'apiKey' },
      { text: 'Secret Key', value: 'secretKey' },
      { text: 'Disabled', value: 'disabled' },
    ],
    loading: false,
    search: '',
  }),

  created() {
    this.initialize();
  },

  methods: {
    goToCustomer(e) {
      this.$router.push(
        {
          name: 'customer-detail',
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
        const response = await Axios.get('http://46.101.158.103/customers');
        const { data } = response;
        this.customers = data.map((item) => ({
          id: item.id,
          name: item.name || '',
          erpnextAddress: item.erpnext_address || '',
          disabled: item.disabled ? 'No' : 'Yes',
          apiKey: item.api_key || '',
          secretKey: item.secret_key,
        }));
        this.loading = false;
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>
