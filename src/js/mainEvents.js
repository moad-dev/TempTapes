function run(database, ipcMain) {
    ipcMain.on("asynchronous-message", (event, request) => {
        request = JSON.parse(request);
        switch (request["command"]) {
            case "get roads":
                var reply = {command: "send roads", roads: []};
                database.getAllPaths((err, rows) => {
                    rows.forEach(row => {
                        road = {
                            name: row.name,
                            color: row.color,
                            parent_id: row.parent_id
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
