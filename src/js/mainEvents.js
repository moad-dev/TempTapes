// Модуль взаимодействия между фронтом и бэком
// обращение к базе тоже здесь
//

const fs = require('fs');

const path = require("path");
const database = require(path.join(process.cwd(), "database/database_module"));

constants = require("./constants");

function run(database, ipcMain) {

    /*
     * Дороги
    */

    function sendRootPaths(event) {
        var reply = {roads: []};
        database.getRootPaths((err, rows) => {
            rows.forEach(row => {
                road = {
                    path_id: row.path_id,
                    name: row.name,
                    color: row.color,
                    parent_id: row.parent_id,
                    icon: row.icon
                };
                reply["roads"].push(road);
            });
            reply.profile = database.getCurrentProfile();
            event.reply("send root roads", JSON.stringify(reply));
        });
    }

    ipcMain.on("get root roads", (event, request) =>
    {
        request = JSON.parse(request);
        sendRootPaths(event);
    });

    ipcMain.on("get all roads", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.getAllPaths((err, rows) => {
            reply["roads"] = rows;
            event.reply("send all roads", JSON.stringify(reply));
        });
    });

    ipcMain.on("make path", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.makePath(
                request["name"],
                request["color"],
                request["icon"],
                request["parent_id"],
            (err, lastID) => {
                if(!err) {
                    reply["path"] = {
                        name: request["name"],
                        color: request["color"],
                        parent_id: request["parent_id"],
                        icon: request["icon"],
                        path_id: lastID
                    };
                    event.reply(
                        "path added",
                        JSON.stringify(reply)
                    );
                }
            }
        );
    });

    ipcMain.on("edit path", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.editPath(
                request["name"],
                request["color"],
                request["icon"],
                request["parent_id"],
                request["path_id"],
            (err, lastID) => {
                if(!err) {
                    reply["path"] = {
                        name: request["name"],
                        color: request["color"],
                        parent_id: request["parent_id"],
                        icon: request["icon"],
                        path_id: lastID
                    };
                    event.reply(
                        "path edited",
                        JSON.stringify(reply)
                    );
                }
            }
        );
    });

    ipcMain.on("delete path", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.deletePath(request["path_id"], (err) => {
            event.reply(
                "path deleted",
                JSON.stringify(reply)
            );
        });
    });

    /*
     * События
    */

    ipcMain.on("get events", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {events: [], path_id: request["path_id"]};
        database
            .getDB()
            .all(
                `SELECT * FROM events WHERE path_id = ? AND date BETWEEN ? AND ?`,
                request["path_id"],
                request["first_date"],
                request["end_date"],
                (err, rows) => {
                    reply["events"] = rows;
                    event.reply(
                        "send events",
                        JSON.stringify(reply)
                    );
                }
            );
    });

    ipcMain.on("get events by tags any", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {events: [], path_id: request["path_id"]};
        database.getEventIDsByTagsAny(request["tags"], function (err, ids) {
            database.getEventsByIDs(request["path_id"], request["first_date"], request["end_date"], ids,
                function (err, rows) {
                    reply["events"] = rows;
                    event.reply(
                        "send events",
                        JSON.stringify(reply)
                    );
                });
        });
    });

    ipcMain.on("get events by tags all", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {events: [], path_id: request["path_id"]};
        database.getEventIDsByTagsAll(request["tags"], function (err, ids) {
            database.getEventsByIDs(request["path_id"], request["first_date"], request["end_date"], ids,
                function (err, rows) {
                    reply["events"] = rows;
                    event.reply(
                        "send events",
                        JSON.stringify(reply)
                    );
                });
        });
    });

    ipcMain.on("make event", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.makeEvent(
                request["name"],
                request["color"],
                request["icon"],
                request["date"],
                request["description"],
                request["path_id"],
            function (err, lastID) {
                if(!err) {
                    reply["event"] = {
                        event_id: lastID,
                        name: request["name"],
                        color: request["transparent"] ? null : request["color"],
                        icon: request["icon"],
                        date: request["date"],
                        description: request["description"],
                        path_id: request["path_id"]
                    };
                    event.reply(
                        "event added",
                        JSON.stringify(reply)
                    );
                }
            }
        );
    });

    ipcMain.on("edit event", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.editEvent(
                request["name"],
                request["color"],
                request["icon"],
                request["date"],
                request["description"],
                request["path_id"],
                request["event_id"],
            (err) => {
                if(!err) {
                    reply["event"] = {
                        name: request["name"],
                        color: request["transparent"] ? null : request["color"],
                        icon: request["icon"],
                        date: request["date"],
                        description: request["description"],
                        path_id: request["path_id"],
                        event_id: request["event_id"]
                    };
                    event.reply(
                        "event edited",
                        JSON.stringify(reply)
                    );
                }
            }
        );
    });

    ipcMain.on("delete event", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {event_id: request["event_id"]};
        database.deleteEvent(request["event_id"], (err) => {
            event.reply(
                "event deleted",
                JSON.stringify(reply)
            );
        });
    });

    /*
     * Теги
    */

    function sendEventTags(event, event_id) {
        var reply = {event_id: event_id, tags: []};
        database.getEventTags(event_id, (err, rows) => {
            rows.forEach(row => {
                reply["tags"].push(row.name);
            });
            event.reply("send event tags", JSON.stringify(reply));
        });
    }

    ipcMain.on("get event tags", (event, request) =>
    {
        request = JSON.parse(request);
        sendEventTags(event, request["event_id"]);
    });

    ipcMain.on("set event tag", (event, request) =>
    {
        request = JSON.parse(request);
        database.getEventTags(request["event_id"], (err, rows) => {
            // Продолжаем только если тег ещё не привязан
            if(!rows.map((row) => row.name).includes(request["tag"])) {
                database.makeTagIfNotExists(request["tag"], function(err) {
                    database.setEventTag(request["event_id"], request["tag"],
                        function (err) {
                            sendEventTags(event, request["event_id"]);
                        });
                });
            }
        });
    });

    ipcMain.on("unset event tag", (event, request) =>
    {
        request = JSON.parse(request);
        database.unsetEventTag(request["event_id"], request["tag"],
            function (err) {
                sendEventTags(event, request["event_id"]);
            });
    });

    /*
     * Изображения
    */

    ipcMain.on("get images", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {images: []};
        fs.readdirSync(constants.imagesDir).forEach(file => {
          reply.images.push(file);
        });
        event.reply(
            "send images",
            JSON.stringify(reply)
        );
    });

    /*
     * Профили
    */

    ipcMain.on("get profiles", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {profiles: []};
        fs.readdirSync(constants.profilesDir).forEach(file => {
          reply.profiles.push(file);
        });
        event.reply(
            "send profiles",
            JSON.stringify(reply)
        );
    });

    ipcMain.on("update profile", (event, request) =>
    {
        request = JSON.parse(request);
        if(request["delete"]) {
            fs.unlinkSync(path.join(process.cwd(), constants.profilesDir, request["name"].toString()));
        }
        database.Init(function() {
            var reply = {roads: []};
            sendRootPaths(event);
        }, request["delete"] ? null : request["name"]);
    });

}

module.exports = run;
