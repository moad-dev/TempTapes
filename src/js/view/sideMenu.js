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

module.exports.viewEvent = viewEvent;
