<template>
  <q-page class="q-pa-md">
    <!-- ZABRANJEN PRISTUP -->
    <div v-if="!jeAdmin" class="text-center q-mt-xl">
      <q-icon name="lock" size="64px" color="negative" />
      <div class="text-h6 text-negative q-mt-md">
        Nemate pristup ovoj stranici.
      </div>
    </div>

    <div v-else>
      <div class="text-h5 text-primary q-mb-md">Pregled korisnika</div>

      <!-- LOADING -->
      <div v-if="loading" class="text-center q-mt-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <!-- TABLICA -->
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
          <q-input
            v-model="filter"
            dense
            outlined
            placeholder="Pretraži..."
            debounce="300"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-akcije="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              icon="info"
              color="primary"
              @click="otvoriDetalje(props.row)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- DIALOG - DETALJI KORISNIKA -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 400px; max-width: 600px; width: 100%">
          <!-- HEADER -->
          <q-card-section class="bg-primary text-white row items-center">
            <div class="text-h6">
              {{ odabraniKorisnik?.ime }} {{ odabraniKorisnik?.prezime }}
            </div>
            <q-space />
            <q-btn flat round icon="close" v-close-popup />
          </q-card-section>

          <!-- INFO KORISNIKA -->
          <q-card-section>
            <div class="q-gutter-sm">
              <div>
                <strong>Username:</strong> {{ odabraniKorisnik?.username }}
              </div>
              <div><strong>Email:</strong> {{ odabraniKorisnik?.email }}</div>
              <div><strong>Uloga:</strong> {{ odabraniKorisnik?.uloga }}</div>
              <div>
                <strong>Registriran:</strong>
                {{ odabraniKorisnik?.datum_registracije }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- PRETPLATE -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Pretplate</div>

            <div v-if="loadingPretplate" class="text-center">
              <q-spinner color="primary" />
            </div>

            <div v-else-if="pretplate.length === 0" class="text-grey-6">
              Nema evidentiranih pretplata.
            </div>

            <q-list v-else bordered separator rounded>
              <q-item v-for="p in pretplate" :key="p.pretplata_id">
                <q-item-section>
                  <q-item-label>{{ p.naziv_paketa }}</q-item-label>
                  <q-item-label caption>
                    {{ p.datum_pocetka }} → {{ p.datum_isteka }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    :color="statusBoja(p.status_pretplate)"
                    :label="p.status_pretplate"
                    size="sm"
                    rounded
                  >
                    <q-menu>
                      <q-list style="min-width: 140px">
                        <q-item-label header>Promijeni status</q-item-label>
                        <q-item
                          v-for="s in statusi"
                          :key="s"
                          clickable
                          v-close-popup
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
      loadingPretplate: false,
      statusi: ["aktivna", "istekla", "otkazana"],
      columns: [
        {
          name: "username",
          label: "Username",
          field: "username",
          align: "left",
          sortable: true,
        },
        {
          name: "ime",
          label: "Ime",
          field: "ime",
          align: "left",
          sortable: true,
        },
        {
          name: "prezime",
          label: "Prezime",
          field: "prezime",
          align: "left",
          sortable: true,
        },
        { name: "email", label: "Email", field: "email", align: "left" },
        {
          name: "uloga",
          label: "Uloga",
          field: "uloga",
          align: "center",
          sortable: true,
        },
        { name: "akcije", label: "Detalji", field: "akcije", align: "center" },
      ],
    };
  },

  async mounted() {
    if (this.jeAdmin) {
      await this.fetchKorisnici();
    }
  },

  methods: {
    async fetchKorisnici() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:3000/korisnici");
        this.korisnici = res.data;
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: "Greška kod dohvaćanja korisnika",
        });
      } finally {
        this.loading = false;
      }
    },

    async otvoriDetalje(korisnik) {
      this.odabraniKorisnik = korisnik;
      this.dialog = true;
      this.pretplate = [];
      this.loadingPretplate = true;
      try {
        const res = await axios.get(
          `http://localhost:3000/admin/pretplata/${korisnik.korisnik_id}`
        );
        this.pretplate = res.data;
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: "Greška kod dohvaćanja pretplata",
        });
      } finally {
        this.loadingPretplate = false;
      }
    },

    async promijeniStatus(pretplata, noviStatus) {
      try {
        await axios.put(
          `http://localhost:3000/admin/pretplata/${pretplata.pretplata_id}`,
          { status_pretplate: noviStatus }
        );
        pretplata.status_pretplate = noviStatus;
        this.$q.notify({
          type: "positive",
          message: "Status pretplate ažuriran",
        });
      } catch (err) {
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
