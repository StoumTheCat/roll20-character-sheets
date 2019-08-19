on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.indexOf("!shoot") !== -1) {
        log(msg.content);
        let rollTemplate = "&{template:default} ";
        let args = msg.content.split('!!');
        args = args.slice(1, args.length);
        log(args);
        let charName = args[0];
        let id = args[1];
        let weaponName = args[2];
        let shotType = args[3];
        let character = findObjs({ type: 'character', name: charName })[0];
        log(character);
        switch (shotType) {
            case "single":
                let shots = findObjs({type: "attribute", _characterid: character.id, name: `repeating_weapons_${id}_weapon_shots`}, {caseInsensitive: true})[0];
                log(shots);
                if(shots.get("current") <= 0) {
                    rollTemplate = rollTemplate.concat(`{{name=Clip of ${weaponName} is empty}}`,"{{Action = Reload button}}");
                    break;
                }
                shots.set("current", shots.get("current") - 1);

                rollTemplate = rollTemplate.concat(
                    `{{name=Single shot from ${weaponName}}} `,
                    `{{attack=[[1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${id}_weapon_accuracy}]]}} `,
                    `{{damage=[[@{${charName}|repeating_weapons_${id}_weapon_damage}]]}} `,
                    "{{location=[[1t[Hit-Location]]]}} "
                );
                break;
            case "burst":
                rollTemplate = rollTemplate.concat(
                    `{{name=Burst from ${weaponName}}} `,
                    `{{attack=[[1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${id}_weapon_accuracy}]]}} `,
                    `{{damage=[[@{${charName}|repeating_weapons_${id}_weapon_damage}]], [[@{${charName}|repeating_weapons_${id}_weapon_damage}]], [[@{${charName}|repeating_weapons_${id}_weapon_damage}]]}} `,
                    "{{location=[[1t[Hit-Location]]], [[1t[Hit-Location]]], [[1t[Hit-Location]]]}} "
                );
                break;
            case "auto":
                let targets = args[4]*1;
                let range = args[5];
                let rof = args[6]*1;
                let toHitNumber = args[7]*1;
                let blankSpots = targets - 1;
                let attackMod = (range === "close" ? +1 : -1) * Math.floor(rof / 10);
                let bulletsPerTarget = Math.floor(rof / (targets + blankSpots));
                rollTemplate = rollTemplate.concat(`{{name=Auto fire from ${weaponName}}} `);
                for (let i = 1; i <= targets; i++) {
                    rollTemplate = rollTemplate.concat(
                        `{{Target ${i}}} `,
                        `{{Bullets hit ${i}=[[(1d10 + @{${charName}|ref_modified} + @{${charName}|marksmanship} + @{${charName}|repeating_weapons_${id}_weapon_accuracy} + ${attackMod})]] - [[${toHitNumber}]] (${bulletsPerTarget} max)}} `
                    )
                }
                break;
        }
        log(rollTemplate);
        sendChat(charName, rollTemplate);
    }
});

