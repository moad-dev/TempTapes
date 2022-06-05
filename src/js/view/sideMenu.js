function showSideMenu() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "";
    right.classList.add("right");
}

function closeSideMenu() {
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    left.style.display = "none";
    right.classList.remove("right");
}

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

function viewEvent(e) {
    var sideMenu = document.getElementById('sideMenu');

    while(sideMenu.firstChild)
        sideMenu.removeChild(sideMenu.firstChild);

    sideMenu.append(
        createTagElement("tsdfsdft"),
        createTagElement("tsdfsdfy"),
        createTagElement("test2"),
        createTagElement("test3")
    );
}

function showEventDetails(event) {
    console.log(event);
    var sideMenu = document.getElementById("sideMenu");
    sideMenu.innerHTML = "";
    var container = document.createElement("div");
        container.classList.add("sidemenu__details");
    var iconContainer = document.createElement("div");
        iconContainer.classList.add("image");
    var icon = document.createElement("img");
        icon.src = "../../storage/img/" + event.icon;
    var name = document.createElement("div");
        name.classList.add("head");
        name.innerHTML = event.name;
    var description = document.createElement("div");
        description.classList.add("text");
        description.innerHTML = event.description;
    iconContainer.appendChild(icon);
    container.appendChild(iconContainer);
    container.appendChild(name);
    container.appendChild(description);
    sideMenu.appendChild(container);
}

module.exports.viewEvent = viewEvent;
module.exports.showEventDetails = showEventDetails;
module.exports.showSideMenu = showSideMenu;
module.exports.closeSideMenu = closeSideMenu;
