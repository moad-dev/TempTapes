//
let cacheLength = 0;
let lastValue = 6;
//TODO: Есть графический баг, при очень быстром передвижении ползунка на край, из-за чего камера смещается

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//          Получение объекта
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getScrollBar()
{
    return document.getElementById('scrollBar');
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Функция проверки видимости объекта
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function checkBarVisibility(cache)
{
    const numberOfRoadsWhenShowing = 9
    if (cacheLength > cache["roads"].length)
    {
        cacheLength = cache["roads"].length;
        let scrollBar = getScrollBar();
        if (cacheLength <= numberOfRoadsWhenShowing)
        {
            scrollBar.style.visibility = "hidden";
        }
        window.camera.position.x = 0;
        popTrackRange(cache);
        lastValue = Number(scrollBar.max) / 2;
    }
    else
    {
        if (cacheLength < cache["roads"].length)
        {
            cacheLength = cache["roads"].length;
            let scrollBar = getScrollBar();
            if (cacheLength > numberOfRoadsWhenShowing)
            {
                scrollBar.style.visibility = "";
            }
            window.camera.position.x = 0;
            addTrackRange(cache);
            lastValue = Number(scrollBar.max) / 2;
        }
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Функция добавления длины скролла
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addTrackRange(cache)
{
    let scrollBar = getScrollBar();
    if (cache["roads"].length % 2 == 0)
    {
        scrollBar.max = cache["roads"].length;
        scrollBar.value = Number(scrollBar.max) / 2;
    }
    else
    {
        scrollBar.max = cache["roads"].length + 1;
        scrollBar.value = Number(scrollBar.max) / 2;
    }
}

function popTrackRange(cache)
{
    let scrollBar = getScrollBar();
    if (cache["roads"].length % 2 == 0)
    {
        scrollBar.max = cache["roads"].length;
        scrollBar.value = Number(scrollBar.max) / 2;
    }
    else
    {
        scrollBar.max = cache["roads"].length + 1;
        scrollBar.value = Number(scrollBar.max) / 2;
    }
}

function getLastValue()
{
    return lastValue;
}

function setLastValue(value)
{
    lastValue = value;
}
module.exports.checkBarVisibility = checkBarVisibility;
module.exports.getLastValue = getLastValue;
module.exports.setLastValue = setLastValue;
