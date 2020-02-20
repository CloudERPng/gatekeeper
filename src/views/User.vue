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
          <v-row>
            <v-col cols="6">
              <v-form ref="form" v-model="valid">
                <v-select
                  v-model="customer"
                  :items="customers"
                  item-text="name"
                  item-value="id"
                  :rules="customerRules"
                  label="Customer"
                  required
                  @change="dirty=true"
                ></v-select>

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail" required
                  @change="dirty=true">
                </v-text-field>

                <v-text-field
                  v-show="is_superuser"
                  v-model="password"
                  :rules="passwordRules"
                  label="Password"
                  type="password"
                  :required="Boolean(is_superuser)"
                  @change="dirty=true">
                </v-text-field>

                <v-text-field
                  disabled
                  v-model="role"
                  label="Role" required
                  @change="dirty=true">
                </v-text-field>

                <v-checkbox
                  v-model="is_superuser"
                  label="Is an admin user"
                  @change="dirty=true">
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

                  <v-dialog
                    v-model="cancelDialog"
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
                        This cannot be undone. Are you sure you want to delete this record?
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
                          color="error"
                          text
                          @click="deleteItem"
                        >
                          Yes, delete it
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </div>
              </v-form>
            </v-col>
            <v-col cols="6">
              <v-btn
                v-if="$route.name === 'user-detail' && !dirty"
                block
                class="mb-4"
                color="error"
                @click="cancelDialog = true"
              >
                Delete this record
              </v-btn>
              <v-card>
                <v-card class="mb-3">
                  <v-card-title>Aliases</v-card-title>
                  <v-card-text>
                    <v-list disabled>
                      <v-list-item-group>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>Username</v-list-item-title>
                            <v-list-item-subtitle>{{ alias.alias_username }}</v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>Password</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ alias.alias_password }}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-card-text>
                </v-card>
                <v-card>
                  <v-card-title>
                    Tokens
                    <v-btn color="primary" small class="ma-2" @click="generateToken">
                      Generate Token
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <div class="pa-2" v-for="(item, i) in tokens" :key="i">
                      {{ item.token }}
                      <v-divider key="i" />
                    </div>
                  </v-card-text>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-btn
          v-if="$route.name === 'user-detail'"
          absolute
          dark
          fab
          top
          right
          color="pink"
          @click="reload"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-text>
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
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Axios from 'axios';
import { stringify } from 'qs';

interface Token {
  id: number;
  domain: string;
  token: string;
  is_valid: boolean;
}

const MAX_EMAIL_LENGTH = 64;

export default Vue.extend({
  name: 'User',

  async created() {
    // just for making our validator work properly
    if (this.is_superuser) {
      this.passwordRules = [
        (v: string) => !!v || 'Password is required',
      ];
    } else {
      this.passwordRules = [];
    }
    // ===========================================

    // load customers
    try {
      const r = await Axios.get('http://46.101.158.103/customers');
      const { data } = r;
      this.customers = data;
    } catch (err) {
      this.alert.text = `${err.message}. Please reload the page`;
      this.alert.type = 'error';
      this.valid = false;
    }

    // load the user data if available
    try {
      await this.loadPageData();
    } catch (err) {
      this.alert.text = `${err.message}. Please reload the page`;
      this.alert.type = 'error';
      this.valid = false;
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
    alias: {
      id: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      alias_username: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      alias_password: '',
    },
    cancelDialog: false,
    customer: '',
    customerRules: [
      (v: string) => !!v || 'Select a customer from the drop down',
    ],
    customers: [{
      name: '',
      id: '',
      disabled: false,
      // eslint-disable-next-line @typescript-eslint/camelcase
      erpnext_address: '',
    }],
    dialog: false,
    dirty: false,
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
    snackbar: false,
    snackMessage: '',
    tokens: [] as Token[],
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
    tokenPayload() {
      const customerObj = this.customers.find((item) => item.id === this.customer);
      if (customerObj && !this.dirty && this.$route.params.id) {
        return {
          domain: customerObj.erpnext_address,
          user: this.$route.params.id,
        };
      }
      return null;
    },
  },

  methods: {
    async deleteItem() {
      const { id } = this.$route.params;
      if (id) {
        try {
          this.deleteRecordAsync(Number(id));
        } catch (err) {
          const message = 'There was a problem. Please try again in a few moments or reload the page.';
          this.dirty = false;
          this.snackMessage = message;
          this.snackbar = true;
        }
      }
    },

    async deleteRecordAsync(id: number) {
      Axios.defaults.headers = {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      };
      await Axios.delete(`http://46.101.158.103/users/${id}`);
      this.$router.push({ name: 'user-list' });
    },

    async generateToken() {
      if (this.tokenPayload) {
        Axios.defaults.headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };
        const { data } = await Axios.post('http://46.101.158.103/tokens', this.tokenPayload);
        // we can't possible generate an invalidated token so we just push it straight
        // into the list
        this.tokens.push(data);
        this.snackMessage = 'Done';
        this.snackbar = true;
      }
    },

    async getAllUserInfo(id: number) {
      const r = await Axios.get(`http://46.101.158.103/users/${id}`, {
        params: {
          relations: ['customer', 'tokens', 'alias'],
        },
        paramsSerializer: (params) => stringify(params),
      });
      const { data } = r;
      const { tokens, alias } = data;
      this.tokens = tokens
        && tokens.length ? tokens.filter((token: Token) => Boolean(token.is_valid)) : [];
      this.alias = alias || this.alias;
      this.customer = data.customer ? data.customer.id : '';
      this.email = data.email || '';
      this.password = '';
      this.role = data.role || this.role;
      // eslint-disable-next-line @typescript-eslint/camelcase
      this.is_superuser = data.is_superuser || false;
    },

    async loadPageData() {
      Axios.defaults.headers = {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      };
      const { id } = this.$route.params;
      if (id) {
        this.getAllUserInfo(Number(id));
      }
    },

    async reload() {
      try {
        await this.loadPageData();
        this.snackMessage = 'Done.';
        this.snackbar = true;
      } catch (err) {
        this.alert.text = `${err.message}. Please reload the page`;
        this.alert.type = 'error';
        this.valid = false;
      }
    },

    async save() {
      try {
        const r = this.$route.params.id ? await Axios.put(`http://46.101.158.103/users/${this.$route.params.id}`, this.payload) : await Axios.post('http://46.101.158.103/users', this.payload);
        const { data } = r;
        this.dialog = false;
        if (Object.keys(data).length) {
          const message = this.payload.is_superuser ? 'Saved successfully' : 'Saved successfully. An ERPNext alias will be generated for admin staff';
          this.dirty = false;
          this.snackMessage = message;
          this.snackbar = true;
          if (this.$route.name === 'new-user') {
            this.$router.push({ name: 'user-detail', params: { id: data.user.id } });
          }
        }
      } catch (err) {
        this.snackMessage = 'Failed. Please try again or reload the page.';
        this.snackbar = true;
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
