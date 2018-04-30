import { DBSchema } from "./interfaces";
import args from "./args";
import * as bodyParser from "body-parser";
import dbUtils from "./dbUtils";
import * as express from "express";
import utils from "./utils";
import * as uuid4 from "uuid/v4";

class ServerUtils {
    startServer(db: DBSchema): void {
        const app = express();
        app.use(bodyParser.json());
        app.get("/:tableName/:recordID?", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = req.params.tableName;
                const recordID = req.params.recordID;
                dbUtils.initTable(db, tableName);
                const value = recordID ?
                    dbUtils.find(db, tableName, { id: recordID }) :
                    dbUtils.filter(db, tableName, req.query);
                res.status(200).send(value);
            }
        });
        app.post("/:tableName", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = req.params.tableName;
                dbUtils.initTable(db, tableName);
                const records = req.body;
                if (Array.isArray(records)) {
                    for (let i = 0; i < records.length; i++) {
                        const record = records[i];
                        record.id = uuid4();
                        dbUtils.push(db, tableName, record);
                    }
                    dbUtils.writeDB(db);
                    res.status(201).send(records);
                } else {
                    const record = req.body;
                    record.id = uuid4();
                    dbUtils.push(db, tableName, record);
                    dbUtils.writeDB(db);
                    res.status(201).send(record);
                }
            }
        });
        app.put("/:tableName/:recordID?", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = req.params.tableName;
                const recordID = req.params.recordID;
                dbUtils.initTable(db, tableName);
                if (recordID) {
                    const record = dbUtils.find(db, tableName, { id: recordID });
                    if (record) {
                        Object.assign(record, req.body);
                        dbUtils.writeDB(db);
                    }
                } else {
                    const records = dbUtils.filter(db, tableName, req.query);
                    if (Array.isArray(records)) {
                        for (const record of records) {
                            Object.assign(record, req.body);
                        }
                        dbUtils.writeDB(db);
                    }
                }
                res.status(202).send();
            }
        });
        app.delete("/:tableName/:recordID?", (req, res) => {
            if (this.validateRequest(db, req, res)) {
                const tableName = req.params.tableName;
                const recordID = req.params.recordID;
                dbUtils.initTable(db, tableName);
                if (recordID) {
                    const record = dbUtils.find(db, tableName, { id: recordID });
                    if (record) {
                        dbUtils.remove(db, tableName, record);
                        dbUtils.writeDB(db);
                    }
                } else {
                    const records = dbUtils.filter(db, tableName, req.query);
                    if (Array.isArray(records)) {
                        for (const record of records) {
                            dbUtils.remove(db, tableName, record);
                        }
                        dbUtils.writeDB(db);
                    }
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

    /**
     * Validates the request to determine the request has access to the table.
     * @param db
     * @param req
     * @param res
     * @returns True if the request has access granted to the table. False if
     * the request has access denied to the table or if no table is specified.
     */
    validateRequest(db: DBSchema, req: express.Request, res: express.Response): boolean {
        const tableName = req.params.tableName;
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

export default new ServerUtils();
