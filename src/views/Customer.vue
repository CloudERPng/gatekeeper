<template>
  <div>
    <v-card min-width="900" height="100%" min-height="500">
      <v-card-title>Customer</v-card-title>
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
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Name" required
                  @change="dirty=true">
                </v-text-field>

                <v-text-field
                  v-model="erpnextAddress"
                  :rules="erpnextAddressRules"
                  label="ERPNext URL"
                  required
                  @change="dirty=true">
                </v-text-field>

                <v-checkbox
                  v-model="disabled"
                  label="Disabled"
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
                          Yes, Save It
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

export default Vue.extend({
  name: 'Customer',

  async created() {
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
    cancelDialog: false,
    dialog: false,
    dirty: false,
    disabled: false,
    valid: false,
    name: '',
    nameRules: [
      (v: string) => !!v || 'Name is required',
    ],
    erpnextAddress: '',
    erpnextAddressRules: [
      (v: string) => !!v || 'The ERPNext instance URL is required',
    ],
    snackbar: false,
    snackMessage: '',
  }),

  computed: {
    payload() {
      const payload = {
        name: this.name,
        address: this.erpnextAddress,
        disabled: this.disabled,
      };
      return payload;
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
      await Axios.delete(`http://127.0.0.1:3000/customers/${id}`);
      this.$router.push({ name: 'customer-list' });
    },

    async getCustomerInfo(id: number) {
      const r = await Axios.get(`http://127.0.0.1:3000/customers/${id}`);
      const { data } = r;
      this.erpnextAddress = data.erpnext_address;
      this.name = data.name;
      this.disabled = data.disabled;
    },

    async loadPageData() {
      const { id } = this.$route.params;
      if (id) {
        Axios.defaults.headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };
        this.getCustomerInfo(Number(id));
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
        const r = this.$route.params.id ? await Axios.put(`http://127.0.0.1:3000/customers/${this.$route.params.id}`, this.payload) : await Axios.post('http://127.0.0.1:3000/customers', this.payload);
        const { data } = r;
        this.dialog = false;
        if (Object.keys(data).length) {
          const message = 'Saved successfully';
          this.dirty = false;
          this.snackMessage = message;
          this.snackbar = true;
          if (this.$route.name === 'new-customer') {
            this.$router.push({ name: 'customer-detail', params: { id: data.id } });
          }
        }
      } catch (err) {
        this.dialog = false;
        this.snackMessage = 'Failed. Please try again or reload the page.';
        this.snackbar = true;
      }
    },
  },
});
</script>
