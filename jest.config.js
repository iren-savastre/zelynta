// Jest — teste unitare pentru logica pură din utils/ (preset Expo).
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};
