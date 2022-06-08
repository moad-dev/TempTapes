// Модуль, реализующий логику контекстного меню
//
//

/* Получить координаты мыши __относительно окна__ по событию */
function getPosition(e) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
        } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft +
                           document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop +
                           document.documentElement.scrollTop;
    }
    return { x: posx, y: posy }
}

function positionMenu(menu, e) {
  menuPosition = getPosition(e);
  menuPositionX = menuPosition.x + "px";
  menuPositionY = menuPosition.y + "px";

  menu.style.left = menuPositionX;
  menu.style.top = menuPositionY;
}

function toggleMenuOn(menu, e) {
    positionMenu(menu, e);
    menu.classList.add("context-menu--active");
}

function toggleMenusOff() {
    let menus = document.querySelectorAll('.context-menu');
    menus.forEach(menu => {
        menu.classList.remove("context-menu--active");
    });
}

// ~ отключаем контекстное меню
// при ESC
document.body.addEventListener('keyup', function (e) {
    var key = e.keyCode;
    if (key == 27) {
        toggleMenusOff();
    };
}, false);
// при клике
document.addEventListener( "click", function(e) {
    var button = e.which || e.button;
    if ( button === 1 ) { toggleMenusOff(); }
});
// при изменении размера окна
window.addEventListener( "resize", function(e) {
    toggleMenusOff();
});
// при скролле
window.addEventListener( "wheel", function(e) {
    toggleMenusOff();
});

module.exports = {
    toggleMenuOn: toggleMenuOn
};
