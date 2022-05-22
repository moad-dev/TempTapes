function getOffset() {
    return ["year", "month", "day"][
        document.getElementById('select-scale').value
    ];
}

module.exports =  {
    getOffset: getOffset
};
