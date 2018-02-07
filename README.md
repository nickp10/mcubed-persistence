# mcubed-persistence

Description
----
NPM package providing a mechanism for storing data that is exposed via a RESTful server supporting CRUD operations.

Features
----
* RESTful [express](http://expressjs.com) server supporting CRUD operations (Create, Read, Update, and Delete)
* Data stored using [lowdb](https://github.com/typicode/lowdb)
* AES encrypted data via [CyrptoJS](https://github.com/gwjjeff/cryptojs)
* Application partitioned database via simple privilege system

Command Line Interface 
----
This package is only usable via a command line interface (CLI). Every command has the following shared parameters:

* *--password* - **Required.** This value is used as the key to encrypt and decrypt the data using AES encryption. This value is never stored anywhere and cannot be recovered. This must be the exact same for every subsequent command issued for a single database. You could have multiple databases by specifying the *-db / --dbPath* parameter. This password can be different for each unique database, but those databases can only be used when issuing the proper corresponding password.
* *-db / --dbPath* - **Optional.** This is an optional path to read and write the database to and from. This will default to the current working directory with a file called *mCubedDB.json*.
* *-a / --action* - **Optional.** This is the action to perform from the CLI. This must be one of the following values: `Start`, `CreateAppKey`, `GetAppKey`, `AllowTable`, `AllowAllTables`, `DenyTable`, `DenyAllTables`, or `HasAccess`. This will default to `Start`. This value is case insensitive. Each action may or may not have further required or optional CLI parameters. Refer to the next section of a breakdown of each action and their corresponding CLI parameters.

`Start`
This will start the RESTful server.

* *-p / --port* - **Optional.** This is the port that the server will start on. This will default to 8000.

`CreateAppKey`
This will create an application key for the specified application. This is needed to provide an application with access to the database. An application must provide its application name and the generated application key when making a RESTful request to the server. This application will need to have been granted access to the specific table being requested or all the tables in the database. Note: all applications have deny access to all tables by default.

* *--appName* - **Required.** This is the name of the application to generate an application key for.

`GetAppKey`
This will retrieve the previously generated application key for the specified application. This is needed to provide an application with access to the database. An application must provide its application name and the generated application key when making a RESTful request to the server. This application will need to have been granted access to the specific table being requested or all the tables in the database. Note: all applications have deny access to all tables by default.

* *--appName* - **Required.** This is the name of the application to retrieve the application key for.

`AllowTable`
This will grant access to a specific table for a specific application.

* *--appName* - **Required.** This is the name of the application to grant access for.
* *--tableName* - **Required.** This is the name of the table to grant access to.

`AllowAllTables`
This will grant access to all tables in the database for a specific application.

* *--appName* - **Required.** This is the name of the application to grant access for.

`DenyTable`
This will prevent access to a specific table for a specific application.

* *--appName* - **Required.** This is the name of the application to prevent access for.
* *--tableName* - **Required.** This is the name of the table to prevent access to.

`DenyAllTables`
This will prevent access to all tables in the database for a specific application.

* *--appName* - **Required.** This is the name of the application to prevent access for.

`HasAccess`
This is used to check if an application has access to a specific table. This may be used to verify that permissions are configured correctly.

* *--appName* - **Required.** This is the name of the application to check access for.
* *--appKey* - **Required.** This is the key that was generated for the application to check access for.
* *--tableName* - **Required.** This is the name of the table to check access to.
