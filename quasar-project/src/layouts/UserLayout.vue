<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title
          class="cursor-pointer text-weight-bold"
          @click="$router.push('/app')"
        >
          GymTime
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          👤 {{ auth.state.user?.username }}
          <q-btn flat icon="logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above bordered>
      <q-list>
        <!-- KORISNIČKE STRANICE -->
        <q-item-label header class="text-grey-7">Izbornik</q-item-label>

        <q-item to="/app" exact clickable v-ripple>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Početna</q-item-section>
        </q-item>

        <q-item to="/app/termini" clickable v-ripple>
          <q-item-section avatar
            ><q-icon name="fitness_center"
          /></q-item-section>
          <q-item-section>Termini</q-item-section>
        </q-item>

        <q-item to="/app/rezervacije" clickable v-ripple>
          <q-item-section avatar><q-icon name="event" /></q-item-section>
          <q-item-section>Rezervacije</q-item-section>
        </q-item>

        <q-item to="/app/obavijesti" clickable v-ripple>
          <q-item-section avatar
            ><q-icon name="notifications"
          /></q-item-section>
          <q-item-section>Obavijesti</q-item-section>
        </q-item>

        <q-item to="/app/cjenik" clickable v-ripple>
          <q-item-section avatar><q-icon name="sell" /></q-item-section>
          <q-item-section>Cjenik</q-item-section>
        </q-item>

        <!-- ADMIN SEKCIJA - samo za admina -->
        <template v-if="auth.state.user?.uloga === 'admin'">
          <q-separator class="q-my-sm" />
          <q-item-label header class="text-grey-7">Admin</q-item-label>

          <q-item to="/app/korisnici" clickable v-ripple>
            <q-item-section avatar><q-icon name="people" /></q-item-section>
            <q-item-section>Pregled korisnika</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAuth } from "src/auth";
import { useRouter } from "vue-router";

export default {
  setup() {
    const auth = useAuth();
    const router = useRouter();

    const logout = () => {
      auth.logout();
      router.push("/");
    };

    return { auth, logout };
  },
};
</script>
