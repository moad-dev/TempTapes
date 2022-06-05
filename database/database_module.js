// Модуль базы данных: инициализация и интерфейсы для доступа к БД
//
//

const sqlite3 = require("sqlite3");
const path = require("path");

var db;

//~~~~~~~~~~~~~~~~~~~~~
//    Инициализация
//~~~~~~~~~~~~~~~~~~~~~

function Init(startup) {
    db = new sqlite3.Database(
        "database/database.db",
        sqlite3.OPEN_READWRITE | sqlite3.OPEN,
        err => {
            if (err && err.code == "SQLITE_CANTOPEN") {
                createDatabase(startup);
                return;
            } else if (err) {
                console.log("SQLITE DB OPEN ERROR: " + err);
                exit(1);
            } else {
                startup();
            }
            return;
        }
    );
}

function createDatabase(startup) {
    db = new sqlite3.Database(
        path.join(process.cwd() + "/database/database.db"),
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
    PRAGMA cache_size=32000;

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
        description text,
        color text,
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

    create index idx_events_path_date on events(path_id, date);

    /*
    //
    // DEBUG
    */

    insert into paths (name, color, parent_id, icon)
        values ('path1', '#FF0000', null, 'picture.png'),
               ('path2', '#00FF00', null, 'picture.png'),
               ('path3', '#0000FF', null, 'picture.png'),
               ('path4', '#00FFFF', null, 'picture.png');

    insert into events (date, name, color, path_id, icon)
        values ('2020-01-01', 'event10', '#0000FF', 1, "picture.png"),
               ('2020-01-01', 'event11', '#5522FF', 1, "picture.png"),
               ('2020-01-01', 'event12', '#284683', 1, "picture.png"),
               ('2020-01-01', 'event13', '#0000FF', 1, "picture.png"),
               ('2020-01-01', 'event14', '#0000FF', 1, "picture.png"),
               ('2020-01-01', 'event10', '#284683', 1, "picture.png"),
               ('2020-01-01', 'event10', '#0000FF', 1, "picture.png"),
               ('2020-01-01', 'event10', '#0000FF', 1, "picture.png"),
               ('2020-01-02', 'event2', '#00FF00', 2, "picture.png"),
               ('2020-01-03', 'event3', '#FF0000', 3, "picture.png"),
               ('2020-01-04', 'event4', '#FF0000', 4, "picture.png");


        `,
        err => {
            if (err != null) {
                console.log(err);
                exit(1);
            }
            startup();
        }
    );
}

//~~~~~~~~~~~~~~~~~~
//    интерфейсы
//~~~~~~~~~~~~~~~~~~

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


function getEventTags(event_id, callback) {
    db.all(
        `SELECT tags.name FROM bind_event_tag 
        JOIN tags ON bind_event_tag.tag_id == tags.tag_id
        WHERE event_id == ?`,
        event_id, 
        (err, rows) => { callback(err, rows);}
    );
}

function makePath(name, color, icon = null, parent_id = null, callback) {
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
        },
        function (err) {
            callback(err, this.lastID);
        }
    );
}

function deletePath(path_id, callback) {
    db.run(
        `
            DELETE FROM paths WHERE path_id = ?1;
        `,
        {
            1: path_id
        },
        function (err) {
            callback(err);
        }
    );
}

function editPath(name, color, icon, parent_id, path_id, callback) {
    db.run(
        `
            UPDATE paths
            SET name = ?1,
                color = ?2,
                icon = ?3,
                parent_id = ?4
            WHERE path_id = ?5;
        `,
        {
            1: name,
            2: color,
            3: icon,
            4: parent_id,
            5: path_id
        },
        function (err) {
            callback(err, this.lastID);
        }
    );
}

function makeEvent(name, color, icon, date, description, path_id, callback) {
    db.run(
        `
            insert into events (name, color, icon, date, description, path_id)
            values (?1, ?2, ?3, ?4, ?5, ?6);
        `,
        {
            1: name,
            2: color,
            3: icon,
            4: date,
            5: description,
            6: path_id
        },
        function (err) {
            callback(err);
        }
    );
}

function editEvent(name, color, icon, date, description, path_id, event_id, callback) {
    db.run(
        `
            UPDATE events
            SET name = ?1,
                color = ?2,
                icon = ?3,
                date = ?4,
                description = ?5,
                path_id = ?6
            WHERE event_id = ?7;
        `,
        {
            1: name,
            2: color,
            3: icon,
            4: date,
            5: description,
            6: path_id,
            7: event_id
        },
        function (err) {
            callback(err);
        }
    );
}

function deleteEvent(event_id, callback) {
    db.run(
        `
            DELETE FROM events WHERE event_id = ?1;
        `,
        {
            1: event_id
        },
        function (err) {
            callback(err);
        }
    );
}

function getDB() {
    return db;
}

module.exports = {
    db: db,
    getDB: getDB,
    Init: Init,

    getAllPaths: getAllPaths,
    getRootPaths: getRootPaths,
    getPathsByParent: getPathsByParent,
    getEventsByPath: getEventsByPath,
    getEventTags: getEventTags,


    makePath: makePath,
    deletePath: deletePath,
    editPath: editPath,

    makeEvent: makeEvent,
    editEvent: editEvent,
    deleteEvent: deleteEvent
};
