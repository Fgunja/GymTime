<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-center q-mb-lg">
      <h3 class="text-primary">Cjenik paketa</h3>
      <p class="text-grey-7">Odaberi paket koji ti najbolje odgovara</p>
    </div>

    <!-- Aktivna pretplata banner -->
    <div v-if="aktivnaPretplata" class="row justify-center q-mb-lg">
      <q-banner class="bg-positive text-white col-12 col-md-6" rounded>
        <template v-slot:avatar>
          <q-icon name="check_circle" />
        </template>
        Aktivna pretplata:
        <strong>{{ aktivnaPretplata.naziv_paketa }}</strong> — ističe
        {{ aktivnaPretplata.datum_isteka }}
      </q-banner>
    </div>

    <div v-if="loading" class="text-center">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-if="error" class="text-negative text-center">{{ error }}</div>

    <div class="row q-col-gutter-md justify-center">
      <div
        v-for="p in paketi"
        :key="p.cjenik_id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="shadow-5">
          <q-card-section class="text-center">
            <div class="text-h6 text-primary">{{ p.naziv_paketa }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm">{{ p.cijena }} €</div>
            <div class="text-grey-7">{{ p.trajanje_dana }} dana</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-grey-8">
            {{ p.opis }}
          </q-card-section>

          <q-card-actions align="center">
            <!-- Samo prijavljeni korisnik koji NIJE admin i NEMA aktivnu pretplatu -->
            <q-btn
              v-if="user && user.uloga !== 'admin' && !aktivnaPretplata"
              color="primary"
              label="Pretplati se"
              :loading="loadingPretplata === p.cjenik_id"
              @click="pretplati(p)"
            />
            <!-- Oznaka aktivnog paketa -->
            <q-chip
              v-if="
                aktivnaPretplata && aktivnaPretplata.cjenik_id === p.cjenik_id
              "
              color="positive"
              text-color="white"
              icon="check"
            >
              Tvoj paket
            </q-chip>
          </q-card-actions>
        </q-card>
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
    return { user: auth.state.user };
  },

  data() {
    return {
      paketi: [],
      aktivnaPretplata: null,
      loading: false,
      loadingPretplata: null,
      error: null,
    };
  },

  async mounted() {
    await this.fetchCjenik();
    if (this.user && this.user.uloga !== "admin") {
      await this.fetchAktivnaPretplata();
    }
  },

  methods: {
    async fetchCjenik() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:3000/cjenik");
        this.paketi = res.data;
      } catch (err) {
        this.error = "Greška pri dohvaćanju cjenika";
      } finally {
        this.loading = false;
      }
    },

    async fetchAktivnaPretplata() {
      try {
        const res = await axios.get(
          `http://localhost:3000/pretplata/${this.user.korisnik_id}`
        );
        if (res.data.aktivna) {
          this.aktivnaPretplata = res.data.pretplata;
        }
      } catch (err) {
        console.log("Greška dohvata pretplate:", err);
      }
    },

    async pretplati(paket) {
      this.loadingPretplata = paket.cjenik_id;
      try {
        await axios.post("http://localhost:3000/pretplata", {
          korisnik_id: this.user.korisnik_id,
          cjenik_id: paket.cjenik_id,
        });
        this.$q.notify({
          type: "positive",
          message: `Uspješno ste se pretplatili na ${paket.naziv_paketa}!`,
        });
        await this.fetchAktivnaPretplata();
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || "Greška kod pretplate",
        });
      } finally {
        this.loadingPretplata = null;
      }
    },
  },
};
</script>
