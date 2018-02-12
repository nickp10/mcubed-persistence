#! /usr/bin/env node

import { ActionType } from "./interfaces";
import * as args from "./args";
import * as dbUtils from "./dbUtils";
import * as serverUtils from "./serverUtils";
import * as uuidv4 from "uuid/v4";

dbUtils.newDB().then((db) => {
    if (args.action === ActionType.CreateAppKey) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            console.log(`The application ${args.appName} has been found. Use this value to authenticate the application: ${app.appKey}`);
        } else {
            const appKey = uuidv4();
            db.get("mApps").push({ appName: args.appName, appKey: appKey }).write();
            console.log(`An application key has been created for ${args.appName}. Use this value to authenticate the application: ${appKey}`);
        }
    } else if (args.action === ActionType.GetAppKey) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            console.log(`The application ${args.appName} has been found. Use this value to authenticate the application: ${app.appKey}`);
        } else {
            console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
        }
    } else if (args.action === ActionType.AllowTable) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            dbUtils.initTable(db, "mAccess");
            db.get("mAccess").remove({ appName: args.appName, tableName: args.tableName }).write();
            db.get("mAccess").push({ appName: args.appName, tableName: args.tableName, hasAccess: true }).write();
            console.log(`Successfully allowed table ${args.tableName} to application ${args.appName}.`);
        } else {
            console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
        }
    } else if (args.action === ActionType.DenyTable) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            dbUtils.initTable(db, "mAccess");
            db.get("mAccess").remove({ appName: args.appName, tableName: args.tableName }).write();
            db.get("mAccess").push({ appName: args.appName, tableName: args.tableName, hasAccess: false }).write();
            console.log(`Successfully denied table ${args.tableName} to application ${args.appName}`);
        } else {
            console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
        }
    } else if (args.action === ActionType.AllowAllTables) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            dbUtils.initTable(db, "mAccess");
            db.get("mAccess").remove({ appName: args.appName }).write();
            db.get("mAccess").push({ appName: args.appName, tableName: "*", hasAccess: true }).write();
            console.log(`Successfully allowed all tables to application ${args.appName}.`);
        } else {
            console.log(`The application ${args.appName} could not be found. Be sure you have created an application key for it.`);
        }
    } else if (args.action === ActionType.DenyAllTables) {
        dbUtils.initTable(db, "mApps");
        const app = db.get("mApps").find({ appName: args.appName }).value();
        if (app) {
            dbUtils.initTable(db, "mAccess");
            db.get("mAccess").remove({ appName: args.appName }).write();
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
        db.get("mApps").remove({ appName: args.appName }).write();
        db.get("mAccess").remove({ appName: args.appName }).write();
        console.log(`Successfully removed the application ${args.appName}.`);
    } else if (args.action === ActionType.DeleteTable) {
        if (!dbUtils.isRestrictedTable(args.tableName)) {
            dbUtils.initTable(db, "mAccess");
            dbUtils.initTable(db, args.tableName);
            db.unset(args.tableName).write();
            db.get("mAccess").remove({ tableName: args.tableName }).write();
            console.log(`Successfully removed the table ${args.tableName}.`);
        } else {
            console.log(`Cannot remove restricted tables.`);
        }
    } else {
        serverUtils.startServer(db);
        console.log(`Server started on ${args.port}.`);
    }
});
