module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    setupFilesAfterEnv: ["./jest-preload.js"],

    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
