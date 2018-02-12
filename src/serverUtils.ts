import { DBSchema } from "./interfaces";
import * as args from "./args";
import * as bodyParser from "body-parser";
import * as dbUtils from "./dbUtils";
import * as express from "express";
import * as lowdb from "lowdb";
import * as utils from "./utils";
import * as uuid4 from "uuid/v4";

class ServerUtils {
	startServer(db: lowdb.Lowdb<DBSchema, lowdb.AdapterAsync>): void {
        const app = express();
        app.use(bodyParser.json());
        app.get("/*", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = this.getTableName(req);
                const recordID = this.getRecordID(req);
                dbUtils.initTable(db, tableName);
                const value = recordID ?
                    db.get(tableName).find({ id: recordID }).value() :
                    db.get(tableName).filter(req.query).value();
                res.status(200).send(value);
            }
        });
        app.post("/*", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = this.getTableName(req);
                dbUtils.initTable(db, tableName);
                const records = req.body;
                if (Array.isArray(records)) {
                    for (let i = 0; i < records.length; i++) {
                        const record = records[i];
                        record.id = uuid4();
                        db.get(tableName).push(record).value();
                    }
                    db.write();
                    res.status(201).send(records);
                } else {
                    const record = req.body;
                    record.id = uuid4();
                    db.get(tableName).push(record).write();
                    res.status(201).send(record);
                }
            }
        });
        app.put("/*", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = this.getTableName(req);
                const recordID = this.getRecordID(req);
                dbUtils.initTable(db, tableName);
                if (recordID) {
                    db.get(tableName).find({ id: recordID }).assign(req.body).write();
                } else {
                    db.get(tableName).filter(req.query).assign(req.body).write();
                }
                res.status(202).send();
            }
        });
        app.delete("/*", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = this.getTableName(req);
                const recordID = this.getRecordID(req);
                dbUtils.initTable(db, tableName);
                if (recordID) {
                    db.get(tableName).remove({ id: recordID }).write();
                } else {
                    db.get(tableName).remove(req.query).write();
                }
                res.status(200).send();
            }
        });
        app.listen(args.port);
    }

    getAppName(req: express.Request): string {
        return this.getFirstHeaderValue(req, "mcubed-app-name");
    }

    getAppKey(req: express.Request): string {
        return this.getFirstHeaderValue(req, "mcubed-app-key");
    }

    getFirstHeaderValue(req: express.Request, headerName: string): string {
        var headerValue = req.headers[headerName];
        if (Array.isArray(headerValue)) {
            return headerValue.length === 0 ? undefined: headerValue[0];
        } else {
            return headerValue;
        }
    }

    getTableName(req: express.Request): string {
        const path = req.path.substr(1);
        const firstSlash = path.indexOf("/");
        return utils.coerceTableName(firstSlash > -1 ? path.substr(0, firstSlash) : path);
    }

    getRecordID(req: express.Request): string {
        const path = req.path.substr(1);
        const firstSlash = path.indexOf("/");
        if (firstSlash > -1) {
            const offset = firstSlash + 1;
            const secondSlash = path.indexOf("/", offset);
            return secondSlash > -1 ? path.substr(offset, secondSlash - offset) : path.substr(offset);
        }
        return undefined;
    }

    /**
     * Validates the request to determine the request has access to the table.
     * @param db
     * @param req
     * @param res
     * @returns True if the request has access granted to the table. False if
     * the request has access denied to the table or if no table is specified.
     */
    validateRequest(db: lowdb.Lowdb<DBSchema, lowdb.AdapterAsync>, req: express.Request, res: express.Response): boolean {
        const tableName = this.getTableName(req);
        if (!tableName) {
            res.status(404).send({ error: "The table name must be specified with the request." });
            return false;
        }
        const appName = this.getAppName(req);
        const appKey = this.getAppKey(req);
        if (!appName || !appKey) {
            res.status(403).send({ error: "The application name and application key both need to be specified with the request." });
            return false;
        }
        if (!dbUtils.hasAccess(db, appName, appKey, tableName)) {
            res.status(403).send({ error: "The specified application does not have access to the specified table." });
            return false;
        }
        return true;
    }
}

const serverUtils: ServerUtils = new ServerUtils();
export = serverUtils;
