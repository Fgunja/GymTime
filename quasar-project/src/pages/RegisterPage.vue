<template>
  <q-page class="flex flex-center" style="background-color: #121212;">
    <q-card style="width: 400px; background-color: #1e1e1e;" class="q-pa-md">
      <q-card-section>
        <div class="text-h5 text-center text-primary">Registracija</div>
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <q-input v-model="username" label="Username" outlined dark label-color="grey-4" />
        <q-input v-model="ime" label="Ime" outlined dark label-color="grey-4" />
        <q-input v-model="prezime" label="Prezime" outlined dark label-color="grey-4" />
        <q-input v-model="email" label="Email" outlined dark label-color="grey-4" />
        <q-input v-model="lozinka" label="Lozinka" type="password" outlined dark label-color="grey-4" />
      </q-card-section>

      <q-card-actions>
        <q-btn label="Registriraj se" color="primary" class="full-width" @click="register" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
import { Notify } from "quasar";

export default {
  data() {
    return {
      username: "",
      ime: "",
      prezime: "",
      email: "",
      lozinka: "",
    };
  },
  methods: {
    async register() {
      try {
        await axios.post("http://localhost:3000/register", {
          username: this.username,
          ime: this.ime,
          prezime: this.prezime,
          email: this.email,
          lozinka: this.lozinka,
        });
        Notify.create({ type: "positive", message: "Registracija uspješna!" });
        this.$router.push("/login");
      } catch (err) {
        Notify.create({ type: "negative", message: "Greška pri registraciji" });
      }
    },
  },
};
</script>