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
        }
    });
}

module.exports = run;
