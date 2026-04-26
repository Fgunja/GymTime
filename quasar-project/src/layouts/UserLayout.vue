<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- TITLE -->
        <q-toolbar-title
          class="cursor-pointer text-weight-bold"
          @click="goHome"
        >
          GymTime
        </q-toolbar-title>

        <!-- GUEST -->
        <div v-if="!auth.state.user" class="row q-gutter-sm">
          <q-btn flat label="Prijava" to="/login" />
          <q-btn flat label="Registracija" to="/register" />
          <q-btn flat label="Cjenik" to="/cjenik" />
        </div>

        <!-- LOGGED USER -->
        <div v-else class="row items-center q-gutter-sm">
          👤 {{ auth.state.user.username }}

          <q-btn flat icon="logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-if="auth.state.user" show-if-above bordered>
      <q-list>
        <q-item to="/app" clickable>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item to="/app/termini" clickable>
          <q-item-section>Termini</q-item-section>
        </q-item>

        <q-item to="/app/rezervacije" clickable>
          <q-item-section>Rezervacije</q-item-section>
        </q-item>

        <q-item to="/app/obavijesti" clickable>
          <q-item-section>Obavijesti</q-item-section>
        </q-item>

        <!-- 🔥 CJENIK DODAN U APP DIO -->
        <q-item to="/cjenik" clickable>
          <q-item-section>Cjenik</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- CONTENT -->
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

    const goHome = () => {
      const user = auth.state.user;

      // guest
      if (!user) {
        router.push("/");
        return;
      }

      // logged (user + trainer + admin)
      router.push("/app");
    };

    const logout = () => {
      auth.logout();
      router.push("/");
    };

    return {
      auth,
      goHome,
      logout,
    };
  },
};
</script>
