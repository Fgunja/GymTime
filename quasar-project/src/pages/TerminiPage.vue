<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Termini treninga</div>

    <!-- FORMA ZA ADMINA -->
    <q-card v-if="isAdmin" class="q-mb-lg q-pa-md">
      <div class="text-h6 q-mb-md">Dodaj novi termin</div>
      <q-input v-model="novi.datum" label="Datum" type="date" outlined class="q-mb-sm" />
      <q-input v-model="novi.vrijeme" label="Vrijeme" type="time" outlined class="q-mb-sm" />
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
            <q-btn v-if="isAdmin" flat color="negative" icon="delete" :disable="brise" @click="potvrdiObrisati(t)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Dialog za potvrdu brisanja -->
    <q-dialog :model-value="dijalog" @hide="zatvoriDijalog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Brisanje termina</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-body2">
          Jeste li sigurni da želite obrisati termin
          <strong>{{ odabraniTermin?.vrsta_treninga }}</strong>
          dana {{ odabraniTermin ? formatDatum(odabraniTermin.datum) : '' }}?
          <br />
          <span class="text-negative">Sve rezervacije za ovaj termin bit će također obrisane.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" :disable="brise" @click="zatvoriDijalog" />
          <q-btn color="negative" label="Obriši" :loading="brise" @click="obrisiTermin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
      dijalog: false,
      odabraniTermin: null,
      brise: false,
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

    zatvoriDijalog() {
      if (this.brise) return;
      this.dijalog = false;
      this.odabraniTermin = null;
    },

    async fetchTermini() {
      try {
        const res = await axios.get("http://localhost:3000/termini");
        this.termini = res.data;
      } catch (err) {
        console.log("Greška pri dohvaćanju termina", err);
      }
    },

    potvrdiObrisati(termin) {
      // Spremi kopiju objekta da izbjegnemo reaktivnost probleme
      this.odabraniTermin = { ...termin };
      this.dijalog = true;
    },

    async obrisiTermin() {
      if (!this.odabraniTermin) return;

      // Pokušaj naći ID — backend može vratiti termin_id ili id
      const id = this.odabraniTermin.termin_id ?? this.odabraniTermin.id;

      if (!id) {
        this.$q.notify({ type: "negative", message: "Greška: ID termina nije pronađen." });
        console.error("odabraniTermin objekt:", this.odabraniTermin);
        return;
      }

      this.brise = true;
      try {
        await axios.delete(`http://localhost:3000/termini/${id}`);
        this.$q.notify({ type: "positive", message: "Termin obrisan." });
        this.termini = this.termini.filter(
          t => (t.termin_id ?? t.id) !== id
        );
        this.dijalog = false;
        this.odabraniTermin = null;
      } catch (err) {
        console.error("Greška pri brisanju:", err.response?.status, err.response?.data);
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || `Greška ${err.response?.status}`
        });
      } finally {
        this.brise = false;
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
