<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Termini treninga</div>
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
          <q-btn color="primary" label="Rezerviraj" @click="rezerviraj(t)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { Notify } from "quasar";

export default {
  data() {
    return { termini: [] };
  },
  async mounted() {
    try {
      const res = await axios.get("http://localhost:3000/termini");
      this.termini = res.data;
    } catch (err) {
      console.log("Greška pri dohvaćanju termina", err);
    }
  },
  methods: {
    formatDatum(datum) {
      return datum.substring(0, 10);
    },
    async rezerviraj(t) {
      const auth = useAuth();
      const korisnik_id = auth.state.user?.korisnik_id;
      try {
        await axios.post("http://localhost:3000/rezervacije", {
          korisnik_id,
          termin_id: t.termin_id,
        });
        Notify.create({ type: "positive", message: "Rezervacija uspješna!" });
      } catch (err) {
        Notify.create({ type: "negative", message: err.response?.data?.message || "Greška" });
      }
    },
  },
};
</script>