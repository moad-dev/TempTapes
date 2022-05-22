let scale;

function getScale() {
    return scale;
}

function getScaleString() {
    return ["year", "month", "day"][scale];
}

function setScale(value) {
    scale = value;
}

module.exports =  {
    getScale: getScale,
    getScaleString: getScaleString,
    setScale: setScale
};
