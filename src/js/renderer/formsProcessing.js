const modalWindow = require("./view/modalWindow.js");
const {ipcRenderer} = require("electron");

let allForms = document.querySelectorAll('form');

allForms.forEach(function (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        request = {};
        form.querySelectorAll('input, select')
        .forEach(function (input) {
            let value = input.value;
            let name = input.name;
            if(name) {
                if (input.type == "checkbox") {
                    request[name] = input.checked;
                }
                else {
                    if(!value || value == "") {
                        request[name] = null;
                    } else {
                        request[name] = value;
                    }
                }
            }
        });
        ipcRenderer.send(
            form.getAttribute("data-action"),
            JSON.stringify(request)
        );
        modalWindow.closeParentModal(form);
    });
});
