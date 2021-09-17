<template>
  <v-app>
    <v-main>
      <Ymap />
    </v-main>
  </v-app>
</template>

<script>
import Ymap from "./components/Ymap";

export default {
  name: "App",

  components: {
    Ymap,
  },
};
</script>
