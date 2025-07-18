// For a detailed explanation regarding each configuration property, visit:
//
//     https://jestjs.io/docs/en/configuration.html
//

module.exports = {
  // Helps make snapshot tests more readable.
  // "snapshotSerializers": ["enzyme-to-json/serializer"],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: ["<rootDir>/enzyme.config.js"],

  // Spit HTML coverage.
  coverageReporters: ["html", "json"],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    // Mock CSS modules as in https://jestjs.io/docs/en/webpack#mocking-css-modules
    "\\.(css|less)$": "identity-obj-proxy"
  }
};
