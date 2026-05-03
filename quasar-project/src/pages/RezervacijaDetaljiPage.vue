<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Natrag na rezervacije" @click="$router.push('/app/rezervacije')" class="q-mb-md" />

    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <div v-else-if="rezervacija">
      <!-- Naslov -->
      <div class="text-h5 text-primary q-mb-md">Detalji rezervacije</div>

      <!-- Glavna kartica -->
      <q-card bordered class="q-mb-md">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="fitness_center" size="28px" />
            <div>
              <div class="text-h6">{{ rezervacija.vrsta_treninga }}</div>
            </div>
            <q-space />
            <q-badge
              :color="statusBoja(rezervacija.status_rezervacije)"
              class="text-body2 q-pa-sm"
            >
              {{ rezervacija.status_rezervacije }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey">Datum treninga</div>
              <div class="text-body1 text-weight-medium">
                <q-icon name="calendar_today" size="16px" class="q-mr-xs text-primary" />
                {{ formatDatum(rezervacija.datum) }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey">Vrijeme</div>
              <div class="text-body1 text-weight-medium">
                <q-icon name="schedule" size="16px" class="q-mr-xs text-primary" />
                {{ rezervacija.vrijeme }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey">Trajanje</div>
              <div class="text-body1 text-weight-medium">
                <q-icon name="timer" size="16px" class="q-mr-xs text-primary" />
                {{ rezervacija.trajanje }} minuta
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey">Datum rezervacije</div>
              <div class="text-body1 text-weight-medium">
                <q-icon name="event_available" size="16px" class="q-mr-xs text-primary" />
                {{ formatDatum(rezervacija.datum_rezervacije) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Informacija o treningu -->
      <q-card bordered class="q-mb-md" v-if="termin">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            <q-icon name="info" class="q-mr-xs text-primary" />
            O treningu
          </div>
          <div class="text-body2 text-grey-8">
            {{ termin.opis || 'Nema opisa treninga.' }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-sm text-center">
            <div class="col-2">
              <div class="text-h6 text-primary">{{ termin.max_kapacitet }}</div>
              <div class="text-caption text-grey">Max kapacitet</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Akcije -->

      <q-card-section>
        <div class="text-subtitle2 text-grey-7 q-mb-sm">Upravljanje rezervacijom</div>
        <q-btn
          color="negative"
          outline
          icon="cancel"
          label="Otkaži rezervaciju"
          class="full-width"
          @click="potvrdiOtkazivanje"
        />
      </q-card-section>
    </div>

    <!-- Ako rezervacija nije pronađena -->
    <div v-else class="text-center text-grey q-mt-xl">
      <q-icon name="search_off" size="60px" class="q-mb-md" />
      <div class="text-h6">Rezervacija nije pronađena</div>
    </div>

    <!-- Dialog za potvrdu otkazivanja -->
    <q-dialog v-model="dijalogOtkaz">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Otkazivanje rezervacije</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-body2">
          Jeste li sigurni da želite otkazati rezervaciju za
          <strong>{{ rezervacija?.vrsta_treninga }}</strong>
          dana {{ formatDatum(rezervacija?.datum) }}?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="negative" label="Otkaži rezervaciju" @click="otkazi" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import axios from 'axios';
import { useAuth } from 'src/auth';
import { Notify } from 'quasar';

export default {
  name: 'RezervacijaDetaljiPage',
  data() {
    return {
      rezervacija: null,
      termin: null,
      loading: true,
      dijalogOtkaz: false,
    };
  },
  async mounted() {
    const id = this.$route.params.rezervacija_id;
    const auth = useAuth();
    const korisnik_id = auth.state.user?.korisnik_id;

    try {
      const res = await axios.get(`http://localhost:3000/rezervacije/${korisnik_id}`);
      this.rezervacija = res.data.find(r => r.rezervacija_id == id) || null;

      if (this.rezervacija) {
        try {
          const terminRes = await axios.get(`http://localhost:3000/termini/${this.rezervacija.termin_id}`);
          this.termin = terminRes.data;
        } catch {
        }
      }
    } catch (err) {
      console.log('Greška pri dohvaćanju rezervacije', err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDatum(datum) {
      if (!datum) return '–';
      return datum.substring(0, 10);
    },
    statusBoja(status) {
      if (status === 'aktivna') return 'positive';
      if (status === 'otkazana') return 'negative';
      return 'grey';
    },
    potvrdiOtkazivanje() {
      this.dijalogOtkaz = true;
    },
    async otkazi() {
      try {
        await axios.delete(`http://localhost:3000/rezervacije/${this.rezervacija.rezervacija_id}`);
        Notify.create({ type: 'positive', message: 'Rezervacija otkazana.' });
        this.rezervacija.status_rezervacije = 'otkazana';
        this.dijalogOtkaz = false;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Greška pri otkazivanju.' });
        this.dijalogOtkaz = false;
      }
    },
  },
};
</script>
