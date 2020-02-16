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
              <v-form ref="form" v-model="valid">
                <v-select
                  v-model="customer"
                  :items="customers"
                  item-text="name"
                  item-value="id"
                  :rules="customerRules"
                  label="Customer"
                  required
                ></v-select>

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail" required>
                </v-text-field>

                <v-text-field
                  v-show="is_superuser"
                  v-model="password"
                  :rules="passwordRules"
                  label="Password"
                  type="password"
                  :required="Boolean(is_superuser)">
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

                <v-btn
                  class="mr-4"
                  color="success"
                  :disabled="!valid"
                  @click.stop="dialog = true"
                >
                  Save
                </v-btn>

                <div class="text-center">
                  <v-dialog
                    v-model="dialog"
                    persistent
                    width="500"
                  >

                    <v-card>
                      <v-card-title
                        class="headline grey lighten-2"
                      >
                        Confirmation required
                      </v-card-title>

                      <v-card-text>
                        Are you sure you want to save this record?
                      </v-card-text>

                      <v-divider></v-divider>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          text
                          @click="dialog = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="green darken-1"
                          text
                          @click="save"
                        >
                          Save
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </div>
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

    if (this.is_superuser) {
      this.passwordRules = [
        (v: string) => !!v || 'Password is required',
      ];
    } else {
      this.passwordRules = [];
    }

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
        this.password = '';
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

  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.$refs.form as any).validate();
  },

  data: () => ({
    alert: {
      text: '',
      type: 'info',
    },
    customer: '',
    customerRules: [
      (v: string) => !!v || 'Select a customer from the drop down',
    ],
    customers: [{
      name: '',
      id: '',
      disabled: false,
    }],
    dialog: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    is_superuser: false,
    valid: false,
    maxEmailLength: MAX_EMAIL_LENGTH,
    email: '',
    emailRules: [
      (v: string) => !!v || 'E-mail is required',
      (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
    password: '',
    passwordRules: [] as Function[],
    checkbox: false,
    role: 'API User',
  }),

  computed: {
    customerList() {
      return this.customers.filter((item) => item.disabled === false);
    },
    payload() {
      const payload = {
        email: this.email,
        password: this.is_superuser ? this.password : '',
        // eslint-disable-next-line @typescript-eslint/camelcase
        is_superuser: this.is_superuser,
        customerId: this.customer,
      };
      return payload;
    },
  },

  methods: {
    async save() {
      try {
        const r = this.$route.params.id ? await Axios.put(`http://127.0.0.1:3000/users/${this.$route.params.id}`, this.payload) : await Axios.post('http://127.0.0.1:3000/users', this.payload);
        const { data } = r;
        this.dialog = false;
        if (Object.keys(data).length) {
          this.$router.push({ name: 'user-list' });
        }
      } catch (err) {
        console.log(err);
      }
    },
  },

  watch: {
    // eslint-disable-next-line @typescript-eslint/camelcase
    is_superuser(val) {
      if (val) {
        this.passwordRules = [
          (v: string) => !!v || 'Password is required',
        ];
      } else {
        this.passwordRules = [];
      }
    },
  },
});
</script>
