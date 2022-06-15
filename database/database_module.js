/**
 * Модуль базы данных
 *  1.  инициализация базы данных
 *  2.  интерфейсы для доступа к БД
 *  3.  инициализация профилей
 */

const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");
const constants = require(path.join(process.cwd(), "src/js/constants.js"));

/**
 * Текущая активная база данных.
 */
var db;

/**
 * Текущий активный профиль.
 */
var currentProfile;

function getCurrentProfile() {
    return currentProfile;
}

//~~~~~~~~~~~~~~~~~~~~~
//    Инициализация
//~~~~~~~~~~~~~~~~~~~~~

function Init(startup, filename = null) {
    if(db) {
        db.close();
    }
    if (!fs.existsSync(constants.profilesDir)) {
        fs.mkdirSync(constants.profilesDir);
    }
    if(!filename) {
        profiles = fs.readdirSync(constants.profilesDir);
        if(profiles.length == 0) {
            filename = "default";
        } else {
            filename = profiles[0];
        }
    }

    currentProfile = filename.toString();

    db = new sqlite3.Database(
        path.join(constants.profilesDir, currentProfile),
        sqlite3.OPEN_READWRITE | sqlite3.OPEN,
        err => {
            if (err && err.code == "SQLITE_CANTOPEN") {
                createDatabase(startup);
                return;
            } else if (err) {
                console.log("SQLITE DB OPEN ERROR: " + err);
                process.exit(1);
            } else {
                startup();
            }
            return;
        }
    );
}

function createDatabase(startup) {
    db = new sqlite3.Database(
        path.join(process.cwd(), constants.profilesDir, currentProfile),
        err => {
            if (err) {
                console.log("SQLITE DB CREATE ERROR: " + err);
                process.exit(1);
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
        name text not null unique
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

    insert into paths (name, color, parent_id, icon)
        values ('дорога 1', '#FF0000', null, 'picture.png'),
               ('дорога 2', '#00FF00', null, 'picture.png'),
               ('дорога 3', '#0000FF', null, 'picture.png'),
               ('дорога 4', '#00FFFF', null, 'picture.png');

        `,
        err => {
            if (err != null) {
                console.log(err);
                process.exit(1);
            }
            startup();
        }
    );
}

//~~~~~~~~~~~~~~~~~~
//    интерфейсы
//~~~~~~~~~~~~~~~~~~

/*
 * Получить объект текущей базы данных
*/
function getDB() {
    return db;
}

/*
 * Получить все дороги, хранящиеся в базе данных
*/
function getAllPaths(callback) {
    db.all(`SELECT * FROM paths`, (err, rows) => {
        callback(err, rows);
    });
}

/*
 * Получить дороги верхнего уровня (не вложенные)
*/
function getRootPaths(callback) {
    db.all(`SELECT * FROM paths WHERE parent_id is NULL`, (err, rows) => {
        callback(err, rows);
    });
}

/*
 * Получить дороги по внешней дороге
*/
function getPathsByParent(parent_id, callback) {
    db.all(
        `SELECT * FROM paths WHERE parent_id == ?`,
        parent_id,
        (err, rows) => {
            callback(err, rows);
        }
    );
}

/*
 * Получить события по id дороги
*/
function getEventsByPath(path_id, callback) {
    db.all(`SELECT * FROM events WHERE path_id == ?`, path_id, (err, rows) => {
        callback(err, rows);
    });
}

/*
 * Получить дороги по id дороги, промежутку времени и тегам
 * Если хотя бы один из полученных тегов присвоен событию, оно возвращается
*/
function getEventsByTagsAny (path_id, first_date, end_date, tags, callback) {
    tags.unshift(end_date);
    tags.unshift(first_date);
    tags.unshift(path_id);
    db.all(
        `SELECT *
        FROM events
        WHERE path_id = ?
            AND date BETWEEN ? AND ?
            AND event_id IN (
                SELECT bind_event_tag.event_id
                FROM bind_event_tag
                JOIN tags ON bind_event_tag.tag_id = tags.tag_id
                WHERE tags.name IN (${ "?,".repeat(tags.length-3).slice(0,-1) })
            )
        `,
        tags,
        function(err, rows) {
            callback(err, rows);
        }
    );
}

/*
 * Получить дороги по id дороги, промежутку времени и тегам
 * Если все полученные теги присвоены событию, оно возвращается
*/
function getEventsByTagsAll (path_id, first_date, end_date, tags, callback) {
    tags.unshift(end_date);
    tags.unshift(first_date);
    tags.unshift(path_id);
    db.all(
        `SELECT *
        FROM events
        WHERE path_id = ?
            AND date BETWEEN ? AND ?
            AND event_id IN (
                SELECT event_id FROM (
                    SELECT bind_event_tag.event_id, COUNT(*) AS cnt
                    FROM bind_event_tag
                    JOIN tags ON bind_event_tag.tag_id = tags.tag_id
                    WHERE tags.name IN (${ "?,".repeat(tags.length-3).slice(0,-1) })
                    GROUP BY bind_event_tag.event_id
                ) WHERE cnt = ${tags.length-3}
            )
        `,
        tags,
        function(err, rows) {
            callback(err, rows);
        }
    );
}

/*
 *
 * Работа с тегами
*/

function getEventTags(event_id, callback) {
    db.all(
        `SELECT tags.name FROM bind_event_tag
        JOIN tags ON bind_event_tag.tag_id == tags.tag_id
        WHERE event_id == ?`,
        event_id,
        (err, rows) => { callback(err, rows);}
    );
}

function makeTagIfNotExists(tag, callback) {
    db.all(
        `
        INSERT OR IGNORE INTO tags (name) VALUES (?);
        `,
        tag,
        function (err) { callback(err); }
    );
}

function setEventTag(event_id, tag, callback) {
    db.all(
        `
        INSERT INTO bind_event_tag (event_id, tag_id)
        VALUES (?1,
                (SELECT tag_id from tags where name = ?2)
                );
        `,
        {
            1: event_id,
            2: tag
        },
        function (err) { callback(err); }
    );
}

function unsetEventTag(event_id, tag, callback) {
    db.all(
        `
        DELETE FROM bind_event_tag
        WHERE event_id = ?1
              AND
              tag_id = (SELECT tag_id from tags where name = ?2);
        `,
        {
            1: event_id,
            2: tag
        },
        function (err) { callback(err); }
    );
}

/*
 *
 * Работа с дорогами
*/

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

/*
 *
 * Работа с событиями
*/

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
            callback(err, this.lastID);
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

module.exports = {
    db: db,
    getDB: getDB,
    Init: Init,

    getAllPaths: getAllPaths,
    getRootPaths: getRootPaths,
    getPathsByParent: getPathsByParent,

    getEventsByPath: getEventsByPath,
    getEventsByTagsAny: getEventsByTagsAny,
    getEventsByTagsAll: getEventsByTagsAll,

    getEventTags: getEventTags,
    makeTagIfNotExists: makeTagIfNotExists,
    setEventTag: setEventTag,
    unsetEventTag: unsetEventTag,

    makePath: makePath,
    deletePath: deletePath,
    editPath: editPath,

    makeEvent: makeEvent,
    editEvent: editEvent,
    deleteEvent: deleteEvent,

    getCurrentProfile: getCurrentProfile
};
