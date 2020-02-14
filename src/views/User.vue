<template>
  <v-card min-width="900" height="100%" min-height="500">
    <v-card-title>User</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row align="center" justify="center">
          <v-col cols="8">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-select
                v-model="customer"
                :items="customers"
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
</template>

<script lang="ts">
import Vue from 'vue';

const MAX_EMAIL_LENGTH = 64;

export default Vue.extend({
  name: 'User',
  data: () => ({
    customer: '',
    customers: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
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
    snackbar: '',
    role: 'API User',
  }),

  methods: {},
});
</script>
