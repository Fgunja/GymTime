<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Termini treninga</div>

    <!-- FORMA ZA ADMINA -->
    <q-card v-if="isAdmin" class="q-mb-lg q-pa-md">
      <div class="text-h6 q-mb-md">Dodaj novi termin</div>
      <q-input v-model="novi.datum" label="Datum" type="date" outlined dark label-color="grey-4" class="q-mb-sm" />
      <q-input v-model="novi.vrijeme" label="Vrijeme" type="time" outlined dark label-color="grey-4" class="q-mb-sm" />
      <q-input v-model="novi.vrsta_treninga" label="Vrsta treninga" outlined dark label-color="grey-4" class="q-mb-sm" />
      <q-input v-model="novi.opis" label="Opis" outlined dark label-color="grey-4" class="q-mb-sm" />
      <q-input v-model="novi.trajanje" label="Trajanje (min)" type="number" outlined dark label-color="grey-4" class="q-mb-sm" />
      <q-input v-model="novi.max_kapacitet" label="Max kapacitet" type="number" outlined dark label-color="grey-4" class="q-mb-md" />
      <q-btn color="primary" label="Dodaj termin" @click="dodajTermin" />
    </q-card>

    <!-- KALENDAR -->
    <q-card bordered class="q-mb-md">
      <!-- NAVIGACIJA -->
      <q-card-section class="row items-center justify-between q-py-sm">
        <q-btn flat round icon="chevron_left" @click="promijeniMjesec(-1)" />
        <div class="text-h6">{{ nazivMjeseca }} {{ godina }}</div>
        <q-btn flat round icon="chevron_right" @click="promijeniMjesec(1)" />
      </q-card-section>

      <q-separator />

      <!-- DANI U TJEDNU -->
      <div class="row text-center q-py-xs">
        <div v-for="dan in daniTjedna" :key="dan" class="col text-caption text-grey-7 text-weight-bold">
          {{ dan }}
        </div>
      </div>

      <q-separator />

      <!-- MREŽA KALENDARAA -->
      <div class="q-pa-xs">
        <div v-for="(tjedan, i) in kalendarMreza" :key="i" class="row">
          <div
            v-for="dan in tjedan"
            :key="dan.datum"
            class="col q-pa-xs"
            style="min-height: 70px; border: 1px solid #e0e0e0;"
          >
            <!-- Broj dana -->
            <div
              class="text-caption text-right q-mb-xs"
              :class="dan.danas ? 'text-primary text-weight-bold' : dan.drugiMjesec ? 'text-grey-4' : 'text-grey-8'"
            >
              {{ dan.broj }}
            </div>

            <!-- Termini tog dana -->
<div v-for="t in dan.termini" :key="t.termin_id">
  <q-badge
  :color="popunjenosti[t.termin_id] >= t.max_kapacitet ? 'negative' : 'positive'"
  class="cursor-pointer q-mb-xs full-width"
  style="white-space: normal; display: block;"
  @click="isAdmin ? otvoriOpcije(t) : $router.push('/app/termini/' + t.termin_id)"
>
  {{ t.vrijeme.substring(0, 5) }} {{ t.vrsta_treninga }}
</q-badge>
</div>
          </div>
        </div>
      </div>
    </q-card>

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

    <!-- Dialog za uređivanje -->
    <q-dialog v-model="dijalogUredi">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">Uredi termin</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input v-model="uredi.datum" label="Datum" type="date" outlined dark label-color="grey-4" />
          <q-input v-model="uredi.vrijeme" label="Vrijeme" type="time" outlined dark label-color="grey-4" />
          <q-input v-model="uredi.vrsta_treninga" label="Vrsta treninga" outlined dark label-color="grey-4"/>
          <q-input v-model="uredi.opis" label="Opis" outlined dark label-color="grey-4"/>
          <q-input v-model="uredi.trajanje" label="Trajanje (min)" type="number" outlined dark label-color="grey-4" />
          <q-input v-model="uredi.max_kapacitet" label="Max kapacitet" type="number" outlined dark label-color="grey-4"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="primary" label="Spremi" :loading="sprema" @click="spremiTermin" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog opcije za admina -->
<q-dialog v-model="dijalogOpcije">
  <q-card style="min-width: 280px">
    <q-card-section>
      <div class="text-h6">{{ odabraniTermin?.vrsta_treninga }}</div>
      <div class="text-caption text-grey">{{ odabraniTermin ? formatDatum(odabraniTermin.datum) : '' }} u {{ odabraniTermin?.vrijeme }}</div>
    </q-card-section>
    <q-card-actions vertical align="left">
      <q-btn flat icon="edit" label="Uredi termin" color="primary" @click="dijalogOpcije = false; otvoriUredi(odabraniTermin)" />
      <q-btn flat icon="delete" label="Obriši termin" color="negative" @click="dijalogOpcije = false; potvrdiObrisati(odabraniTermin)" />
      <q-btn flat icon="info" label="Detalji" color="dodatno" @click="dijalogOpcije = false; $router.push('/app/termini/' + odabraniTermin.termin_id)" />
    </q-card-actions>
  </q-card>
</q-dialog>

  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { useQuasar } from "quasar";

const MJESECI = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

export default {
  setup() {
    const $q = useQuasar();
    return { $q };
  },
  data() {
    const danas = new Date();
    return {
      termini: [],
      popunjenost: {},
      trenutniMjesec: danas.getMonth(),
      godina: danas.getFullYear(),
      daniTjedna: ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"],
      novi: {
        datum: "", vrijeme: "", vrsta_treninga: "", opis: "", trajanje: null, max_kapacitet: null,
      },
      dijalog: false,
      dijalogUredi: false,
      odabraniTermin: null,
      dijalogOpcije: false,
      uredi: {},
      brise: false,
      sprema: false,
    };
    
  },
  computed: {
    isAdmin() {
      const auth = useAuth();
      return auth.state.user?.uloga === "admin";
    },
    nazivMjeseca() {
      return MJESECI[this.trenutniMjesec];
    },
    kalendarMreza() {
      const godina = this.godina;
      const mjesec = this.trenutniMjesec;
      const danas = new Date();

      // Prvi dan mjeseca (0=ned, 1=pon... pretvaramo u pon=0)
      const prviDan = new Date(godina, mjesec, 1);
      let pocetniDan = prviDan.getDay() - 1;
      if (pocetniDan < 0) pocetniDan = 6;

      const zadnjiDan = new Date(godina, mjesec + 1, 0).getDate();

      const mreza = [];
      let tjedan = [];
      let danBroj = 1 - pocetniDan;

      for (let i = 0; i < 6; i++) {
        tjedan = [];
        for (let j = 0; j < 7; j++) {
          const datum = new Date(godina, mjesec, danBroj);
          const datumStr = `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}-${String(datum.getDate()).padStart(2, '0')}`;
          const drugiMjesec = danBroj < 1 || danBroj > zadnjiDan;
          const jeDanas = datum.toDateString() === danas.toDateString();

          tjedan.push({
            broj: datum.getDate(),
            datum: datumStr,
            drugiMjesec,
            danas: jeDanas,
            termini: drugiMjesec ? [] : this.termini.filter(t => t.datum === datumStr),
          });
          danBroj++;
        }
        mreza.push(tjedan);
        if (danBroj > zadnjiDan + 1) break;
      }

      return mreza;
    },
  },
  async mounted() {
    await this.fetchTermini();
  },
  methods: {
    formatDatum(datum) {
      return datum.substring(0, 10);
    },
    promijeniMjesec(smjer) {
      this.trenutniMjesec += smjer;
      if (this.trenutniMjesec > 11) {
        this.trenutniMjesec = 0;
        this.godina++;
      } else if (this.trenutniMjesec < 0) {
        this.trenutniMjesec = 11;
        this.godina--;
      }
    },
    async fetchTermini() {
  try {
    const res = await axios.get("http://localhost:3000/termini");
    this.termini = res.data;

    const popunjenosti = {};
    await Promise.all(
      res.data.map(async (t) => {
        const pop = await axios.get(`http://localhost:3000/termini/${t.termin_id}/popunjenost`);
        popunjenosti[t.termin_id] = pop.data.broj;
      })
    );
    this.popunjenosti = { ...popunjenosti };
    this.termini = [...this.termini];
  } catch (err) {
    console.log("Greška pri dohvaćanju termina", err);
  }
},
    zatvoriDijalog() {
      if (this.brise) return;
      this.dijalog = false;
      this.odabraniTermin = null;
    },
    
    otvoriOpcije(termin) {
  this.odabraniTermin = { ...termin };
  this.dijalogOpcije = true;
},

    potvrdiObrisati(termin) {
      this.odabraniTermin = { ...termin };
      this.dijalog = true;
    },
    async obrisiTermin() {
      if (!this.odabraniTermin) return;
      const id = this.odabraniTermin.termin_id ?? this.odabraniTermin.id;
      if (!id) {
        this.$q.notify({ type: "negative", message: "Greška: ID termina nije pronađen." });
        return;
      }
      this.brise = true;
      try {
        await axios.delete(`http://localhost:3000/termini/${id}`);
        this.$q.notify({ type: "positive", message: "Termin obrisan." });
        this.termini = this.termini.filter(t => (t.termin_id ?? t.id) !== id);
        this.dijalog = false;
        this.odabraniTermin = null;
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || `Greška ${err.response?.status}`
        });
      } finally {
        this.brise = false;
      }
    },
    otvoriUredi(termin) {
      this.uredi = {
        termin_id: termin.termin_id,
        datum: termin.datum.substring(0, 10),
        vrijeme: termin.vrijeme,
        vrsta_treninga: termin.vrsta_treninga,
        opis: termin.opis,
        trajanje: termin.trajanje,
        max_kapacitet: termin.max_kapacitet,
      };
      this.dijalogUredi = true;
    },
    async spremiTermin() {
      this.sprema = true;
      try {
        await axios.put(`http://localhost:3000/termini/${this.uredi.termin_id}`, this.uredi);
        this.$q.notify({ type: "positive", message: "Termin ažuriran." });
        this.dijalogUredi = false;
        await this.fetchTermini();
      } catch (err) {
        this.$q.notify({ type: "negative", message: "Greška pri ažuriranju termina" });
      } finally {
        this.sprema = false;
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