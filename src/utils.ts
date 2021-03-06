import { ActionType } from "./interfaces";
import * as CryptoJS from "crypto-js";
import * as mkdirp from "mkdirp";
import * as os from "os";
import * as process from "process";

class Utils {
    validActionTypes(): string[] {
        const values: string[] = [];
        for (let x in ActionType) {
            if (!Number(x)) {
                values.push(x);
            }
        }
        return values;
    }

    coerceActionType(actionType: string): ActionType {
        for (let x in ActionType) {
            if (this.equalsIgnoreCase(x, actionType) && !Number(x)) {
                return <any>ActionType[x];
            }
        }
        return undefined;
    }

    coerceInt(value: string): number {
        const parsed = parseInt(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }

    coerceFloat(value: string): number {
        const parsed = parseFloat(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }

    coerceTableName(tableName: string): string {
        if (!tableName || tableName === "*") {
            return "";
        }
        return tableName.toLowerCase();
    }

    equalsIgnoreCase(strA: string, strB: string): boolean {
        if (strA) {
            return new RegExp(`^${strA}$`, "i").test(strB);
        }
        return !strB;
    }

    encrypt(data: string, key: string): string {
        return CryptoJS.AES.encrypt(data, key).toString();
    }

    decrypt(data: string, key: string): string {
        return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    }

    getDefaultDBPath(): string {
        const penv: any = process.env;
        let home = penv.LOCALAPPDATA;
        if (!home) {
            home = penv.APPDATA;
            if (!home) {
                home = os.homedir();
            }
        }
        const dbDir = `${home}/mcubed-persistence`;
        mkdirp.sync(dbDir);
        return `${dbDir}/mCubedDB.json`;
    }
}

export default new Utils();
