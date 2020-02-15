<template>
  <div>
    <v-card min-width="900" height="100%" min-height="500">
      <v-card-title>User</v-card-title>
      <v-card-text>
        <div>
          <v-alert
            dismissible elevation="1"
            :type="alert.type"
            :value="Boolean(alert.text)">
            {{ alert.text }}
          </v-alert>
        </div>
        <v-container fluid>
          <v-row align="center" justify="center">
            <v-col cols="8">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-select
                  v-model="customer"
                  :items="customers"
                  item-text="name"
                  item-value="id"
                  :rules="[v => !!v || 'Item is required']"
                  label="Customer"
                  required
                ></v-select>

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail" required>
                </v-text-field>

                <v-text-field
                  v-model="password"
                  label="Password" required>
                </v-text-field>

                <v-text-field
                  disabled
                  v-model="role"
                  label="Role" required>
                </v-text-field>

                <v-checkbox
                  v-model="is_superuser"
                  label="Is an admin user">
                </v-checkbox>

                <v-btn :disabled="!valid" color="success" class="mr-4">Save</v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';

const MAX_EMAIL_LENGTH = 64;

export default Vue.extend({
  name: 'User',

  async created() {
    Axios.defaults.headers = {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    };

    // load customers
    try {
      const r = await Axios.get('http://127.0.0.1:3000/customers');
      const { data } = r;
      this.customers = data;
    } catch (err) {
      this.alert.text = `${err.message}. Please reload the page`;
      this.alert.type = 'error';
      this.valid = false;
    }

    // load the user data if available
    const { id } = this.$route.params;
    if (id) {
      try {
        const r = await Axios.get(`http://127.0.0.1:3000/users/${id}`, { params: this.$route.query });
        const { data } = r;
        this.customer = data.customer ? data.customer.id : '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.role = data.role || this.role;
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.is_superuser = data.is_superuser || false;
      } catch (err) {
        this.alert.text = `${err.message}. Please reload the page`;
        this.alert.type = 'error';
        this.valid = false;
      }
    }
  },

  data: () => ({
    customer: '',
    customers: [{
      name: '',
      id: '',
      disabled: false,
    }],
    alert: {
      text: '',
      type: 'info',
    },
    // eslint-disable-next-line @typescript-eslint/camelcase
    is_superuser: false,
    valid: true,
    name: '',
    maxEmailLength: MAX_EMAIL_LENGTH,
    nameRules: [
      (v: string) => !!v || 'Name is required',
      (v: string) => (v && v.length <= MAX_EMAIL_LENGTH) || 'Name must be less than 10 characters',
    ],
    email: '',
    emailRules: [
      (v: string) => !!v || 'E-mail is required',
      (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
    password: '',
    select: null,
    checkbox: false,
    role: 'API User',
  }),

  computed: {
    customerList() {
      return this.customers.filter((item) => item.disabled === false);
    },
  },

  methods: {},
});
</script>
