<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md text-white">Moje rezervacije</div>

    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <div v-else-if="rezervacije.length === 0" class="text-center text-grey q-mt-xl">
      <q-icon name="event_busy" size="60px" class="q-mb-md" />
      <div class="text-h6">Nemate rezervacija</div>
      <q-btn color="primary" label="Pregledaj termine" icon="fitness_center" class="q-mt-md" @click="$router.push('/app/termini')" />
    </div>

    <div v-else class="q-gutter-md">
      <q-card
        v-for="r in rezervacije"
        :key="r.rezervacija_id"
        class="cursor-pointer"
        style="background-color: #1e1e1e; border-left: 4px solid #FF6B00;"
        @click="$router.push(`/app/rezervacije/${r.rezervacija_id}`)"
      >
        <q-card-section class="row items-center justify-between q-py-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="fitness_center" color="primary" size="24px" />
            <div>
              <div class="text-white text-weight-medium">{{ r.vrsta_treninga }}</div>
              <div class="text-grey-5 text-caption">
                {{ r.datum.substring(0, 10) }} u {{ r.vrijeme }} · {{ r.trajanje }} min
              </div>
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge :color="r.status_rezervacije === 'potvrđena' ? 'positive' : 'negative'">
              {{ r.status_rezervacije }}
            </q-badge>
            <q-btn
              v-if="r.status_rezervacije === 'potvrđena'"
              flat dense round
              icon="cancel"
              color="negative"
              @click.stop="potvrdiOtkaz(r)"
            />
            <q-icon v-else name="chevron_right" color="grey" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog za potvrdu -->
    <q-dialog v-model="dijalog">
      <q-card style="min-width: 300px; background-color: #1e1e1e;">
        <q-card-section>
          <div class="text-h6 text-white">Otkazivanje rezervacije</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-grey-4">
          Jeste li sigurni da želite otkazati rezervaciju za
          <strong class="text-white">{{ odabrana?.vrsta_treninga }}</strong>
          dana {{ odabrana?.datum.substring(0, 10) }}?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="grey" v-close-popup />
          <q-btn color="negative" label="Otkaži" :loading="otkazuje" @click="otkazi" />
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