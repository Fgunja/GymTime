<template>
  <q-page class="q-pa-md">

    <!-- ========== ADMIN PRIKAZ ========== -->
    <div v-if="jeAdmin">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-primary">Upravljanje cjenikom</div>
        <q-space />
        <q-btn color="primary" icon="add" label="Novi paket" @click="otvoriFormu(null)" />
      </div>

      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <q-table
        v-else
        :rows="paketi"
        :columns="columnsAdmin"
        row-key="cjenik_id"
        flat bordered
        dark
      >
        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn flat dense icon="edit" color="primary" class="q-mr-xs" @click="otvoriFormu(props.row)" />
          </q-td>
        </template>
      </q-table>

      <!-- DIALOG: dodaj / uredi paket -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 380px; background-color: #1e1e1e;">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ editPaket.cjenik_id ? 'Uredi paket' : 'Novi paket' }}</div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input
              v-model="editPaket.naziv_paketa"
              label="Naziv paketa *"
              outlined dense
              dark
              label-color="grey-4"
              :rules="[val => !!val || 'Obavezno']"
            />
            <q-input
              v-model.number="editPaket.cijena"
              label="Cijena (€) *"
              outlined dense
              dark
              label-color="grey-4"
              type="number"
              :rules="[val => val > 0 || 'Mora biti veće od 0']"
            />
            <q-input
              v-model.number="editPaket.trajanje_dana"
              label="Trajanje (dana) *"
              outlined dense
              dark
              label-color="grey-4"
              type="number"
              :rules="[val => val > 0 || 'Mora biti veće od 0']"
            />
            <q-input
              v-model="editPaket.opis"
              label="Opis"
              outlined dense
              dark
              label-color="grey-4"
              type="textarea"
              rows="3"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Odustani" v-close-popup />
            <q-btn
              color="primary"
              :label="editPaket.cjenik_id ? 'Spremi izmjene' : 'Dodaj paket'"
              :loading="sprema"
              :disable="!editPaket.naziv_paketa || !editPaket.cijena || !editPaket.trajanje_dana"
              @click="spremiPaket"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <!-- ========== KORISNIK PRIKAZ ========== -->
    <div v-else>
      <div class="text-center q-mb-lg">
        <h3 class="text-primary q-my-sm">Cjenik paketa</h3>
        <p class="text-grey-7">Odaberi paket koji ti najbolje odgovara</p>
      </div>

      <div v-if="aktivnaPretplata" class="row justify-center q-mb-lg">
        <q-banner class="bg-positive text-white col-12 col-md-6" rounded>
          <template v-slot:avatar><q-icon name="check_circle" /></template>
          Aktivna pretplata: <strong>{{ aktivnaPretplata.naziv_paketa }}</strong> — ističe {{ aktivnaPretplata.datum_isteka }}
        </q-banner>
      </div>

      <div v-if="loading" class="text-center">
        <q-spinner color="primary" size="50px" />
      </div>

      <div class="row q-col-gutter-md justify-center">
        <div v-for="p in paketi" :key="p.cjenik_id" class="col-12 col-sm-6 col-md-4">
          <q-card class="shadow-5">
            <q-card-section class="text-center">
              <div class="text-h6 text-primary">{{ p.naziv_paketa }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ p.cijena }} €</div>
              <div class="text-grey-7">{{ p.trajanje_dana }} dana</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-grey-4">{{ p.opis }}</q-card-section>
            <q-card-actions align="center">
              <q-btn
                v-if="!aktivnaPretplata"
                color="primary"
                label="Pretplati se"
                :loading="loadingPretplata === p.cjenik_id"
                @click="pretplati(p)"
              />
              <q-chip
                v-if="aktivnaPretplata && aktivnaPretplata.cjenik_id === p.cjenik_id"
                color="positive" text-color="white" icon="check"
              >
                Tvoj paket
              </q-chip>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";

export default {
  setup() {
    const auth = useAuth();
    return {
      jeAdmin: auth.state.user?.uloga === "admin",
      user: auth.state.user,
    };
  },
  data() {
    return {
      paketi: [],
      loading: false,
      aktivnaPretplata: null,
      loadingPretplata: null,
      dialog: false,
      sprema: false,
      editPaket: { naziv_paketa: "", cijena: null, trajanje_dana: null, opis: "" },
      columnsAdmin: [
        { name: "naziv_paketa", label: "Naziv", field: "naziv_paketa", align: "left", sortable: true },
        { name: "cijena", label: "Cijena (€)", field: "cijena", align: "center", sortable: true },
        { name: "trajanje_dana", label: "Trajanje (dana)", field: "trajanje_dana", align: "center" },
        { name: "opis", label: "Opis", field: "opis", align: "left" },
        { name: "akcije", label: "Uredi", field: "akcije", align: "center" },
      ],
    };
  },
  async mounted() {
    await this.fetchCjenik();
    if (!this.jeAdmin && this.user) await this.fetchAktivnaPretplata();
  },
  methods: {
    async fetchCjenik() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:3000/cjenik");
        this.paketi = res.data;
      } catch {
        this.$q.notify({ type: "negative", message: "Greška pri dohvaćanju cjenika" });
      } finally {
        this.loading = false;
      }
    },
    async fetchAktivnaPretplata() {
      try {
        const res = await axios.get(`http://localhost:3000/pretplata/${this.user.korisnik_id}`);
        if (res.data.aktivna) this.aktivnaPretplata = res.data.pretplata;
      } catch { /* tiho */ }
    },
    otvoriFormu(paket) {
      this.editPaket = paket
        ? { ...paket }
        : { naziv_paketa: "", cijena: null, trajanje_dana: null, opis: "" };
      this.dialog = true;
    },
    async spremiPaket() {
      this.sprema = true;
      try {
        if (this.editPaket.cjenik_id) {
          await axios.put(
            `http://localhost:3000/cjenik/${this.editPaket.cjenik_id}`,
            this.editPaket
          );
          this.$q.notify({ type: "positive", message: "Paket ažuriran!" });
        } else {
          await axios.post("http://localhost:3000/cjenik", this.editPaket);
          this.$q.notify({ type: "positive", message: "Paket dodan!" });
        }
        this.dialog = false;
        await this.fetchCjenik();
      } catch {
        this.$q.notify({ type: "negative", message: "Greška kod spremanja" });
      } finally {
        this.sprema = false;
      }
    },
    async pretplati(paket) {
      this.loadingPretplata = paket.cjenik_id;
      try {
        await axios.post("http://localhost:3000/pretplata", {
          korisnik_id: this.user.korisnik_id,
          cjenik_id: paket.cjenik_id,
        });
        this.$q.notify({ type: "positive", message: `Pretplaćeni ste na ${paket.naziv_paketa}!` });
        await this.fetchAktivnaPretplata();
      } catch (err) {
        this.$q.notify({ type: "negative", message: err.response?.data?.message || "Greška" });
      } finally {
        this.loadingPretplata = null;
      }
    },
  },
};
</script>
