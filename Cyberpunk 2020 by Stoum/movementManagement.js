on("change:graphic:lastmove", function(obj, prev) {
    let lastmove = obj.get("lastmove");
    //last move doesn't contain current coordinates
    lastmove += ","+obj.get("left");
    lastmove += ","+obj.get("top");

    let runAttr = findObjs({
        _name: "Ma_Temp"
    });

    log(runAttr);

    let lastMoveArr = lastmove.split(",");

    var traversedDistance = 0;
    var i = 0;

    let x1;
    let y1;
    let x2;
    let y2;
    while (i < lastMoveArr.length - 2) {
        x1 = lastMoveArr[i++];
        y1 = lastMoveArr[i++];
        x2 = lastMoveArr[i];
        y2 = lastMoveArr[i + 1];

        log([x1, y1, x2, y2].join(", "));

        traversedDistance += dist(x1, y1, x2, y2);
    }

    log(traversedDistance);

    obj.set("bar2_value", obj.get("bar2_value") - traversedDistance);
});

function dist(x1,y1,x2,y2) {
    log("from dist func" + [x1,y1,x2,y2].join(", "));
    log(Math.pow(x2-x1, 2));
    log(Math.pow(y2-y1, 2));
    let result = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    log(result);
    return +(result/70).toFixed(2);
}