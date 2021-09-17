import polygonMKAD from "../mkadCoords/coords";

export default {
  namespaced: true,
  state: {
    CENTER: [55.752277349454076, 37.62085099815628],
    MKAD_COORDS: polygonMKAD,
    ZOOM: 10,
    distance: {
      air: 0,
      car: 0,
    },
    currentCoords: [],
    startCoords: [],
    points: [],
    address: "",
    mkadPoligon: null,
    carRoute: null,
    airRoute: null,
    carPath: null,
    ymaps: null,
    map: null,
  },
  getters: {
    getAddress: (state) => state.address,
    carDistance: ({ distance }) => distance.car,
    airDistance: ({ distance }) => distance.air,
    mkadCoords: (state) => state.MKAD_COORDS,
    center: (state) => state.CENTER,
    zoom: (state) => state.ZOOM,
    map: (state) => state.map,
    ymaps: (state) => state.ymaps,
    markerCoord: (state) => state.currentCoords,
    notificationShow: (state) => state.notificationShow,
    address: (state) => state.address,
  },
  mutations: {
    ADD_POINT(state, point) {
      localStorage.lastPoint = JSON.stringify(point);
      state.points.push(point);
    },
    SET_YMAPS(state, ymaps) {
      state.ymaps = ymaps;
    },
    SET_MAP(state, map) {
      state.map = map;
    },
    SET_MKAD_POLIGON(state, mkadPoligon) {
      state.mkadPoligon = mkadPoligon;
    },
    SET_CURRENT_COORDS(state, coords) {
      state.currentCoords = coords;
    },
    SET_ADDRESS(state, address) {
      state.address = address;
    },
    SET_CAR_ROUTE(state, route) {
      state.carRoute = route;
    },
    SET_AIR_ROUTE(state, route) {
      state.airRoute = route;
    },
    SET_CAR_DISTANCE(state, distance) {
      state.distance.car = distance;
    },
    SET_AIR_DISTANCE(state, distance) {
      state.distance.air = distance;
    },
    SET_START_COORDS(state, loading) {
      state.startCoords = loading;
    },
    SET_PATH_CAR(state, roadPath) {
      state.carPath = roadPath;
    },
  },
  actions: {
    addPoint({ commit }, point) {
      commit("ADD_POINT", point);
    },
    setMap({ commit }, instance) {
      commit("SET_MAP", instance);
    },
    setYmaps({ commit }, ymaps) {
      commit("SET_YMAPS", ymaps);
    },
    setPathCar({ commit }, roadPath) {
      commit("SET_PATH_CAR", roadPath);
    },
    async buildRoutes({ commit, state, dispatch }, coords) {
      try {
        commit("SET_CURRENT_COORDS", coords);
        dispatch("findAddress");
        await dispatch("buildAirRoute");
        await dispatch("buildCarRoute");
        const pointData = {
          distance: state.distance,
          coords: [state.startCoords, state.currentCoords],
        };
        dispatch("addPoint", pointData);
      } catch (e) {
        console.error(e);
      }
    },
    async findAddress({ commit, state }) {
      const res = await state.ymaps.geocode(state.currentCoords);
      const address = res.geoObjects.get(0).getAddressLine();
      commit("SET_ADDRESS", address);
    },
    addMkadPoligon({ commit }, mkadPoligon) {
      commit("SET_MKAD_POLIGON", mkadPoligon);
    },
    async buildCarRoute({ commit, state }) {
      if (state.carRoute) {
        state.carRoute.removeFromMap(state.map);
        commit("SET_CAR_ROUTE", null);
      }
      const carRoute = state.ymaps
        .geoQuery(state.carPath.getPaths())
        .setOptions({
          strokeWidth: 5,
          strokeColor: "rgba(0, 119, 255, 0.5)",
        })
        .addToMap(state.map);
      commit("SET_CAR_ROUTE", carRoute);

      const distance = state.carPath.getLength();
      commit("SET_CAR_DISTANCE", distance);
    },
    async buildAirRoute({ commit, state, dispatch }) {
      if (state.airRoute) {
        state.airRoute.removeFromMap(state.map);
        commit("SET_AIR_ROUTE", null);
      }

      const path = state.ymaps.coordSystem.geo.solveInverseProblem(
        state.CENTER,
        state.currentCoords
      ).pathFunction;
      const distanceFromCenter = Math.round(
        state.ymaps.coordSystem.geo.getDistance(state.CENTER, path(1).point) /
          1000
      );
      const points = distanceFromCenter * 10;
      let edges = [];

      for (let i = 1; i <= points; i++) {
        edges.push({
          type: "LineString",
          coordinates: [path(i / points).point, path((i - 1) / points).point],
        });
      }

      const startCoords = await dispatch("findStartCoords", edges);
      commit("SET_START_COORDS", startCoords);
      edges = [
        {
          type: "LineString",
          coordinates: [startCoords, state.currentCoords],
        },
      ];

      const route = state.ymaps
        .geoQuery(edges)
        .setOptions({
          strokeColor: "rgba(0, 43, 92, 1)",
          strokeStyle: "dot",
          strokeWidth: 2,
        })
        .addToMap(state.map);
      commit("SET_AIR_ROUTE", route);

      const distance = state.ymaps.coordSystem.geo.getDistance(
        startCoords,
        state.currentCoords
      );
      commit("SET_AIR_DISTANCE", distance);
    },
    findStartCoords({ state }, routeObjects) {
      routeObjects = state.ymaps
        .geoQuery(routeObjects)
        .setOptions("visible", false)
        .addToMap(state.map);
      const objectsInMoscow = routeObjects
        .searchInside(state.mkadPoligon)
        .setOptions("visible", false)
        .addToMap(state.map);
      const objectsOutMoscow = routeObjects
        .remove(objectsInMoscow)
        .addToMap(state.map);
      routeObjects.removeFromMap(state.map);
      const startCoords = objectsOutMoscow.get(0).geometry.getCoordinates()[1];
      return startCoords;
    },
  },
};
