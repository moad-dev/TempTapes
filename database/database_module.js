const sqlite3 = require("sqlite3");
const {promisify} = require("util");
const path = require("path");


let db;

function Init(startup) {
    db = new sqlite3.Database(
        "database\\database.db",
        sqlite3.OPEN_READWRITE | sqlite3.OPEN,
        err => {
            if (err && err.code == "SQLITE_CANTOPEN") {
                createDatabase(startup);
                return;
            } else if (err) {
                console.log("SQLITE DB OPEN ERROR: " + err);
                exit(1);
            } else {
                startup(db);
            }
            return;
        }
    );
}

function createDatabase(startup) {
    db = new sqlite3.Database(
        path.join(process.cwd() + "\\database\\database.db"),
        err => {
            if (err) {
                console.log("SQLITE DB CREATE ERROR: " + err);
                exit(1);
            }
            createTables(db, startup);
        }
    );
}

function createTables(db, startup) {
    db.exec(
        `

    PRAGMA foreign_keys=on;

    create table paths (
        path_id integer primary key autoincrement,
        name text not null,
        color text not null,
        icon text,

        parent_id integer,
        FOREIGN KEY (parent_id) REFERENCES paths(path_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    create table events (
        event_id integer primary key autoincrement,
        date text not null,
        name text not null,
        color text not null,
        icon text,

        path_id integer not null,
        foreign key(path_id) references paths(path_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    create table tags (
        tag_id integer primary key autoincrement,
        name text
    );

    create table documents (
        document_id integer primary key autoincrement,
        src text
    );

    create table bind_event_tag (
        event_id integer not null,
        tag_id integer not null,
        foreign key(event_id) references events(event_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
        foreign key(tag_id) references tags(tag_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    create table bind_event_document (
        event_id integer not null,
        document_id integer not null,
        foreign key(event_id) references events(event_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
        foreign key(document_id) references documents(document_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    /*
    //
    // DEBUG
    */

    insert into paths (name, color, parent_id)
        values ('path1', '#000000', null),
               ('path2', '#000001', null);

    insert into paths (name, color, parent_id)
        values ('path3', '#000000', 1);


        `,
        err => {
            if (err != null) {
                console.log(err);
                exit(1);
            }
            startup(db);
        }
    );
}

//
//
// Getters

function getAllPaths(callback) {
    db.all(`SELECT * FROM paths`, (err, rows) => {
        callback(err, rows);
    });
}

function getRootPaths(callback) {
    db.all(`SELECT * FROM paths WHERE parent_id is NULL`, (err, rows) => {
        callback(err, rows);
    });
}

function getPathsByParent(parent_id, callback) {
    db.all(
        `SELECT * FROM paths WHERE parent_id == ?`,
        parent_id,
        (err, rows) => {
            callback(err, rows);
        }
    );
}

function getEventsByPath(path_id, callback) {
    db.all(`SELECT * FROM events WHERE path_id == ?`, path_id, (err, rows) => {
        callback(err, rows);
    });
}

//
//
// Setters

function makePath(name, color, icon = null, parent_id = null) {
    db.run(
        `
            insert into paths (name, color, icon, parent_id)
            values (?1, ?2, ?3, ?4);
        `,
        {
            1: name,
            2: color,
            3: icon,
            4: parent_id
        }
    );
}

module.exports = {
    Init: Init,
    getAllPaths: getAllPaths,
    getRootPaths: getRootPaths,
    getPathsByParent: getPathsByParent,
    getEventsByPath: getEventsByPath,
    makePath: makePath
};
