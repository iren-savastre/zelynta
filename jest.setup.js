// Mock pentru AsyncStorage în teste (logica pură nu atinge storage-ul real).
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
