function run(database, ipcMain) {
    ipcMain.on("asynchronous-message", (event, request) => {
        var text = "";
        database.getAllPaths((err, rows) => {
            text += "Тропинки\n";
            rows.forEach(row => {
                text +=
                    row.name + "\t" + row.color + "\t" + row.parent_id + "\n";
            });
            event.reply("asynchronous-reply", text);
        });
    });
}

module.exports = run;
