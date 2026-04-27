<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Moje rezervacije</div>
    <q-list bordered separator>
      <q-item v-for="r in rezervacije" :key="r.rezervacija_id">
        <q-item-section>
          <q-item-label>{{ r.vrsta_treninga }}</q-item-label>
          <q-item-label caption>
            {{ r.datum.substring(0, 10) }} u {{ r.vrijeme }} · Status: {{ r.status_rezervacije }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn color="negative" label="Otkaži" @click="otkazi(r.rezervacija_id)" />
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
    return { rezervacije: [] };
  },
  async mounted() {
    const auth = useAuth();
    const korisnik_id = auth.state.user?.korisnik_id;
    try {
      const res = await axios.get(`http://localhost:3000/rezervacije/${korisnik_id}`);
      this.rezervacije = res.data;
    } catch (err) {
      console.log("Greška pri dohvaćanju rezervacija", err);
    }
  },
  methods: {
    async otkazi(rezervacija_id) {
      try {
        await axios.delete(`http://localhost:3000/rezervacije/${rezervacija_id}`);
        Notify.create({ type: "positive", message: "Rezervacija otkazana" });
        this.rezervacije = this.rezervacije.filter(r => r.rezervacija_id !== rezervacija_id);
      } catch (err) {
        Notify.create({ type: "negative", message: "Greška pri otkazivanju" });
      }
    },
  },
};
</script>