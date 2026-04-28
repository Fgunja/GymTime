<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Natrag" @click="$router.back()" class="q-mb-md" />

    <div v-if="termin">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h5 text-primary">{{ termin.vrsta_treninga }}</div>
          <div class="text-subtitle2 text-grey-7 q-mt-xs">
            {{ formatDatum(termin.datum) }} u {{ termin.vrijeme }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-caption text-grey">Trajanje</div>
              <div class="text-body1">{{ termin.trajanje }} min</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Max kapacitet</div>
              <div class="text-body1">{{ termin.max_kapacitet }} osoba</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-caption text-grey">Opis</div>
          <div class="text-body1 q-mt-xs">{{ termin.opis }}</div>
        </q-card-section>

        <q-card-actions v-if="!isAdmin">
          <q-btn color="primary" label="Rezerviraj" class="full-width" @click="rezerviraj" />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else class="text-center text-grey q-mt-xl">
      Učitavanje...
    </div>
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
    return { termin: null };
  },
  computed: {
    isAdmin() {
      const auth = useAuth();
      return auth.state.user?.uloga === "admin";
    },
  },
  async mounted() {
    const id = this.$route.params.termin_id;
    try {
      const res = await axios.get(`http://localhost:3000/termini/${id}`);
      this.termin = res.data;
    } catch (err) {
      console.log("Greška pri dohvaćanju termina", err);
    }
  },
  methods: {
    formatDatum(datum) {
      return datum.substring(0, 10);
    },
    async rezerviraj() {
      const auth = useAuth();
      const korisnik_id = auth.state.user?.korisnik_id;
      try {
        await axios.post("http://localhost:3000/rezervacije", {
          korisnik_id,
          termin_id: this.termin.termin_id,
        });
        this.$q.notify({ type: "positive", message: "Rezervacija uspješna!" });
        this.$router.push("/app/termini");
      } catch (err) {
        this.$q.notify({ type: "negative", message: err.response?.data?.message || "Greška" });
      }
    },
  },
};
</script>