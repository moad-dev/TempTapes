function hashCode(str) {
    var hash = 5381;

    for (var i = 0; i < str.length; i++)
        hash = ((hash << 5) + hash) + str.charCodeAt(i);

    return hash;
}

function pickColor(str) {
    return `hsl(${hashCode(str) % 360}, 100%, 80%)`;
}


function createTagElement(name) {
    var tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = name;
    tag.style.background = pickColor(name);

    return tag;
}

function show() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "";
    right.classList.add("right");
}

function close() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "none";
    right.classList.remove("right");
}

function viewEvent(e) {
    var sideMenu = document.getElementById('sideMenu');

    while (sideMenu.firstChild)
        sideMenu.removeChild(sideMenu.firstChild);
  
    for (var tag of e.tags) { 
        console.log(tag);
        sideMenu.appendChild(
            createTagElement(tag),
        );
    }
}

module.exports = {
    viewEvent: viewEvent,
    close: close,
    show: show
}
