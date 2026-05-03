<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-primary q-mb-md">Moj profil</div>

    <!-- Avatar + osnovno -->
    <q-card bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-avatar size="72px" color="primary" text-color="white" class="text-h4">
            {{ inicijali }}
          </q-avatar>
          <div>
            <div class="text-h6">{{ user.ime }} {{ user.prezime }}</div>
            <div class="text-caption text-grey">@{{ user.username }}</div>
            <q-badge
              :color="user.uloga === 'admin' ? 'deep-orange' : 'primary'"
              class="q-mt-xs"
            >
              {{ user.uloga }}
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Osobni podaci -->
    <q-card bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          <q-icon name="person" class="q-mr-xs text-primary" />
          Osobni podaci
        </div>
        <q-list dense>
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Ime i prezime</q-item-label>
              <q-item-label>{{ user.ime }} {{ user.prezime }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="alternate_email" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Email</q-item-label>
              <q-item-label>{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="account_circle" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Korisničko ime</q-item-label>
              <q-item-label>{{ user.username }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Status pretplate -->
    <q-card v-if="user.uloga !== 'admin'" bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          <q-icon name="card_membership" class="q-mr-xs text-primary" />
          Pretplata
        </div>

        <div v-if="loadingPretplata" class="text-center q-py-md">
          <q-spinner-dots color="primary" />
        </div>

        <div v-else-if="pretplata && pretplata.aktivna">
          <q-banner class="bg-green-9 text-white rounded-borders q-mb-sm">
            <template v-slot:avatar>
              <q-icon name="check_circle" color="green" />
            </template>
            Pretplata je aktivna
          </q-banner>
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="sell" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Naziv paketa</q-item-label>
                <q-item-label>{{ pretplata.pretplata.naziv_paketa }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="euro" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Cijena</q-item-label>
                <q-item-label>{{ pretplata.pretplata.cijena }} €</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="calendar_today" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Vrijedi od</q-item-label>
                <q-item-label>{{ formatDatum(pretplata.pretplata.datum_pocetka) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="event_busy" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Ističe</q-item-label>
                <q-item-label>{{ formatDatum(pretplata.pretplata.datum_isteka) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div v-else>
          <q-banner class="bg-orange-9 text-white rounded-borders q-mb-sm">
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            Nemate aktivnu pretplatu. Bez pretplate ne možete rezervirati termine.
          </q-banner>
          <q-btn
            color="primary"
            label="Pogledaj cjenik"
            icon="sell"
            outline
            @click="$router.push('/app/cjenik')"
            class="full-width q-mt-sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Statistika -->
    <q-card v-if="user.uloga !== 'admin'" bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          <q-icon name="bar_chart" class="q-mr-xs text-primary" />
          Moje rezervacije
        </div>
        <div v-if="loadingRezervacije" class="text-center q-py-md">
          <q-spinner-dots color="primary" />
        </div>
        <div v-else class="row text-center q-col-gutter-sm">
          <div class="col-4">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="text-h5 text-primary">{{ ukupnoRezervacija }}</div>
                <div class="text-caption text-grey">Ukupno</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="text-h5 text-positive">{{ aktivneRezervacije }}</div>
                <div class="text-caption text-grey">Aktivne</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-4">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="text-h5 text-negative">{{ otkazaneRezervacije }}</div>
                <div class="text-caption text-grey">Otkazane</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <q-btn
          flat
          color="primary"
          label="Prikaži sve rezervacije"
          icon="event"
          class="full-width q-mt-md"
          @click="$router.push('/app/rezervacije')"
        />
      </q-card-section>
    </q-card>

    <!-- Odjava -->
    <q-btn
      color="negative"
      outline
      icon="logout"
      label="Odjavi se"
      class="full-width"
      @click="odjava"
    />
  </q-page>
</template>

<script>
import axios from 'axios';
import { useAuth } from 'src/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'ProfilPage',
  setup() {
    const auth = useAuth();
    const router = useRouter();
    return { auth, router };
  },
  data() {
    return {
      pretplata: null,
      loadingPretplata: true,
      rezervacije: [],
      loadingRezervacije: true,
    };
  },
  computed: {
    user() {
      return this.auth.state.user || {};
    },
    inicijali() {
      const ime = this.user.ime?.[0] || '';
      const prezime = this.user.prezime?.[0] || '';
      return (ime + prezime).toUpperCase() || '?';
    },
    ukupnoRezervacija() {
      return this.rezervacije.length;
    },
    aktivneRezervacije() {
      return this.rezervacije.filter(r => r.status_rezervacije === 'aktivna').length;
    },
    otkazaneRezervacije() {
      return this.rezervacije.filter(r => r.status_rezervacije === 'otkazana').length;
    },
  },
  async mounted() {
    const korisnik_id = this.user.korisnik_id;

    // Dohvati pretplatu
    try {
      const res = await axios.get(`http://localhost:3000/pretplata/${korisnik_id}`);
      this.pretplata = res.data;
    } catch (err) {
      console.log('Greška pri dohvaćanju pretplate', err);
    } finally {
      this.loadingPretplata = false;
    }

    // Dohvati rezervacije za statistiku
    try {
      const res = await axios.get(`http://localhost:3000/rezervacije/${korisnik_id}`);
      this.rezervacije = res.data;
    } catch (err) {
      console.log('Greška pri dohvaćanju rezervacija', err);
    } finally {
      this.loadingRezervacije = false;
    }
  },
  methods: {
    formatDatum(datum) {
      if (!datum) return '–';
      return datum.substring(0, 10);
    },
    odjava() {
      this.auth.logout();
      this.router.push('/');
    },
  },
};
</script>
