<template>
  <q-layout>
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- 🔥 SMART TITLE -->
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
import { useAuth } from "src/auth";
import { useRouter } from "vue-router";

export default {
  setup() {
    const auth = useAuth();
    const router = useRouter();

    const goHome = () => {
      const user = auth.state.user;

      // 👤 guest
      if (!user) {
        router.push("/");
        return;
      }

      // 👑 admin
      if (user.uloga === "admin") {
        router.push("/admin");
        return;
      }

      // 👤 user
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
