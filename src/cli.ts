import "core-js/stable";
import "regenerator-runtime/runtime";

import { ActionType, DBApp } from "./interfaces";
import args from "./args";
import dbUtils from "./dbUtils";
import serverUtils from "./serverUtils";
import { v4 as uuidv4 } from "uuid";

const db = dbUtils.newDB();
if (args.action === ActionType.CreateAppKey) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        console.log(`The application ${args.appName} has been found. Use this value to authenticate the application: ${app.appKey}`);
    } else {
        const appKey = uuidv4();
        dbUtils.push(db, "mApps", { appName: args.appName, appKey: appKey });
        dbUtils.writeDB(db);
        console.log(`An application key has been created for ${args.appName}. Use this value to authenticate the application: ${appKey}`);
    }
} else if (args.action === ActionType.GetAppKey) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        console.log(`The application ${args.appName} has been found. Use this value to authenticate the application: ${app.appKey}`);
    } else {
        console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
    }
} else if (args.action === ActionType.AllowTable) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        dbUtils.initTable(db, "mAccess");
        const accessRecords = dbUtils.filter(db, "mAccess", { appName: args.appName, tableName: args.tableName });
        if (Array.isArray(accessRecords)) {
            for (const accessRecord of accessRecords) {
                dbUtils.remove(db, "mAccess", accessRecord);
            }
        }
        dbUtils.push(db, "mAccess", { appName: args.appName, tableName: args.tableName, hasAccess: true });
        dbUtils.writeDB(db);
        console.log(`Successfully allowed table ${args.tableName} to application ${args.appName}.`);
    } else {
        console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
    }
} else if (args.action === ActionType.DenyTable) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        dbUtils.initTable(db, "mAccess");
        const accessRecords = dbUtils.filter(db, "mAccess", { appName: args.appName, tableName: args.tableName });
        if (Array.isArray(accessRecords)) {
            for (const accessRecord of accessRecords) {
                dbUtils.remove(db, "mAccess", accessRecord);
            }
        }
        dbUtils.push(db, "mAccess", { appName: args.appName, tableName: args.tableName, hasAccess: false });
        dbUtils.writeDB(db);
        console.log(`Successfully denied table ${args.tableName} to application ${args.appName}`);
    } else {
        console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
    }
} else if (args.action === ActionType.AllowAllTables) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        dbUtils.initTable(db, "mAccess");
        const accessRecords = dbUtils.filter(db, "mAccess", { appName: args.appName });
        if (Array.isArray(accessRecords)) {
            for (const accessRecord of accessRecords) {
                dbUtils.remove(db, "mAccess", accessRecord);
            }
        }
        dbUtils.push(db, "mAccess", { appName: args.appName, tableName: "*", hasAccess: true });
        dbUtils.writeDB(db);
        console.log(`Successfully allowed all tables to application ${args.appName}.`);
    } else {
        console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
    }
} else if (args.action === ActionType.DenyAllTables) {
    dbUtils.initTable(db, "mApps");
    const app = <DBApp>dbUtils.find(db, "mApps", { appName: args.appName });
    if (app) {
        dbUtils.initTable(db, "mAccess");
        const accessRecords = dbUtils.filter(db, "mAccess", { appName: args.appName });
        if (Array.isArray(accessRecords)) {
            for (const accessRecord of accessRecords) {
                dbUtils.remove(db, "mAccess", accessRecord);
            }
        }
        dbUtils.writeDB(db);
        console.log(`Successfully denied all tables to application ${args.appName}.`);
    } else {
        console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
    }
} else if (args.action === ActionType.HasAccess) {
    const hasAccess = dbUtils.hasAccess(db, args.appName, args.appKey, args.tableName);
    console.log(`The application ${args.appName} ${hasAccess ? 'has' : 'does not have'} access to ${args.tableName}.`);
} else if (args.action === ActionType.DeleteAppKey) {
    dbUtils.initTable(db, "mApps");
    dbUtils.initTable(db, "mAccess");
    const appRecords = dbUtils.filter(db, "mApps", { appName: args.appName });
    if (Array.isArray(appRecords)) {
        for (const appRecord of appRecords) {
            dbUtils.remove(db, "mApps", appRecord);
        }
    }
    const accessRecords = dbUtils.filter(db, "mAccess", { appName: args.appName });
    if (Array.isArray(accessRecords)) {
        for (const accessRecord of accessRecords) {
            dbUtils.remove(db, "mAccess", accessRecord);
        }
    }
    dbUtils.writeDB(db);
    console.log(`Successfully removed the application ${args.appName}.`);
} else if (args.action === ActionType.DeleteTable) {
    if (!dbUtils.isRestrictedTable(args.tableName)) {
        dbUtils.initTable(db, "mAccess");
        dbUtils.initTable(db, args.tableName);
        dbUtils.unset(db, args.tableName);
        const accessRecords = dbUtils.filter(db, "mAccess", { tableName: args.tableName });
        if (Array.isArray(accessRecords)) {
            for (const accessRecord of accessRecords) {
                dbUtils.remove(db, "mAccess", accessRecord);
            }
        }
        dbUtils.writeDB(db);
        console.log(`Successfully removed the table ${args.tableName}.`);
    } else {
        console.log(`Cannot remove restricted tables.`);
    }
} else {
    serverUtils.startServer(db);
    console.log(`Server started on ${args.port}.`);
}
