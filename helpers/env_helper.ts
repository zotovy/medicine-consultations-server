import dotenv from "dotenv";
import path from "path";

class EnvHelper {
    public loadEnv = (): void => {
        switch (process.env.MODE) {
            case "testing":
                this._loadEnv("testing", ".env.testing");
                break;
            case "production":
                this._loadEnv("production", ".env");
                break;
            case "dev":
                this._loadEnv("dev", ".env.dev");
                break;
            case "fake":
                this._loadEnv("fake", "fake.env");
                break;
            default:
                console.error("no MODE specefied");
        }
    };

    private _loadEnv = (mode: string, envPath: string): void => {
        console.log(`server running in ${mode} mode`);
        const result = dotenv.config({
            path: path.join(__dirname, `../configs/${envPath}`),
        });
        if (result.error) console.error(result.error);
    };
}

export default EnvHelper;
