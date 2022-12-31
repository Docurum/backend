/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    "@src(.*)": "<rootDir>/src/$1",
    "@v1(.*)": "<rootDir>/src/v1/$1",
  },
  setupFilesAfterEnv: ["jest-extended/all"],
};
