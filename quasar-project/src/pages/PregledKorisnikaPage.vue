<template>
  <q-page class="q-pa-md">
    <div v-if="!jeAdmin" class="text-center q-mt-xl">
      <q-icon name="lock" size="64px" color="negative" />
      <div class="text-h6 text-negative q-mt-md">Nemate pristup ovoj stranici.</div>
    </div>

    <div v-else>
      <div class="text-h5 text-primary q-mb-md">Korisnici i pretplate</div>

      <div v-if="loading" class="text-center q-mt-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <q-table
        v-else
        :rows="korisnici"
        :columns="columns"
        row-key="korisnik_id"
        flat
        bordered
        :filter="filter"
      >
        <template v-slot:top>
          <div class="text-subtitle1 text-weight-bold">Svi korisnici</div>
          <q-space />
          <q-input v-model="filter" dense outlined placeholder="Pretraži..." debounce="300">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-pretplata="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row._pretplata"
              :color="props.row._pretplata.status_pretplate === 'aktivna' ? 'positive' : 'warning'"
            >
              {{ props.row._pretplata.naziv_paketa }} — {{ props.row._pretplata.status_pretplate }}
            </q-badge>
            <span v-else class="text-grey-5 text-caption">nema pretplate</span>
          </q-td>
        </template>

        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn flat dense icon="info" color="primary" @click="otvoriDetalje(props.row)" />
          </q-td>
        </template>
      </q-table>

      <!-- DIALOG -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 420px; max-width: 620px; width: 100%">
          <q-card-section class="bg-primary text-white row items-center">
            <q-avatar color="white" text-color="primary" size="40px" class="q-mr-sm">
              {{ inicijali(odabraniKorisnik) }}
            </q-avatar>
            <div>
              <div class="text-h6">{{ odabraniKorisnik?.ime }} {{ odabraniKorisnik?.prezime }}</div>
              <div class="text-caption opacity-80">@{{ odabraniKorisnik?.username }}</div>
            </div>
            <q-space />
            <q-btn flat round icon="close" v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="q-gutter-xs text-body2">
              <div><q-icon name="email" class="q-mr-xs text-grey" />{{ odabraniKorisnik?.email }}</div>
              <div><q-icon name="badge" class="q-mr-xs text-grey" />Uloga: {{ odabraniKorisnik?.uloga }}</div>
              <div><q-icon name="calendar_today" class="q-mr-xs text-grey" />Registriran: {{ odabraniKorisnik?.datum_registracije }}</div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- PRETPLATE -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Pretplate</div>
            <div v-if="loadingPretplate" class="text-center"><q-spinner color="primary" /></div>
            <div v-else-if="pretplate.length === 0" class="text-grey-6 text-body2">Nema evidentiranih pretplata.</div>
            <q-list v-else bordered separator rounded>
              <q-item v-for="p in pretplate" :key="p.pretplata_id">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ p.naziv_paketa }}</q-item-label>
                  <q-item-label caption>{{ p.datum_pocetka }} → {{ p.datum_isteka }} · {{ p.cijena }} €</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn :color="statusBoja(p.status_pretplate)" :label="p.status_pretplate" size="sm" rounded>
                    <q-menu>
                      <q-list style="min-width: 140px">
                        <q-item-label header>Promijeni status</q-item-label>
                        <q-item
                          v-for="s in statusi" :key="s"
                          clickable v-close-popup
                          @click="promijeniStatus(p, s)"
                          :disable="p.status_pretplate === s"
                        >
                          <q-item-section>{{ s }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- REZERVACIJE -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Rezervacije</div>
            <div v-if="loadingRezervacije" class="text-center"><q-spinner color="primary" /></div>
            <div v-else-if="rezervacije.length === 0" class="text-grey-6 text-body2">Nema rezervacija.</div>
            <q-list v-else bordered separator rounded>
              <q-item v-for="r in rezervacije" :key="r.rezervacija_id">
                <q-item-section avatar>
                  <q-icon name="fitness_center" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ r.vrsta_treninga }}</q-item-label>
                  <q-item-label caption>{{ r.datum?.substring(0, 10) }} u {{ r.vrijeme }} · {{ r.trajanje }} min</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="r.status_rezervacije === 'aktivna' ? 'positive' : 'negative'">
                    {{ r.status_rezervacije }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Zatvori" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";

export default {
  setup() {
    const auth = useAuth();
    return { jeAdmin: auth.state.user?.uloga === "admin" };
  },
  data() {
    return {
      korisnici: [],
      loading: false,
      filter: "",
      dialog: false,
      odabraniKorisnik: null,
      pretplate: [],
      rezervacije: [],
      loadingPretplate: false,
      loadingRezervacije: false,
      statusi: ["aktivna", "istekla", "otkazana"],
      columns: [
        { name: "username", label: "Username", field: "username", align: "left", sortable: true },
        { name: "ime", label: "Ime", field: "ime", align: "left", sortable: true },
        { name: "prezime", label: "Prezime", field: "prezime", align: "left", sortable: true },
        { name: "email", label: "Email", field: "email", align: "left" },
        { name: "uloga", label: "Uloga", field: "uloga", align: "center", sortable: true },
        { name: "pretplata", label: "Pretplata", field: "pretplata", align: "left" },
        { name: "akcije", label: "Detalji", field: "akcije", align: "center" },
      ],
    };
  },
  async mounted() {
    if (this.jeAdmin) await this.fetchKorisnici();
  },
  methods: {
    inicijali(k) {
      if (!k) return "?";
      return ((k.ime?.[0] || "") + (k.prezime?.[0] || "")).toUpperCase();
    },
    async fetchKorisnici() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:3000/korisnici");
        const korisnici = res.data;
        // Dohvati aktivnu pretplatu za svakog korisnika
        await Promise.all(
          korisnici.map(async (k) => {
            try {
              const p = await axios.get(`http://localhost:3000/pretplata/${k.korisnik_id}`);
              k._pretplata = p.data.aktivna ? p.data.pretplata : null;
            } catch {
              k._pretplata = null;
            }
          })
        );
        this.korisnici = korisnici;
      } catch (err) {
        this.$q.notify({ type: "negative", message: "Greška kod dohvaćanja korisnika" });
      } finally {
        this.loading = false;
      }
    },
    async otvoriDetalje(korisnik) {
      this.odabraniKorisnik = korisnik;
      this.dialog = true;
      this.pretplate = [];
      this.rezervacije = [];
      this.loadingPretplate = true;
      this.loadingRezervacije = true;

      try {
        const res = await axios.get(`http://localhost:3000/admin/pretplata/${korisnik.korisnik_id}`);
        this.pretplate = res.data;
      } catch {
        this.$q.notify({ type: "negative", message: "Greška kod dohvaćanja pretplata" });
      } finally {
        this.loadingPretplate = false;
      }

      try {
        const res = await axios.get(`http://localhost:3000/rezervacije/${korisnik.korisnik_id}`);
        this.rezervacije = res.data;
      } catch {
        this.$q.notify({ type: "negative", message: "Greška kod dohvaćanja rezervacija" });
      } finally {
        this.loadingRezervacije = false;
      }
    },
    async promijeniStatus(pretplata, noviStatus) {
      try {
        await axios.put(`http://localhost:3000/admin/pretplata/${pretplata.pretplata_id}`, {
          status_pretplate: noviStatus,
        });
        pretplata.status_pretplate = noviStatus;
        // Ažuriraj i prikaz u tablici
        const k = this.korisnici.find(k => k.korisnik_id === this.odabraniKorisnik.korisnik_id);
        if (k?._pretplata?.pretplata_id === pretplata.pretplata_id) {
          k._pretplata.status_pretplate = noviStatus;
        }
        this.$q.notify({ type: "positive", message: "Status pretplate ažuriran" });
      } catch {
        this.$q.notify({ type: "negative", message: "Greška kod ažuriranja" });
      }
    },
    statusBoja(status) {
      if (status === "aktivna") return "positive";
      if (status === "istekla") return "warning";
      return "negative";
    },
  },
};
</script>
