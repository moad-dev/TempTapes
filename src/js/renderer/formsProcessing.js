const modalWindow = require("./view/modalWindow.js");
const {ipcRenderer} = require("electron");

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function setup() {
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
}

function setForm(object, form) {
    form.querySelectorAll('input:not([type="checkbox"])').forEach(function(input) {
        let value = object[input.name];
        if(typeof value == "number" || typeof value == "string") {
            input.value = value;
        }
    });
    form.querySelectorAll("select").forEach(function(select) {
        let value = object[select.name];
        if(typeof value == "number" || typeof value == "string") {
            select.childNodes.forEach(option => {
                option.removeAttribute("selected");
            });
            select.childNodes.forEach(option => {
                if(option.value == value) {
                    option.setAttribute('selected', 'selected');
                }
            });
        }
    });
    form.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
        let value = object[input.name];
        if(typeof value == "boolean") {
            input.checked = value;
        }
    });
}

module.exports = {
    setup: setup,
    setForm: setForm
}
