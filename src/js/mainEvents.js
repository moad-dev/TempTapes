/**
 * Серверный модуль общения с клиентом
 * Связующее звено между клиентом и базой данных
 *  1.  Связь с клиентом посредством ipcMain
 *  2.  Работа с базой данных и обработка её ответов
 */

const fs = require('fs');

const path = require("path");
const database = require(path.join(process.cwd(), "database/database_module"));
const constants = require("./constants");

function run(database, ipcMain) {

    /*
     * Дороги
    */

    /**
     * Внутренняя функция модуля.
     * Отправка верхних дорог клиенту.
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Отправка верхних дорог клиенту.
    */
    ipcMain.on("get root roads", (event, request) =>
    {
        request = JSON.parse(request);
        sendRootPaths(event);
    });

    /**
     * Обработчик события получения сообщения от клиента.
     * Отправка всех дорог клиенту.
    */
    ipcMain.on("get all roads", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.getAllPaths((err, rows) => {
            reply["roads"] = rows;
            event.reply("send all roads", JSON.stringify(reply));
        });
    });

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка создания дороги и уведомление клиента при успехе.
    */
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка редакторования дороги и уведомление клиента при успехе
    */
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка удаления дороги и уведомление клиента при успехе
    */
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
     *
     * События
    */

    /**
     * Обработчик события получения сообщения от клиента.
     * Возврат клиенту событий, удовлетворяющий следующим параметрам:
     * 1. id дороги события
     * 2. промежуток времени, в котором должно лежать событие
    */
    ipcMain.on("get events", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = request;
        reply.events = [];
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Возврат клиенту событий, удовлетворяющий следующим параметрам:
     * 1. id дороги события
     * 2. промежуток времени, в котором должно лежать событие
     * 3. хотя бы один тег из переданных клиентом должен быть присвоен событию
    */
    ipcMain.on("get events by tags any", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = request;
        reply.events = [];
        database.getEventsByTagsAny(
            request["path_id"],
            request["first_date"],
            request["end_date"],
            request["tags"],
            function (err, rows) {
                reply["events"] = rows;
                event.reply(
                    "send events",
                    JSON.stringify(reply)
                );
            });
    });

    /**
     * Обработчик события получения сообщения от клиента.
     * Возврат клиенту событий, удовлетворяющий следующим параметрам:
     * 1. id дороги события
     * 2. промежуток времени, в котором должно лежать событие
     * 3. Все теги, переданные клиентом, должен быть присвоен событию
    */
    ipcMain.on("get events by tags all", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = request;
        reply.events = [];
        database.getEventsByTagsAll(
            request["path_id"],
            request["first_date"],
            request["end_date"],
            request["tags"],
            function (err, rows) {
                reply["events"] = rows;
                event.reply(
                    "send events",
                    JSON.stringify(reply)
                );
            });
    });

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка создать событие и уведомление клиента при успехе.
    */
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка редактировать событие и уведомление клиента при успехе.
    */
    ipcMain.on("edit event", (event, request) =>
    {
        request = JSON.parse(request);
        var reply = {};
        database.editEvent(
                request["name"],
                request["transparent"] ? null : request["color"],
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Попытка удалить событие и уведомление клиента при успехе.
    */
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

    /**
     * Внутренняя функция модуля.
     * Отправить клиенту все теги, соответствующие указанному событию.
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Отправить клиенту все теги, соответствующие указанному событию.
    */
    ipcMain.on("get event tags", (event, request) =>
    {
        request = JSON.parse(request);
        sendEventTags(event, request["event_id"]);
    });

    /**
     * Обработчик события получения сообщения от клиента.
     * попытка добавить тег событию и, в случае успеха,
     * отправить клиенту все теги, соответствующие указанному событию.
    */
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

    /**
     * Обработчик события получения сообщения от клиента.
     * попытка удалить тег события и, в случае успеха,
     * отправить клиенту все теги, соответствующие указанному событию.
    */
    ipcMain.on("unset event tag", (event, request) =>
    {
        request = JSON.parse(request);
        database.unsetEventTag(request["event_id"], request["tag"],
            function (err) {
                sendEventTags(event, request["event_id"]);
            });
    });

    /*
     *
     * Изображения
    */

    /**
     * Обработчик события получения сообщения от клиента.
     * отправить клиенту имена всех иконок
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
     *
     * Профили
    */

    /**
     * Обработчик события получения сообщения от клиента.
     * отправить клиенту имена всех профилей
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

    /**
     * Обработчик события получения сообщения от клиента.
     * Обновить текущий профиль базы данных
    */
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
