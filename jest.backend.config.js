export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  // which test to run
  testMatch: [
    "<rootDir>/controllers/authController.test.js", // Only running authController in controllers
    "<rootDir>/config/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
  ],

  // configure dotenv file
  setupFiles: ["dotenv/config"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/authController.{js,jsx}", // Only covering authController in controllers
    "config/**",
    "helpers/**",
    "middlewares/**"
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
