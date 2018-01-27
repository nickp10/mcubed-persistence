import { ActionType } from "./interfaces";
import * as argv from "argv";
import * as utils from "./utils";

class Args {
    action: ActionType;
    dbPath: string;
    appKey: string;
    appName: string;
    tableName: string;
    password: string;
	port: number;

	constructor() {
		const args = argv
            .option({ name: "action", short: "a", type: "string" })
            .option({ name: "dbPath", short: "db", type: "string" })
            .option({ name: "appKey", type: "string" })
            .option({ name: "appName", type: "string" })
            .option({ name: "tableName", type: "string" })
            .option({ name: "password", type: "string" })
			.option({ name: "port", short: "p", type: "number" })
			.run();
		const argAction = args.options["action"];
		const argDBPath = args.options["dbPath"];
        const argAppKey = args.options["appKey"];
        const argAppName = args.options["appName"];
        const argTableName = args.options["tableName"];
        const argPassword = args.options["password"];
        const argPort = utils.coerceInt(args.options["port"]);
        this.validate(argAction, argDBPath, argAppKey, argAppName, argTableName, argPassword, argPort);
	}

	validate(argAction: string, argDBPath: string, argAppKey: string, argAppName: string, argTableName: string, argPassword: string, argPort: number): void {
		// Validate action
		this.action = utils.coerceActionType(argAction) || ActionType.Start;
		if (!this.action) {
			console.error("The -a or --action argument must be one of: " + utils.validActionTypes().join(", "));
			process.exit();
        }

        // Validate dbPath
        this.dbPath = argDBPath || "mCubedDB.json";
        if (!this.dbPath) {
            console.error("The -db or --dbPath argument must be supplied.");
            process.exit();
        }

        // Validate appKey
        this.appKey = argAppKey;
        if (this.action === ActionType.HasAccess) {
            if (!this.appKey) {
                console.error("The --appKey argument must be supplied.");
                process.exit();
            }
        }

        // Validate appName
        this.appName = argAppName;
        if (this.action === ActionType.CreateAppKey ||
            this.action === ActionType.GetAppKey ||
            this.action === ActionType.AllowAllTables ||
            this.action === ActionType.AllowTable ||
            this.action === ActionType.DenyAllTables ||
            this.action === ActionType.DenyTable ||
            this.action === ActionType.HasAccess) {
            if (!this.appName) {
                console.error("The --appName argument must be supplied.");
                process.exit();
            }
        }

        // Validate tableName
        this.tableName = utils.coerceTableName(argTableName);
        if (this.action === ActionType.AllowTable ||
            this.action === ActionType.DenyTable ||
            this.action === ActionType.HasAccess) {
            if (!this.tableName) {
                console.error("The --tableName argument must be supplied.");
                process.exit();
            }
        }

        // Validate password
        this.password = argPassword;
		if (!this.password) {
			console.error("The --password argument must be supplied.");
			process.exit();
		}

        // Validate port
        this.port = argPort || 8000;
		if (this.action === ActionType.Start && !this.port) {
			console.error("The -p or --port argument must be supplied.");
			process.exit();
		}
	}
}

const args: Args = new Args();
export = args;
