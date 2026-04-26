<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 400px" class="q-pa-md">
      <q-card-section>
        <div class="text-h5 text-center">Register</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="Username" outlined />
        <q-input v-model="ime" label="Ime" outlined />
        <q-input v-model="prezime" label="Prezime" outlined />
        <q-input v-model="email" label="Email" outlined />
        <q-input v-model="lozinka" label="Lozinka" type="password" outlined />
      </q-card-section>

      <q-card-actions>
        <q-btn
          label="Register"
          color="primary"
          class="full-width"
          @click="register"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";

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

        alert("Registracija uspješna");
        this.$router.push("/login");
      } catch (err) {
        alert("Greška");
      }
    },
  },
};
</script>
