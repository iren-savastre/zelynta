// Jest — teste unitare pentru logica pură din utils/ (preset Expo).
// Jest — unit tests for the pure logic in utils/ (Expo preset).
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};
