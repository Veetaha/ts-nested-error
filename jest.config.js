module.exports = {
    globals: {
        'ts-jest': {
            compiler: "ttypescript"
        }
    },
    preset: "ts-jest",
    moduleFileExtensions: [ "ts", "js" ],
    testRegex: "\\.test\\.ts$",
    coverageDirectory: "coverage",
    testEnvironment: "node",
    collectCoverage: true
};
