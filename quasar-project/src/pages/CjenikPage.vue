<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- HEADER -->
    <div class="text-center q-mb-lg">
      <h3 class="text-primary">Cjenik paketa</h3>
      <p class="text-grey-7">Odaberi paket koji ti najbolje odgovara</p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center">
      <q-spinner color="primary" size="50px" />
    </div>

    <!-- ERROR -->
    <div v-if="error" class="text-negative text-center">
      {{ error }}
    </div>

    <!-- PACKAGES -->
    <div class="row q-col-gutter-md justify-center">
      <div
        v-for="p in paketi"
        :key="p.cjenik_id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="shadow-5">
          <q-card-section class="text-center">
            <div class="text-h6 text-primary">
              {{ p.naziv_paketa }}
            </div>

            <div class="text-h4 text-weight-bold q-mt-sm">{{ p.cijena }} €</div>

            <div class="text-grey-7">{{ p.trajanje_dana }} dana</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-grey-8">
            {{ p.opis }}
          </q-card-section>

          <q-card-actions align="center"> </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      paketi: [],
      loading: false,
      error: null,
    };
  },

  async mounted() {
    this.fetchCjenik();
  },

  methods: {
    async fetchCjenik() {
      this.loading = true;

      try {
        const res = await axios.get("http://localhost:3000/cjenik");
        this.paketi = res.data;
      } catch (err) {
        console.log(err);
        this.error = "Greška pri dohvaćanju cjenika";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
