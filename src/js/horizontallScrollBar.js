let cacheLength = 0;
let lastValue = 6;
function getScrollBar()
{
    return document.getElementById('scrollBar');
}
function checkBarVisibility(cache)
{
    if (cacheLength > cache["roads"].length)
    {
        cacheLength = cache["roads"].length;
        let scrollBar = getScrollBar();
        if (cacheLength > 11)
        {
            scrollBar.style.visibility = "";
            window.camera.position.x = 0;
        }
        else
        {
            scrollBar.style.visibility = "hidden";
            window.camera.position.x = 0;
        }
        popTrackRange(cache);
        lastValue = Number(scrollBar.max) / 2;
    }
    else
    {
        if (cacheLength < cache["roads"].length)
        {
            cacheLength = cache["roads"].length;
            let scrollBar = getScrollBar();
            if (cacheLength > 11)
            {
                scrollBar.style.visibility = "";
                window.camera.position.x = 0;
            }
            else
            {
                scrollBar.style.visibility = "hidden";
                window.camera.position.x = 0;
            }
            addTrackRange(cache);
            lastValue = Number(scrollBar.max) / 2;
        }
    }
}

function addTrackRange()
{
    let scrollBar = getScrollBar();
    console.log(scrollBar.max);
    scrollBar.max = Number(scrollBar.max) + 2;
    scrollBar.value = Number(scrollBar.max) / 2;
    console.log(scrollBar.max);
}

function popTrackRange()
{
    let scrollBar = getScrollBar();
    console.log(scrollBar.max);
    scrollBar.max = Number(scrollBar.max) - 2;
    scrollBar.value = Number(scrollBar.max) / 2;
    console.log(scrollBar.max)
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