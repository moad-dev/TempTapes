const fs = require('fs');

function run(database, ipcMain) {
    ipcMain.on("asynchronous-message", (event, request) => {
        request = JSON.parse(request);
        switch (request["command"]) {
            case "get root roads":
                var reply = {command: "send root roads", roads: []};
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
                    event.reply("asynchronous-reply", JSON.stringify(reply));
                });
                break;
            case "get events":
                var reply = {command: "send events", events: [], path_id: request["path_id"]};
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
                                "asynchronous-reply",
                                JSON.stringify(reply)
                            );
                        }
                    );
                break;
            case "get events one day":
                var reply = {command: "send events one day", events: []};
                database.getDB().all(
                        `SELECT * FROM events WHERE path_id = ? AND date = ?`,
                        request["path_id"],
                        request["date"],
                        (err, rows) => {
                            reply["events"] = rows;
                            event.reply(
                                "asynchronous-reply",
                                JSON.stringify(reply)
                            );
                        }
                    );
                break;
            case "make path":
                var reply = {command: "path added"};
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
                                "asynchronous-reply",
                                JSON.stringify(reply)
                            );
                        }
                    }
                );
                break;
            case "get images":
                var reply = {command: "send images", images: []};
                fs.readdirSync('storage/img').forEach(file => {
                  reply.images.push(file);
                });
                event.reply(
                    "asynchronous-reply",
                    JSON.stringify(reply)
                );
                break;
            case "delete path":
                var reply = {command: "path deleted"};
                database.deletePath(request["path_id"], (err) => {
                    event.reply(
                        "asynchronous-reply",
                        JSON.stringify(reply)
                    );
                });
                break;
            case "edit path":
                var reply = {command: "path edited"};
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
                                "asynchronous-reply",
                                JSON.stringify(reply)
                            );
                        }
                    }
                );
                break;
        }
    });
}

module.exports = run;
