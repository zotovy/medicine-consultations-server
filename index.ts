import EnvHelper from "./helpers/env_helper";
new EnvHelper().loadEnv();

import Server from "./server";

async function main() {
    await Server.setupDatabase();
    await Server.setupExpress();
    await Server.setupModels();
    await Server.setupServer();
    await Server.setupSocketIO();
}

main();
