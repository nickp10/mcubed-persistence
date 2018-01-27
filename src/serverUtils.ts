import { DBSchema } from "./interfaces";
import * as args from "./args";
import * as bodyParser from "body-parser";
import * as dbUtils from "./dbUtils";
import * as express from "express";
import * as lowdb from "lowdb";
import * as utils from "./utils";

class ServerUtils {
	startServer(db: lowdb.Lowdb<DBSchema, lowdb.AdapterAsync>): void {
        const app = express();
        app.use(bodyParser.json());
        app.get("/*", (req, res) => {
            const tableName = this.validateRequest(db, req, res);
            if (tableName) {
                dbUtils.initTable(db, tableName);
                const value = db.get(tableName).filter(req.query).value();
                res.status(200).send(value);
            }
        });
        app.post("/*", (req, res) => {
            const tableName = this.validateRequest(db, req, res);
            if (tableName) {
                dbUtils.initTable(db, tableName);
                db.get(tableName).push(req.body).write();
                res.status(201).send();
            }
        });
        app.delete("/*", (req, res) => {
            const tableName = this.validateRequest(db, req, res);
            if (tableName) {
                dbUtils.initTable(db, tableName);
                db.get(tableName).remove(req.query).write();
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

    /**
     * Validates the request to determine the request has access to the table.
     * @param db
     * @param req
     * @param res
     * @returns The table name of the request with access granted. Undefined
     * if no table name is specified or if no access is granted.
     */
    validateRequest(db: lowdb.Lowdb<DBSchema, lowdb.AdapterAsync>, req: express.Request, res: express.Response): string {
        const tableName = this.getTableName(req);
        if (!tableName) {
            res.status(404).send({ error: "The table name must be specified with the request." });
            return undefined;
        }
        const appName = this.getAppName(req);
        const appKey = this.getAppKey(req);
        if (!appName || !appKey) {
            res.status(403).send({ error: "The application name and application key both need to be specified with the request." });
            return undefined;
        }
        if (!dbUtils.hasAccess(db, appName, appKey, tableName)) {
            res.status(403).send({ error: "The specified application does not have access to the specified table." });
            return undefined;
        }
        return tableName;
    }
}

const serverUtils: ServerUtils = new ServerUtils();
export = serverUtils;
