function run(database, ipcMain) {
    // database.makePath("test", "#FFFF00", "picture.png", null);
    // database.getDB().run(`
    //     DELETE FROM paths WHERE path_id = 4;
    //     `);
    // console.log(database.getDB());
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
                var reply = {command: "send events", events: []};
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
            case "get one events":
                var reply = {command: "send events", events: []};
                database
                    .getDB()
                    .all(
                        `SELECT * FROM events WHERE path_id = ? AND date = ?`,
                        request["path_id"],
                        request["date"]
                        (err, rows) => {
                            reply["events"] = rows;
                            event.reply(
                                "asynchronous-reply",
                                JSON.stringify(reply)
                            );
                        }
                    );
                break;
        }
    });
}

module.exports = run;
