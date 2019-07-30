
on("change:movement change:body", function() {
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

on("clicked:recalc-sp", function(eventInfo){
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

on("sheet:opened", function calculateRefMod() {
    getAttrs(["_reporder_repeating_armor", "_reporder_repeating_gear", "_reporder_repeating_cyber"], function(values) {
        console.log(values);
        let items = values._reporder_repeating_armor.split(",");
        let armorEvAttrs = [];
        let gearModAttrs = [];
        let cyberModAttrs = [];
        items.forEach(function (id) {
            armorEvAttrs.push(repAttrName("armor", id, "ev"));
        });

        items = values._reporder_repeating_gear.split(",");
        items.forEach(function (id) {
            gearModAttrs.push(repAttrName("gear", id, "gear_mods"));
        });

        items = values._reporder_repeating_cyber.split(",");
        items.forEach(function (id) {
            cyberModAttrs.push(repAttrName("cyber", id, "cyber_mods"));
        });

        let allAttrs = [];
        Array.prototype.push.apply(allAttrs, armorEvAttrs);
        Array.prototype.push.apply(allAttrs, gearModAttrs);
        Array.prototype.push.apply(allAttrs, cyberModAttrs);
        allAttrs.push("reflex");

        getAttrs(allAttrs, function(attrList) {
            let totalRefMod;
            let totalEv = 0;
            let totalGearMod = 0;
            let totalCyberMod = 0;
            let i;
            for(i = 0; i < armorEvAttrs.length;) {
                totalEv += attrList[allAttrs[i++]]*1;
            }

            for(; i < armorEvAttrs.length + gearModAttrs.length;) {
                let mods = parseMods(attrList[allAttrs[i++]]);
                totalGearMod += mods.ref;
            }

            for(; i < armorEvAttrs.length + gearModAttrs.length + cyberModAttrs.length;) {
                let mods = parseMods(attrList[allAttrs[i++]]);
                totalCyberMod += mods.ref;
            }

            totalRefMod = -totalEv + totalGearMod + totalCyberMod;

            setAttrs({
                reflex_modified: attrList.reflex*1 + totalRefMod
            });
        })
    });
});

function repAttrName(section, id, attr) {
    return "repeating_"+section+"_"+id+"_"+attr;
}

function parseMods(mods){
    mods = mods.split(",").map(mod => mod.trim());
    let result = {};
    mods.forEach(function(mod){
        mod = mod.split(" ");
        let value = mod[0];
        let attr = mod[1];
        result[attr] = value*1;
    });

    return result;
}

