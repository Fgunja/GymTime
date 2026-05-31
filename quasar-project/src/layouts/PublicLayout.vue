<template>
  <q-layout>
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title
          class="cursor-pointer text-weight-bold"
          style="flex-shrink: 0; font-size: 14px"
          @click="goHome"
        >
          GymTime
        </q-toolbar-title>

        <!-- GUEST -->
        <div v-if="!auth.state.user" class="row q-gutter-xs">
          <q-btn flat dense label="Prijava" to="/login" />
          <q-btn flat dense icon="person_add" to="/register" />
          <q-btn flat dense icon="sell" to="/cjenik" />
          <q-btn flat dense icon="help" @click="otvoriUpute" />
        </div>

        <!-- LOGGED USER -->
        <div v-else class="row items-center q-gutter-sm">
          👤 {{ auth.state.user.username }}
          <q-btn flat icon="logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { Browser } from "@capacitor/browser";
import { useAuth } from "src/auth";
import { useRouter } from "vue-router";

export default {
  setup() {
    const auth = useAuth();
    const router = useRouter();

    const goHome = () => {
      const user = auth.state.user;
      if (!user) {
        router.push("/");
        return;
      }
      router.push("/app");
    };

    const logout = () => {
      auth.logout();
      router.push("/");
    };

    const otvoriUpute = async () => {
      try {
        await Browser.open({
          url: "https://docs.google.com/viewer?url=https://gymtime-production.up.railway.app/upute.pdf",
        });
      } catch (e) {
        window.open(
          "https://docs.google.com/viewer?url=https://gymtime-production.up.railway.app/upute.pdf",
          "_blank"
        );
      }
    };

    return { auth, goHome, logout, otvoriUpute };
  },
};
</script>
