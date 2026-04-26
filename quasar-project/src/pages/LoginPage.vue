<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 350px" class="q-pa-md">
      <q-card-section>
        <div class="text-h6 text-center text-primary">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="Username" outlined class="q-mb-md" />
        <q-input v-model="lozinka" label="Lozinka" type="password" outlined />
      </q-card-section>

      <q-card-actions>
        <q-btn
          label="Login"
          color="primary"
          class="full-width"
          @click="login"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { Notify } from "quasar";

export default {
  data() {
    return {
      username: "",
      lozinka: "",
    };
  },

  methods: {
    async login() {
      const auth = useAuth();

      try {
        const res = await axios.post("http://localhost:3000/login", {
          username: this.username,
          lozinka: this.lozinka,
        });

        const user = res.data.user;

        auth.setUser(user);

        // 🔥 SVI IDU NA /app
        this.$router.replace("/app");

        Notify.create({
          type: "positive",
          message: `Dobrodošao ${user.username}`,
        });
      } catch (err) {
        Notify.create({
          type: "negative",
          message: "Krivi podaci",
        });
      }
    },
  },
};
</script>
