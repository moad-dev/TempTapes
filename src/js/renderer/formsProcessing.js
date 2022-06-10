const modalWindow = require("./view/modalWindow.js");
const {ipcRenderer} = require("electron");

let allForms = document.querySelectorAll('form');

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

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
                        if(isNumeric(value)) {
                            request[name] = Number(value);
                        } else {
                            request[name] = value;
                        }
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
