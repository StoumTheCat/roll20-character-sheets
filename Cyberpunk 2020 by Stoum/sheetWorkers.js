
on("sheet:opened", function() {
    getAttrs(["movement", "body"], function(values) {
        console.log(values);
        let mv = values.movement*3;
        let btmVar;
        switch (values.body) {
            case "0": case "1": case "2": btmVar = 0; break;
            case "3": case "4": btmVar = 1; break;
            case "5": case "6": case "7": btmVar = 2; break;
            case "8": case "9": btmVar = 3; break;
            case "10": btmVar = 4; break;
        }
        setAttrs({
            run_max: mv,
            run: mv,
            leap: mv/4,
            save: values.body,
            btm: btmVar,
            lift: values.body*40
        })
    });
});

on("sheet:opened change:repeating_armor", function(eventInfo){
    console.log(eventInfo);
    getAttrs(["_reporder_repeating_armor"], function(values){
        console.log(values);
        let items = values._reporder_repeating_armor.split(",");
        let armor = {head: 0, torso: 0, legs: 0, arms: 0};
        let armorPieces = [];
        items.forEach(function(id){
            let coversAttr = repAttrName("armor", id,"covers");
            let spAttr = repAttrName("armor", id, "sp");
            armorPieces.push(coversAttr, spAttr);
        });

        getAttrs(armorPieces, function(armorValues) {
                for(let i = 0; i < armorPieces.length;){
                    let coversItems = armorValues[armorPieces[i++]].split(",");
                    let sp = armorValues[armorPieces[i++]];
                    coversItems.forEach(function(loc){
                        loc = loc.trim();
                        armor[loc]+=sp*1;
                    });
                }

                setAttrs({
                    head_sp: armor.head,
                    torso_sp: armor.torso,
                    larm_sp: armor.arms,
                    rarm_sp: armor.arms,
                    lleg_sp: armor.legs,
                    rleg_sp: armor.legs
                })
            }
        );
    });
});

function repAttrName(section, id, attr) {
    return "repeating_"+section+"_"+id+"_"+attr;
}

