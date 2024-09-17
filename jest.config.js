// module.exports = {
//   clearMocks: true,
//   roots: ['<rootDir>'],
//   testEnvironment: 'node',
//   transform: {
//     transform_regex: ['ts-jest', { '^.+\\.ts?$': 'ts-jest' }],
//   },
//   setupFilesAfterEnv: ['jest-extended'],
//   globals: {
//     'ts-jest': {
//       diagnostics: false,
//     },
//   },
//   moduleFileExtensions: ['js', 'json', 'ts'],
//   rootDir: 'src',
//   testRegex: '.*\\.spec\\.ts$',
//   collectCoverageFrom: ['**/*.(t|j)s'],
//   coverageDirectory: '../coverage',
//   moduleNameMapper: {
//     '^~/(.*)$': '<rootDir>/$1',
//   },
// };

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
};
