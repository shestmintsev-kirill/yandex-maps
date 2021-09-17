<template>
  <v-layout class="map__wrap">
    <yandex-map
      @map-was-initialized="initMap"
      @click="clickOnMap"
      :coords="center"
      :zoom="zoom"
    >
      <ymap-marker marker-id="marker" :coords="markerCoord" />
    </yandex-map>
    <div class="notification__wrap">
      <Notification
        @closeModal="notificationShow = false"
        :notificationShow="notificationShow"
      />
    </div>
  </v-layout>
</template>

<script>
import { yandexMap, ymapMarker } from "vue-yandex-maps";
import Notification from "@/components/Notification";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { yandexMap, ymapMarker, Notification },
  name: "Map",
  data: () => ({
    route: null,
    secondRoute: null,
    notificationShow: false,
    points: [],
    point: {},
  }),
  computed: {
    ...mapGetters({
      mkadCoords: "ymap/mkadCoords",
      center: "ymap/center",
      zoom: "ymap/zoom",
      map: "ymap/map",
      ymaps: "ymap/ymaps",
      markerCoord: "ymap/markerCoord",
    }),
  },
  methods: {
    ...mapActions({
      buildRoutes: "ymap/buildRoutes",
      addMkadPoligon: "ymap/addMkadPoligon",
      setMap: "ymap/setMap",
      setYmaps: "ymap/setYmaps",
      setPathCar: "ymap/setPathCar",
    }),
    initMap(instance) {
      try {
        this.setMap(instance);
        this.setYmaps(window.ymaps);
        const mkadPoligon = new this.ymaps.Polygon(this.mkadCoords);
        this.addMkadPoligon(mkadPoligon);
        this.ymaps.geoQuery(mkadPoligon).addToMap(this.map);
      } catch (e) {
        console.error(e);
      }
    },
    async clickOnMap(e) {
      const coords = e.get("coords");

      let allMkadMarks = [];
      for (let i = 0; i < this.mkadCoords[0].length; i++)
        allMkadMarks[i] = new this.ymaps.Placemark(this.mkadCoords[0][i]);
      let allMkadMarksResult = this.ymaps
        .geoQuery(allMkadMarks)
        .addToMap(this.map)
        .setOptions("visible", false);
      let closestObject = allMkadMarksResult.getClosestTo(coords);
      const roadPath = await this.ymaps.route([
        closestObject.geometry.getCoordinates(),
        coords,
      ]);
      this.setPathCar(roadPath);

      this.notificationShow = false;
      await this.buildRoutes(coords);
      this.notificationShow = true;
    },
  },
};
</script>

<style scoped>
.map__wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
.ymap-container {
  width: 100%;
  height: 100%;
}
.notification__wrap {
  position: absolute;
  top: 50px;
  right: 10px;
}
</style>
