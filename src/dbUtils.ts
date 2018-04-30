import { DBSchema } from "./interfaces";
import args from "./args";
import * as fs from "fs";
import utils from "./utils";

class DBUtils {
    readDB(): DBSchema {
        try {
            if (!fs.existsSync(args.dbPath)) {
                return {
                    mAccess: [],
                    mApps: []
                };
            }
            const data = fs.readFileSync(args.dbPath, "utf8");
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

    writeDB(db: DBSchema): void {
        if (db) {
            const data = utils.encrypt(JSON.stringify(db), args.password);
            fs.writeFileSync(args.dbPath, data, "utf8");
        }
    }

    newDB(): DBSchema {
        return this.readDB();
    }

    initTable(db: DBSchema, tableName: string): void {
        if (!Array.isArray(db[tableName])) {
            db[tableName] = [];
        }
    }

    isRestrictedTable(tableName: string): boolean {
        // Restricted tables, note tableName is toLowerCased() on startup
        return "mapps" === tableName || "maccess" === tableName;
    }

    hasAccess(db: DBSchema, appName: string, appKey: string, tableName: string): boolean {
        if (this.isRestrictedTable(tableName)) {
            return false;
        }
        this.initTable(db, "mApps");
        const app = db.mApps.find(app => this.filterDBRecord({ appName: appName, appKey: appKey }, app));
        if (!app) {
            return false;
        }
        this.initTable(db, "mAccess");
        const access = db.mAccess.find(access => this.filterDBRecord({ appName: appName, tableName: tableName }, access));
        if (access) {
            return access.hasAccess;
        }
        const allAccess = db.mAccess.find(access => this.filterDBRecord({ appName: appName, tableName: "*" }, access));
        if (allAccess) {
            return allAccess.hasAccess;
        }
        return false;
    }

    find(db: DBSchema, tableName: string, searchObj: any): any {
        const arr = db[tableName];
        if (!Array.isArray(arr)) {
            return undefined;
        }
        return arr.find(dbRecord => this.filterDBRecord(searchObj, dbRecord));
    }

    filter(db: DBSchema, tableName: string, searchObj: any): any[] {
        const arr = db[tableName];
        if (!Array.isArray(arr)) {
            return undefined;
        }
        return arr.filter(dbRecord => this.filterDBRecord(searchObj, dbRecord));
    }

    push(db: DBSchema, tableName: string, record: any): void {
        const arr = db[tableName];
        if (Array.isArray(arr)) {
            arr.push(record);
        }
    }

    remove(db: DBSchema, tableName: string, record: any): void {
        const arr = db[tableName];
        if (Array.isArray(arr)) {
            const index = arr.indexOf(record);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
    }

    unset(db: DBSchema, tableName: string): void {
        delete db[tableName];
    }

    filterDBRecord(searchObj: any, dbRecord: any): boolean {
        for (const searchProperty of Object.getOwnPropertyNames(searchObj)) {
            const insensitiveIndex = searchProperty.indexOf("-insensitive");
            const propertyName = insensitiveIndex > -1 ? searchProperty.substr(0, insensitiveIndex) : searchProperty;
            const queryValue = searchObj[searchProperty];
            const recordValue = dbRecord[propertyName];
            if (insensitiveIndex > -1 && typeof queryValue === "string" && typeof recordValue === "string") {
                if (queryValue.toLowerCase() !== recordValue.toLowerCase()) {
                    return false;
                }
            } else if (queryValue !== recordValue) {
                return false;
            }
        }
        return true;
    }
}

export default new DBUtils();
