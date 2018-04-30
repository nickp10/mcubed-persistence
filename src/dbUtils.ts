import { DBSchema } from "./interfaces";
import * as args from "./args";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as lowdb from "lowdb";
import * as utils from "./utils";

class DBUtils {
    newDB(): Promise<lowdb.LowdbAsync<DBSchema>> {
        const adapter = new FileAsync<DBSchema>(args.dbPath, {
            serialize: (data) => utils.encrypt(JSON.stringify(data), args.password),
            deserialize: (data) => {
                try {
                    return JSON.parse(utils.decrypt(data, args.password));
                } catch {
                    console.error(
                        "An invalid password has been specified. " +
                        "You must enter the same password for every command issued to this module. " +
                        "The password cannot be recovered. " +
                        `If you do not remember the password, you may manually delete the ${args.dbPath} file. ` +
                        "This means you will lose all of your data stored by this module."
                    );
                    process.exit();
                }
            }
        });
        return lowdb(adapter);
    }

    initTable(db: lowdb.LowdbAsync<DBSchema>, tableName: string): void {
        const defaults = { };
        defaults[tableName] = [];
        db.defaults(defaults).write();
    }

    isRestrictedTable(tableName: string): boolean {
        // Restricted tables, note tableName is toLowerCased() on startup
        return "mapps" === tableName || "maccess" === tableName;
    }

    hasAccess(db: lowdb.LowdbAsync<DBSchema>, appName: string, appKey: string, tableName: string): boolean {
        if (this.isRestrictedTable(tableName)) {
            return false;
        }
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: appName, appKey: appKey }).value();
        if (!app) {
            return false;
        }
        dbUtils.initTable(db, "mAccess");
        const access = db.get("mAccess").find({ appName: appName, tableName: tableName }).value();
        if (access) {
            return access.hasAccess;
        }
        const allAccess = db.get("mAccess").find({ appName: appName, tableName: "*" }).value();
        if (allAccess) {
            return allAccess.hasAccess;
        }
        return false;
    }
}

const dbUtils: DBUtils = new DBUtils();
export = dbUtils;
