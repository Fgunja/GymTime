<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Termini treninga</div>

    <!-- FORMA ZA ADMINA -->
    <q-card v-if="isAdmin" class="q-mb-lg q-pa-md">
      <div class="text-h6 q-mb-md">Dodaj novi termin</div>
      <q-input v-model="novi.datum" label="Datum" type="date" outlined class="q-mb-sm" />
      <q-input v-model="novi.vrijeme" label="Vrijeme" type="time" outlined class="q-mb-sm"  />
      <q-input v-model="novi.vrsta_treninga" label="Vrsta treninga" outlined class="q-mb-sm" />
      <q-input v-model="novi.opis" label="Opis" outlined class="q-mb-sm" />
      <q-input v-model="novi.trajanje" label="Trajanje (min)" type="number" outlined class="q-mb-sm" />
      <q-input v-model="novi.max_kapacitet" label="Max kapacitet" type="number" outlined class="q-mb-md" />
      <q-btn color="primary" label="Dodaj termin" @click="dodajTermin" />
    </q-card>

    <!-- LISTA TERMINA -->
    <q-list bordered separator>
      <q-item v-for="t in termini" :key="t.termin_id">
        <q-item-section>
          <q-item-label>{{ t.vrsta_treninga }}</q-item-label>
          <q-item-label caption>
            {{ formatDatum(t.datum) }} u {{ t.vrijeme }} · {{ t.trajanje }} min · max {{ t.max_kapacitet }} osoba
          </q-item-label>
          <q-item-label caption>{{ t.opis }}</q-item-label>
        </q-item-section>
        <q-item-section side>
  <div class="row q-gutter-sm">
    <q-btn flat color="secondary" label="Detalji" @click="$router.push('/app/termini/' + t.termin_id)" />
    <q-btn v-if="!isAdmin" color="primary" label="Rezerviraj" @click="rezerviraj(t)" />
  </div>
</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();
    return { $q };
  },
  data() {
    return {
      termini: [],
      novi: {
        datum: "",
        vrijeme: "",
        vrsta_treninga: "",
        opis: "",
        trajanje: null,
        max_kapacitet: null,
      },
    };
  },
  computed: {
    isAdmin() {
      const auth = useAuth();
      return auth.state.user?.uloga === "admin";
    },
  },
  async mounted() {
    await this.fetchTermini();
  },
  methods: {
    formatDatum(datum) {
      return datum.substring(0, 10);
    },
    async fetchTermini() {
      try {
        const res = await axios.get("http://localhost:3000/termini");
        this.termini = res.data;
      } catch (err) {
        console.log("Greška pri dohvaćanju termina", err);
      }
    },
    async rezerviraj(t) {
      const auth = useAuth();
      const korisnik_id = auth.state.user?.korisnik_id;
      try {
        await axios.post("http://localhost:3000/rezervacije", {
          korisnik_id,
          termin_id: t.termin_id,
        });
        this.$q.notify({ type: "positive", message: "Rezervacija uspješna!" });
      } catch (err) {
        this.$q.notify({ type: "negative", message: err.response?.data?.message || "Greška" });
      }
    },
    async dodajTermin() {
      const auth = useAuth();
      const korisnik_id = auth.state.user?.korisnik_id;
      try {
        await axios.post("http://localhost:3000/termini", {
          ...this.novi,
          korisnik_id,
        });
        this.$q.notify({ type: "positive", message: "Termin dodan!" });
        this.novi = { datum: "", vrijeme: "", vrsta_treninga: "", opis: "", trajanje: null, max_kapacitet: null };
        await this.fetchTermini();
      } catch (err) {
        this.$q.notify({ type: "negative", message: "Greška pri dodavanju termina" });
      }
    },
  },
};
</script>