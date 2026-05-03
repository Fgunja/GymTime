<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Moje rezervacije</div>

    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>


    <div v-else-if="rezervacije.length === 0" class="text-center text-grey q-mt-xl">
      <q-icon name="event_busy" size="60px" class="q-mb-md" />
      <div class="text-h6">Nemate rezervacija</div>
      <q-btn color="primary" label="Pregledaj termine" icon="fitness_center" class="q-mt-md" @click="$router.push('/app/termini')" />
    </div>

    <q-list bordered separator v-else>
      <q-item
        v-for="r in rezervacije"
        :key="r.rezervacija_id"
        clickable
        v-ripple
        @click="$router.push(`/app/rezervacije/${r.rezervacija_id}`)"
      >

        <q-item-section avatar>
          <q-icon name="fitness_center" color="primary" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ r.vrsta_treninga }}</q-item-label>
          <q-item-label caption>
            {{ r.datum.substring(0, 10) }} u {{ r.vrijeme }} · {{ r.trajanje }} min
          </q-item-label>
        </q-item-section>
      <div class="row q-gutter-sm">
        <q-btn flat color="secondary" label="Detalji" @click="$router.push('/app/termini/' + t.termin_id)" />
    </div>
        <q-item-section side>
          <q-badge :color="r.status_rezervacije === 'aktivna' ? 'positive' : 'negative'">
            {{ r.status_rezervacije }}
          </q-badge>
        </q-item-section>

        <q-item-section side>
          <q-btn
            v-if="r.status_rezervacije === 'aktivna'"
            flat dense round
            icon="cancel"
            color="negative"
            @click.stop="potvrdiOtkaz(r)"
          />
          <q-icon v-else name="chevron_right" color="grey" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Dialog za potvrdu -->
    <q-dialog v-model="dijalog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Otkazivanje rezervacije</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-body2">
          Jeste li sigurni da želite otkazati rezervaciju za
          <strong>{{ odabrana?.vrsta_treninga }}</strong>
          dana {{ odabrana?.datum.substring(0, 10) }}?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="negative" label="Otkaži" :loading="otkازuje" @click="otkazi" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { Notify } from "quasar";

export default {
  data() {
    return {
      rezervacije: [],
      loading: true,
      dijalog: false,
      odabrana: null,
      otkazuje: false,
    };
  },
  async mounted() {
    const auth = useAuth();
    const korisnik_id = auth.state.user?.korisnik_id;
    try {
      const res = await axios.get(`http://localhost:3000/rezervacije/${korisnik_id}`);
      this.rezervacije = res.data;
    } catch (err) {
      console.log("Greška pri dohvaćanju rezervacija", err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    potvrdiOtkaz(rezervacija) {
      this.odabrana = rezervacija;
      this.dijalog = true;
    },
    async otkazi() {
      this.otkazuje = true;
      try {
        await axios.delete(`http://localhost:3000/rezervacije/${this.odabrana.rezervacija_id}`);
        this.odabrana.status_rezervacije = "otkazana";
        Notify.create({ type: "positive", message: "Rezervacija otkazana." });
        this.dijalog = false;
      } catch {
        Notify.create({ type: "negative", message: "Greška pri otkazivanju." });
      } finally {
        this.otkazuje = false;
      }
    },
  },
};
</script>
