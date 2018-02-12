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

`DeleteAppKey`
This will delete the generated application key for the specified application. This will also delete any privileges that have been configured for this application.

* *--appName* - **Required.** This is the name of the application to delete the application key for.

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

`DeleteTable`
This will delete a table and all of its records from the database. This will also delete any privileges that have been configured for this table.

* *--tableName* - **Required.** This is the name of the table to delete.

Setting Up
----
Start off by installing this package to a Node.js installation:

1. Run: `npm install -g mcubed-persistence`

After installing the package, issue commands referring to the aforementioned command line interface.

1. Create a new application to access the database: `mcubed-persistence --password=SecretPassword --action=CreateAppKey --appName=SampleApp`
1. Assign privileges as desired: `mcubed-persistence --password=SecretPassword --action=AllowAllTables --appName=SampleApp`
1. Start the server: `mcubed-persistence --password=SecretPassword`

Accessing the Data
----
Accessing the data is done using CRUD operations using the RESTful HTTP verbs. The URL to the data will be:

`http://{server-name}:{server-port}/{table-name}/{record-id}`

* *server-name* - **Required.** Indicates the server name or IP address on which the persistence database is running.
* *server-port* - **Required.** Indicates the server port on which the persistence database is running.
* *table-name* - **Required.** Indicates the arbitrary table name of which to create, read, update, or delete records. There is no need to create tables ahead of time or specify the schema for the table. Simply issuing requests at any table name of your choosing will work as long as your application has been granted access to the table or all tables.
* *record-id* - **Optional.** Can only be used with the GET, PUT, and DELETE HTTP requests. Indicates the ID of the record to read, update, or delete.

Each request also requires following HTTP request headers.

* *mcubed-app-name* - **Required.** Indicates the application name sending the request.
* *mcubed-app-key* - **Required.** Indicates the application key that was generated after issuing the CreateAppKey action from above for the application name.
* *content-type* - **Required.** This header must be set to `application/json` especially for the POST and PUT HTTP verbs when the HTTP request body is a JSON formatted object.

Use the URL and HTTP request headers in conjunction with the HTTP verb to access the data.

* *GET* - Gets either a single record or an array of records. If a record ID is specified, then this returns a single record matching the record ID. If no record ID is specified, then this will use the query string appended to the URL to perform a search and will return an array of records matching the criteria. The result will be returned in the HTTP response body.
* *POST* - Creates a record. The record to be created should be a JSON formatted object in the body of the HTTP request. An ID (UUID version 4) will be added to the object using the `id` property. If an `id` value is specified in the HTTP request body, then this value will be overwritten. This request will return record with the generated ID in the HTTP response body.
* *PUT* - Updates a record or an array of records. If a record ID is specified, then this will update a single record matching the record ID. If no record ID is specified, then this will use the query string appended to the URL to perform a search and will update all records matching the criteria. The fields to be updated should be specified as a JSON formatted object in the body of the HTTP request. Any fields not specified in the JSON formatted object will not be changed. This request will not return anything in the HTTP response body.
* *DELETE* - Deletes a record or an array of records. If a record ID specified, then this will delete a single record matching the record ID. If no record ID is specified,
then this will use the query string appended to the URL to perform a search and will delete all records matching the criteria. This request will not return anything in the HTTP response body.

Changelog
----
Changes from 2.0.0 to 2.1.0
* Added the ability to delete application keys and tables from the command line interface.

Changes from 1.0.0 to 2.0.0
* IDs (UUID version 4) will automatically be added to all records created via the POST request. Any manually specified IDs will be overwritten.
* The POST request will return the created object including the generated ID as opposed to returning nothing.
* The GET, PUT, and DELETE endpoints all support appending the record ID to the path to read, update, or delete the corresponding record.
* The GET, PUT, and DELETE endpoints will read, update, or delete all records matching the query string if no record ID is specified.
* The default DB file has moved to a new location in the user's home directory instead of the current executing directory.
