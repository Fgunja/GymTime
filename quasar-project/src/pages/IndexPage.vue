<template>
  <q-page class="bg-grey-2">
    <!-- HERO SECTION -->
    <div class="hero q-pa-xl flex flex-center text-center">
      <div>
        <h1 class="text-primary text-weight-bold q-mb-sm">GymTime</h1>

        <h5 class="text-grey-8 q-mb-lg">
          Pametna aplikacija za rezervaciju trening termina
        </h5>

        <p class="text-grey-7" style="max-width: 700px; margin: 0 auto">
          Organiziraj svoje treninge bez stresa. Rezerviraj termine, prati
          dostupnost i upravljaj svojim rasporedom u samo par klikova.
        </p>

        <!-- CTA -->
        <div class="q-mt-lg">
          <q-btn
            v-if="!auth.state.user"
            color="primary"
            label="Prijava"
            to="/login"
            class="q-mr-sm"
          />

          <q-btn
            v-if="!auth.state.user"
            outline
            color="primary"
            label="Registracija"
            to="/register"
          />

          <div v-else class="text-positive text-subtitle1">
            Prijavljen kao: <b>{{ auth.state.user.username }}</b>
          </div>
        </div>
      </div>
    </div>

    <!-- IMAGE SECTION -->
    <div class="q-pa-md flex flex-center">
      <q-img
        src="https://thefitness-shop.com.au/wp-content/uploads/2022/07/NRG-Gym-Essendon-1.jpg"
        style="max-width: 900px; width: 100%; border-radius: 20px"
        class="shadow-10"
      />
    </div>

    <!-- FEATURES -->
    <div class="q-pa-xl bg-white">
      <div class="text-center q-mb-lg">
        <h4 class="text-primary">Što možeš raditi?</h4>
      </div>

      <div class="row q-col-gutter-lg justify-center">
        <div class="col-12 col-md-3 text-center">
          <q-icon name="event" size="56px" color="primary" />
          <h6>Rezervacija termina</h6>
          <p class="text-grey-7">Brzo i jednostavno rezerviraj trening.</p>
        </div>

        <div class="col-12 col-md-3 text-center">
          <q-icon name="schedule" size="56px" color="primary" />
          <h6>Praćenje rasporeda</h6>
          <p class="text-grey-7">Uvijek znaš kada treniraš.</p>
        </div>

        <div class="col-12 col-md-3 text-center">
          <q-icon name="notifications" size="56px" color="primary" />
          <h6>Obavijesti</h6>
          <p class="text-grey-7">Bitne informacije na jednom mjestu.</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useAuth } from "src/auth";

export default {
  setup() {
    const auth = useAuth();
    return { auth };
  },
};
</script>

<style scoped>
.hero {
  min-height: 60vh;
  background: linear-gradient(to bottom, #ffffff, #f3f3f3);
}
</style>
