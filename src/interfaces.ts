export enum ActionType {
    Start = 1,
    CreateAppKey,
    GetAppKey,
    DeleteAppKey,
    AllowTable,
    AllowAllTables,
    DenyTable,
    DenyAllTables,
    HasAccess,
    DeleteTable
}

export interface DBSchema {
    mApps: DBApp[];
    mAccess: DBAccess[];
}

export interface DBApp {
    appName: string;
    appKey: string;
}

export interface DBAccess {
    appName: string;
    tableName: string;
    hasAccess: boolean;
}
