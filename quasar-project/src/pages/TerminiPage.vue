<template>
  <q-page class="q-pa-md">
    <div v-for="t in termini" :key="t.id">{{ t.datum }} - {{ t.vrijeme }}</div>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      termini: [],
    };
  },

  async mounted() {
    const res = await axios.get("http://localhost:3000/termini");
    this.termini = res.data;
  },
};
</script>
