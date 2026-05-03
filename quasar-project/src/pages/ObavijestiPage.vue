<template>
  <q-page class="q-pa-md">

    <!-- ADMIN -->
    <div v-if="jeAdmin">
      <div class="text-h5 text-primary q-mb-md">Slanje obavijesti</div>

      <q-card bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="send" class="q-mr-xs text-primary" />
            Nova obavijest svim korisnicima
          </div>
          <q-input
            v-model="poruka"
            label="Poruka *"
            outlined
            type="textarea"
            rows="4"
            class="q-mb-md"
          />
          <q-btn
            color="primary"
            icon="send"
            label="Pošalji svim korisnicima"
            :loading="saljem"
            :disable="!poruka"
            @click="posalji"
            class="full-width"
          />
        </q-card-section>
      </q-card>

      <div class="text-subtitle1 text-weight-bold q-mb-sm">Poslane obavijesti</div>

      <div v-if="loading" class="text-center q-py-md">
        <q-spinner-dots color="primary" />
      </div>
      <div v-else-if="obavijesti.length === 0" class="text-grey-6 text-body2 q-pa-md">
        Još nema poslanih obavijesti.
      </div>
      <q-list v-else bordered separator>
        <q-item v-for="o in obavijesti" :key="o.obavijest_id">
          <q-item-section avatar>
            <q-icon name="notifications" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ o.poruka }}</q-item-label>
            <q-item-label caption class="text-grey-5">
              {{ o.datum_kreiranja?.substring(0, 10) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- KORISNIK -->
    <div v-else>
      <div class="text-h5 q-mb-md">Obavijesti</div>

      <div v-if="loading" class="text-center q-py-md">
        <q-spinner-dots color="primary" />
      </div>
      <div v-else-if="obavijesti.length === 0" class="text-center text-grey q-mt-xl">
        <q-icon name="notifications_none" size="60px" class="q-mb-md" />
        <div class="text-h6">Nema obavijesti</div>
      </div>
      <q-list v-else bordered separator>
        <q-item v-for="o in obavijesti" :key="o.obavijest_id">
          <q-item-section avatar>
            <q-avatar
              :color="o.procitano ? 'grey-4' : 'primary'"
              text-color="white"
              size="40px"
            >
              <q-icon name="notifications" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label :class="o.procitano ? 'text-grey-7' : 'text-weight-medium'">
              {{ o.poruka }}
            </q-item-label>
            <q-item-label caption class="text-grey-5">
              {{ o.datum_kreiranja?.substring(0, 10) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge v-if="!o.procitano" color="primary" label="novo" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

  </q-page>
</template>

<script>
import axios from "axios";
import { useAuth } from "src/auth";
import { Notify } from "quasar";

export default {
  name: "ObavijestiPage",
  setup() {
    const auth = useAuth();
    return {
      jeAdmin: auth.state.user?.uloga === "admin",
      korisnik_id: auth.state.user?.korisnik_id,
    };
  },
  data() {
    return {
      obavijesti: [],
      loading: true,
      saljem: false,
      poruka: "",
    };
  },
  async mounted() {
    await this.fetchObavijesti();
  },
  methods: {
    async fetchObavijesti() {
      this.loading = true;
      try {
        const url = this.jeAdmin
          ? "http://localhost:3000/obavijesti"
          : `http://localhost:3000/obavijesti/${this.korisnik_id}`;
        const res = await axios.get(url);
        this.obavijesti = res.data;
      } catch (err) {
        console.log("Greška dohvata obavijesti", err);
      } finally {
        this.loading = false;
      }
    },
    async posalji() {
      this.saljem = true;
      try {
        // Dohvati sve korisnike pa za svakog upiši obavijest
        const res = await axios.get("http://localhost:3000/korisnici");
        const korisnici = res.data.filter(k => k.uloga !== "admin");
        await Promise.all(
          korisnici.map(k =>
            axios.post("http://localhost:3000/obavijesti", {
              korisnik_id: k.korisnik_id,
              poruka: this.poruka,
            })
          )
        );
        Notify.create({ type: "positive", message: "Obavijest poslana svim korisnicima!" });
        this.poruka = "";
        await this.fetchObavijesti();
      } catch (err) {
        Notify.create({ type: "negative", message: "Greška kod slanja obavijesti" });
      } finally {
        this.saljem = false;
      }
    },
  },
};
</script>
