on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.indexOf("!shoot") !== -1) {
        log(msg.content);
        let rollTemplate = "&{template:default} ";
        let args = msg.content.split('!!')
        args = args.slice(1, args.length);
        log(args);
        let n = 0;
        let charName = args[n++];
        let targetName = args[n++];
        log(targetName);
        let weaponId = args[n++];
        let weaponName = args[n++];
        let shotType = args[n++];
        let character = findObjs({ type: 'character', name: charName })[0];
        let target = findObjs({ type: 'character', name: targetName })[0];
        log(character);
        let shots = findObjs({type: "attribute", _characterid: character.id, name: `repeating_weapons_${weaponId}_weapon_shots`}, {caseInsensitive: true})[0];
        let damageDice = findObjs({type: "attribute", _characterid: character.id, name: `repeating_weapons_${weaponId}_weapon_damage`}, {caseInsensitive: true})[0].get("current");

        switch (shotType) {
            case "single": {
                if (shots.get("current") <= 0) {
                    rollTemplate = rollTemplate.concat(`{{name=Clip of ${weaponName} is empty}}`, `{{Action = [Reload](!reload!!${charName}!!${weaponId})}}`);
                    break;
                }
                shots.set("current", shots.get("current") - 1);
                let damage = dice(damageDice);
                let location = hitLocations(1)[0];

                rollTemplate = rollTemplate.concat(
                    `{{name=Single shot from ${weaponName}}} `,
                    `{{attack=[[1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${weaponId}_weapon_accuracy}]]}} `,
                    `{{Action = [Hit?](!hit!!${charName}!!${targetName}!!${damage}!!${location})}}`
                );
                spawnShootingFx(character, target);
                break;
            }
            case "burst": {
                if (shots.get("current") <= 2) {
                    rollTemplate = rollTemplate.concat(`{{name=Less than 3 bullets left for ${weaponName}}}`, `{{Action = [Reload](!reload!!${charName}!!${weaponId})}}`);
                    break;
                }
                shots.set("current", shots.get("current") - 3);
                let damage = [dice(damageDice), dice(damageDice), dice(damageDice)];
                let location = hitLocations(3);
                rollTemplate = rollTemplate.concat(
                    `{{name=Burst from ${weaponName}}} `,
                    `{{attack=[[1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${weaponId}_weapon_accuracy}]]}} `,
                    `{{Action = [Hit?](!hit!!${charName}!!${targetName}!!${damage.join(",")}!!${location.join(",")})}}`
                );
                spawnShootingFx(character, target);
                break;
            }
            case "auto":
                let targets = args[n++]*1;
                let range = args[n++];
                let bullets = args[n++]*1;
                let toHitNumber = args[n]*1;
                let blankSpots = targets - 1;
                let attackMod = (range === "close" ? +1 : -1) * Math.floor(bullets / 10);
                let bulletsPerTarget = Math.floor(bullets / (targets + blankSpots));
                if(shots.get("current") < bullets) {
                    let bulletsLeft = shots.get("current");
                    rollTemplate = rollTemplate.concat(
                        `{{name=Less than ${bullets} bullets left for ${weaponName}}}`,
                        `{{Action = [Reload](!reload!!${charName}!!${weaponId})}}`,
                        `{{Action2 = [Shoot ${bulletsLeft} bullets on auto](!shoot!!${charName}!!${weaponId}!!${weaponName}!!${shotType}!!${targets}!!${range}!!${bulletsLeft}!!${toHitNumber})}}`);
                    break;
                }
                shots.set("current", shots.get("current") - bullets);
                rollTemplate = rollTemplate.concat(`{{name=Auto fire from ${weaponName}}} `);
                for (let i = 1; i <= targets; i++) {
                    rollTemplate = rollTemplate.concat(
                        `{{Target ${i}}} `,
                        `{{Bullets hit ${i}=[[(1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${weaponId}_weapon_accuracy} + ${attackMod})]] - [[${toHitNumber}]] (${bulletsPerTarget} max)}} `
                    )
                }
                break;
        }
        log(rollTemplate);
        sendChat(charName, rollTemplate);
    }
});

on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!hit") !== -1) {
        let args = msg.content.split('!!');
        args = args.slice(1, args.length);
        let i = 0;
        let charName = args[i++];
        let targetName = args[i++];
        let damageArr = args[i++].split(",");
        let locationArr = args[i].split(",");
        let target = findObjs({ type: 'character', name: targetName })[0];
        let effectiveDamage = processDamage(target, damageArr, locationArr);
        let rollTemplate = `&{template:default}`;
        rollTemplate = rollTemplate.concat(
            `{{name=Damage to ${targetName}}}`,
            `{{damage=${damageArr.join(",")}}}`,
            `{{location=${toPrettyLoc(locationArr).join(",")}}}`,
            `{{effective damage=${effectiveDamage.join(",")}}}`
        );
        let critLocation = [];
        _.each(effectiveDamage, function(dmg, index){
            if(dmg > 10 && locationArr[index] !== "torso") {
                critLocation.push(locationArr[index]);
            }
        });

        if(critLocation.length > 0){
            rollTemplate = rollTemplate.concat(
                `{{critical hits = ${toPrettyLoc(critLocation).join(",")}}}`
            )
        }
        log(rollTemplate);
        sendChat(charName, rollTemplate);
        spawnDamageFx(target);
    }
});

on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!reload") !== -1) {
        let args = msg.content.split('!!');
        args = args.slice(1, args.length);
        let charName = args[0];
        let weaponId = args[1];
        let character = findObjs({ type: 'character', name: charName })[0];
        let shots = findObjs({type: "attribute", _characterid: character.id, name: `repeating_weapons_${weaponId}_weapon_shots`}, {caseInsensitive: true})[0];
        let clip = findObjs({type: "attribute", _characterid: character.id, name: `repeating_weapons_${weaponId}_weapon_clip_size`}, {caseInsensitive: true})[0];
        shots.set("current", clip.get("current"))
    }
});

function dice(d){
    let dice = d.split("d");
    let number = +dice[0];
    let value = +dice[1];
    return _.reduce(_.range(number), function(memo){return memo + randomInteger(value)}, 0);
}

let hitbox = ["head", "torso", "torso", "torso", "rarm", "larm", "rleg", "rleg", "lleg", "lleg"];

function hitLocations(number){
    return _.map(_.range(number), function(){return hitbox[randomInteger(10)-1]});
}

function toPrettyLoc(locations){
    return _.map(locations, function(loc){return prettyLoc(loc)});
}

function prettyLoc(loc){
    switch (loc) {
        case "head": return "Head";
        case "torso": return "Torso";
        case "rarm": return "Right Arm";
        case "larm": return "Left Arm";
        case "rleg": return "Right Leg";
        case "lleg": return "Left Leg";
    }
}

function processDamage(target, damage, locations){
    let locationSpAttrs = _.map(locations, function(loc){return findObjs({type: "attribute", _characterid: target.id, name: `${loc}_sp`})[0]});
    let hpAttr = findObjs({type: "attribute", _characterid: target.id, name: `hp`})[0];
    log(target);
    log(locationSpAttrs);
    log(hpAttr);
    let effectiveDamageArr = [];
    _.each(locationSpAttrs, function(locSpAttr, index) {
        let locDamage = +damage[index];
        let locSp = +locSpAttr.get("current");
        if(locDamage > locSp) {
            let effectiveDamage = locDamage - locSp;
            if(locations[index] === "head") {
                effectiveDamage = effectiveDamage * 2;
            }
            log(effectiveDamage);
            hpAttr.set("current", eval(hpAttr.get("current")) - effectiveDamage);
            if(locSp > 0) {
                locSpAttr.set("current", locSp - 1);
            }
            effectiveDamageArr.push(effectiveDamage);
        } else {
            effectiveDamageArr.push(0);
        }
    });
    log(effectiveDamageArr);
    return effectiveDamageArr;
}

function spawnShootingFx(character, target){
    log("SPAWNING SHOOTING FX");
    let playerPageId = Campaign().get("playerpageid");
    let shooterToken = getCharacterToken(character.get("id"), playerPageId);
    let targetToken = getCharacterToken(target.get("id"), playerPageId);
    spawnFxBetweenPoints(
        {x: shooterToken.get("left"), y: shooterToken.get("top")},
        {x: targetToken.get("left"), y: targetToken.get("top")},
        "beam-fire"
    )
}

function spawnDamageFx(target){
    log("SPAWNING DAMAGE FX");
    let playerPageId = Campaign().get("playerpageid");
    log(target);
    log(target.get("id"));
    let targetToken = getCharacterToken(target.get("id"), playerPageId);
    spawnFx(
        targetToken.get("left"),
        targetToken.get("top"),
        "bubbling-blood"
    )
}

function getCharacterToken(characterId, playerPageId){
    let objs = findObjs({type: "graphic", _pageid: playerPageId, represents: characterId}, {caseInsensitive: true});
    log(characterId);
    log(playerPageId);
    log(objs);
    return objs[0];
}