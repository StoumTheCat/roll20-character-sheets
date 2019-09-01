on("change:graphic:lastmove", function(obj, prev) {
    let turnOrder = JSON.parse(Campaign().get("turnorder"));
    if(turnOrder === "" || turnOrder.length === 0){
        return;
    }
    let lastmove = obj.get("lastmove");
    let pageId = obj.get("pageid");
    let page = findObjs({type: "page", _id: pageId}, {caseInsensitive: true})[0];
    let scale = page.get("scale_number");

    //last move doesn't contain current coordinates
    lastmove += ","+obj.get("left");
    lastmove += ","+obj.get("top");

    let lastMoveArr = lastmove.split(",");

    var traversedDistance = 0;
    var i = 0;

    let startLeft = lastMoveArr[0];
    let startTop = lastMoveArr[1];

    let x1;
    let y1;
    let x2;
    let y2;
    while (i < lastMoveArr.length - 2) {
        x1 = lastMoveArr[i++];
        y1 = lastMoveArr[i++];
        x2 = lastMoveArr[i];
        y2 = lastMoveArr[i + 1];

        traversedDistance += dist(x1, y1, x2, y2, scale);
    }

    if(obj.get("bar2_value") < traversedDistance) {
        let name = obj.get("name");
        sendChat(name, `&{template:default} {{name=${name} moved too far!}} {{Remaining run=${obj.get("bar2_value")}}}`);
        obj.set({
            left: startLeft,
            top: startTop,
            lastmove: prev.lastmove
        });
    } else {
        obj.set("bar2_value", obj.get("bar2_value") - traversedDistance);
    }
});

on("change:campaign:turnorder", function(obj, prev) {
    let turnOrder = JSON.parse(obj.get("turnorder"));
    if(turnOrder === "" || turnOrder.length === 0){
        return;
    }
    if(turnOrder[0].id === "-1") {
        let ids = _.map(turnOrder, function(item) {return item.id});
        _.each(ids.slice(1), function (id) {
            let token = findObjs({type: "graphic", _id: id}, {caseInsensitive: true})[0];
            token.set("bar2_value", token.get("bar2_max"));
        });
    }
});


function dist(x1,y1,x2,y2,scale) {
    let result = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    log(result);
    return +((result/70)*scale).toFixed(2);
}