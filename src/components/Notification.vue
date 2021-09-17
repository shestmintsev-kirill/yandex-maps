<template>
  <transition name="notification">
    <v-card elevation="5" class="notification" v-if="notificationShow">
      <v-container class="close-wrapper d-flex justify-end">
        <v-btn icon>
          <v-icon color="error" @click="$emit('closeModal')"
            >mdi-close-box
          </v-icon>
        </v-btn>
      </v-container>
      <v-card-title class="justify-center"
        >Уведомление
        <v-icon>mdi-map-check</v-icon>
      </v-card-title>
      <v-card-subtitle class="pb-0"
        >Текущий адрес: {{ getAddress }}</v-card-subtitle
      >
      <v-card-actions>
        <v-btn @click="show = !show" color="blue lighten-2" text>
          Расстояние
        </v-btn>
        <v-spacer></v-spacer>
        <v-icon :color="show ? 'blue' : null">mdi-map-marker-distance</v-icon>
        <v-btn @click="show = !show" icon>
          <v-icon>{{ show ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
        </v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>
          <v-card-subtitle wigth="400" class="d-flex flex-column align-center">
            <span
              >Расстояние на машине:
              {{ distanceCar }}
            </span>
            <br />
            <span
              >Расстояние по воздуху:
              {{ distanceAir }}
            </span>
          </v-card-subtitle>
        </div>
      </v-expand-transition>
    </v-card>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Notification",
  props: {
    notificationShow: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    ...mapGetters({
      carDistance: "ymap/carDistance",
      airDistance: "ymap/airDistance",
      getAddress: "ymap/getAddress",
      address: "ymap/address",
    }),
    distanceCar() {
      return this.calculateDistance(this.carDistance);
    },
    distanceAir() {
      return this.calculateDistance(this.airDistance);
    },
  },
  methods: {
    calculateDistance(distance) {
      if (distance && parseInt(distance) > 0) {
        let formatDisstance;
        if (distance > 1000) {
          formatDisstance = Math.round(distance / 1000) + " км";
        } else {
          formatDisstance = Math.round(distance) + " м";
        }
        return formatDisstance;
      } else {
        return 0;
      }
    },
  },
};
</script>

<style scoped>
.notification {
  max-width: 400px;
}
.close-wrapper {
  position: absolute;
  top: 0;
  right: 0;
}
.notification-enter-active {
  animation: show 0.3s;
}
.notification-leave-active {
  animation: close 0.3s;
}
@keyframes show {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes close {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0);
  }
}
</style>
