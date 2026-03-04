/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".jsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
