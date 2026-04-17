/**
 * 伤害计算模块
 * 处理伤害计算、属性计算等功能
 */

// 计算伤害
async function calculateDamage() {
    if (!myPet || !enemyPet || !mySelectedSkill || !enemySelectedSkill) {
        alert('请选择宠物和技能');
        return;
    }
    
    // 获取修正值
    // 存储基础属性（用于伤害计算）
    let myBaseAttrs = {};
    let enemyBaseAttrs = {};

    const myIv = getIvObject('my');
    const myBoostAttr = document.getElementById('my-boost').value;
    const myReductionAttr = document.getElementById('my-reduction').value;
    const enemyIv = getIvObject('enemy');
    const enemyBoostAttr = document.getElementById('enemy-boost').value;
    const enemyReductionAttr = document.getElementById('enemy-reduction').value;

    // 计算基础属性（不包含能力等级提升）
    myBaseAttrs = calculatePetAttributes(myPet.race, myIv, myBoostAttr, myReductionAttr);
    enemyBaseAttrs = calculatePetAttributes(enemyPet.race, enemyIv, enemyBoostAttr, enemyReductionAttr);

    // 获取能力等级百分比
    const myPhysAtkBoost = parseFloat(document.getElementById('my-phys-atk-boost').value) || 0;
    const myMagicAtkBoost = parseFloat(document.getElementById('my-magic-atk-boost').value) || 0;
    const myPhysDefBoost = parseFloat(document.getElementById('my-phys-def-boost').value) || 0;
    const myMagicDefBoost = parseFloat(document.getElementById('my-magic-def-boost').value) || 0;
    const mySpeedBoost = parseFloat(document.getElementById('my-speed-boost').value) || 0;

    const enemyPhysAtkBoost = parseFloat(document.getElementById('enemy-phys-atk-boost').value) || 0;
    const enemyMagicAtkBoost = parseFloat(document.getElementById('enemy-magic-atk-boost').value) || 0;
    const enemyPhysDefBoost = parseFloat(document.getElementById('enemy-phys-def-boost').value) || 0;
    const enemyMagicDefBoost = parseFloat(document.getElementById('enemy-magic-def-boost').value) || 0;
    const enemySpeedBoost = parseFloat(document.getElementById('enemy-speed-boost').value) || 0;

    // 计算最终显示属性（应用能力等级百分比）
    const myDisplayAttrs = {
        hp: myBaseAttrs.hp,
        atk: Math.ceil(myBaseAttrs.atk * (1 + myPhysAtkBoost)),
        def: Math.ceil(myBaseAttrs.def * (1 + myPhysDefBoost)),
        spa: Math.ceil(myBaseAttrs.spa * (1 + myMagicAtkBoost)),
        spd: Math.ceil(myBaseAttrs.spd * (1 + myMagicDefBoost)),
        spe: Math.ceil(myBaseAttrs.spe * (1 + mySpeedBoost))
    };

    const enemyDisplayAttrs = {
        hp: enemyBaseAttrs.hp,
        atk: Math.ceil(enemyBaseAttrs.atk * (1 + enemyPhysAtkBoost)),
        def: Math.ceil(enemyBaseAttrs.def * (1 + enemyPhysDefBoost)),
        spa: Math.ceil(enemyBaseAttrs.spa * (1 + enemyMagicAtkBoost)),
        spd: Math.ceil(enemyBaseAttrs.spd * (1 + enemyMagicDefBoost)),
        spe: Math.ceil(enemyBaseAttrs.spe * (1 + enemySpeedBoost))
    };

    // 显示计算后的属性（使用提升后的属性用于显示）
    displayAttributes('my', myDisplayAttrs);
    displayAttributes('enemy', enemyDisplayAttrs);

    // 获取我方战斗参数
    const myResponseMultiplier = parseFloat(document.getElementById('my-response-multiplier').value) || 1;
    const myPowerBonus = parseInt(document.getElementById('my-power-bonus').value) || 0;
    const myPowerBoost = parseFloat(document.getElementById('my-power-boost').value) || 0;
    const myDamageReduction = parseFloat(document.getElementById('my-damage-reduction').value) || 0;
    const myWeatherEffect = parseFloat(document.getElementById('my-weather-effect').value) || 0;

    // 获取敌方战斗参数
    const enemyResponseMultiplier = parseFloat(document.getElementById('enemy-response-multiplier').value) || 1;
    const enemyPowerBonus = parseInt(document.getElementById('enemy-power-bonus').value) || 0;
    const enemyPowerBoost = parseFloat(document.getElementById('enemy-power-boost').value) || 0;
    const enemyDamageReduction = parseFloat(document.getElementById('enemy-damage-reduction').value) || 0;
    const enemyWeatherEffect = parseFloat(document.getElementById('enemy-weather-effect').value) || 0;
    

    
    // 计算克制关系
    const myWeakness = await calculateWeakness(mySelectedSkill.attr_id, enemyPet.attr1, enemyPet.attr2);
    const enemyWeakness = await calculateWeakness(enemySelectedSkill.attr_id, myPet.attr1, myPet.attr2);
    
    // 获取额外连击次数
    let myExtraCombo = 0;
    let enemyExtraCombo = 0;
    
    if (mySelectedSkill.can_hit === 1) {
        const myComboInput = document.querySelector(`#my-skills input[data-skill-id="${mySelectedSkill.skill_id}"]`);
        if (myComboInput) {
            myExtraCombo = parseInt(myComboInput.value) || 0;
        }
    }
    
    if (enemySelectedSkill.can_hit === 1) {
        const enemyComboInput = document.querySelector(`#enemy-skills input[data-skill-id="${enemySelectedSkill.skill_id}"]`);
        if (enemyComboInput) {
            enemyExtraCombo = parseInt(enemyComboInput.value) || 0;
        }
    }
    
    // 计算伤害（使用基础属性进行计算）
    // 我方攻击：使用我方攻击力、我方技能的敌方防御参数、我方战斗参数
    // 根据技能类型选择攻击提升属性
    let myAttackBoost = myPhysAtkBoost;
    if (mySelectedSkill.type_id === 2) { // 魔攻
        myAttackBoost = myMagicAtkBoost;
    }
    // 根据技能类型选择敌方防御提升属性
    let enemyDefenseBoost = enemyPhysDefBoost;
    if (mySelectedSkill.type_id === 2) { // 魔攻
        enemyDefenseBoost = enemyMagicDefBoost;
    }
    let myDamage = await calculateBattleDamage(
        myBaseAttrs.atk,
        enemyBaseAttrs.def,
        enemyBaseAttrs.spd,
        mySelectedSkill.power,
        mySelectedSkill.type_id,
        myWeakness,
        myResponseMultiplier,
        myPowerBonus,
        myPowerBoost,
        enemyDamageReduction,
        myWeatherEffect,
        myAttackBoost, // 攻击提升
        0, // 敌方防御降低（暂未实现）
        0, // 我方攻击降低（暂未实现）
        enemyDefenseBoost // 敌方防御提升
    );

    // 敌方攻击：使用敌方攻击力、敌方技能的我方防御参数、敌方战斗参数
    // 根据技能类型选择攻击提升属性
    let enemyAttackBoost = enemyPhysAtkBoost;
    if (enemySelectedSkill.type_id === 2) { // 魔攻
        enemyAttackBoost = enemyMagicAtkBoost;
    }
    // 根据技能类型选择我方防御提升属性
    let myDefenseBoost = myPhysDefBoost;
    if (enemySelectedSkill.type_id === 2) { // 魔攻
        myDefenseBoost = myMagicDefBoost;
    }
    let enemyDamage = await calculateBattleDamage(
        enemyBaseAttrs.atk,
        myBaseAttrs.def,
        myBaseAttrs.spd,
        enemySelectedSkill.power,
        enemySelectedSkill.type_id,
        enemyWeakness,
        enemyResponseMultiplier,
        enemyPowerBonus,
        enemyPowerBoost,
        myDamageReduction,
        enemyWeatherEffect,
        enemyAttackBoost, // 攻击提升
        0, // 我方防御降低（暂未实现）
        0, // 敌方攻击降低（暂未实现）
        myDefenseBoost // 我方防御提升
    );
    
    // 应用额外连击次数
    if (mySelectedSkill.can_hit === 1) {
        myDamage = myDamage * (mySelectedSkill.hit_count + myExtraCombo);
    }
    
    if (enemySelectedSkill.can_hit === 1) {
        enemyDamage = enemyDamage * (enemySelectedSkill.hit_count + enemyExtraCombo);
    }
    
    // 计算需要的攻击次数（使用基础属性中的HP）
    const myHitCount = Math.ceil(enemyBaseAttrs.hp / myDamage);
    const enemyHitCount = Math.ceil(myBaseAttrs.hp / enemyDamage);
    
    // 显示结果
    document.getElementById('my-skill-name').textContent = mySelectedSkill.name;
    document.getElementById('my-damage').textContent = myDamage;
    document.getElementById('my-hit-count').textContent = myHitCount;
    document.getElementById('enemy-skill-name').textContent = enemySelectedSkill.name;
    document.getElementById('enemy-damage').textContent = enemyDamage;
    document.getElementById('enemy-hit-count').textContent = enemyHitCount;
    document.getElementById('result').classList.remove('hidden');
}

// 计算战斗伤害
function calculateBattleDamage(attackerAtk, defenderDef, defenderSpd, skillPower, skillType, weaknessMultiplier, responseMultiplier, powerBonus, powerBoost, damageReduction, weatherEffect, attackBoost=0, defenseReduction=0, attackReduction=0, defenseBoost=0) {
    return new Promise((resolve) => {
        fetch('/api/calculate/damage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                attacker_atk: attackerAtk,
                defender_def: defenderDef,
                defender_spd: defenderSpd,
                skill_power: skillPower,
                skill_type: skillType,
                weakness_multiplier: weaknessMultiplier,
                response_multiplier: responseMultiplier,
                power_bonus: powerBonus,
                power_boost: powerBoost,
                damage_reduction: damageReduction,
                weather_effect: weatherEffect,
                attack_boost: attackBoost,
                defense_reduction: defenseReduction,
                attack_reduction: attackReduction,
                defense_boost: defenseBoost
            })
        })
        .then(response => response.json())
        .then(data => {
            resolve(data.damage);
        });
    });
}

// 计算克制关系
function calculateWeakness(attackAttr, defendAttr1, defendAttr2) {
    return new Promise((resolve) => {
        fetch('/api/calculate/weakness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                attack_attr: attackAttr.toString(),
                defend_attr1: defendAttr1.toString(),
                defend_attr2: defendAttr2 ? defendAttr2.toString() : '0'
            })
        })
        .then(response => response.json())
        .then(data => {
            resolve(data.multiplier);
        });
    });
}

// 计算宠物属性
function calculatePetAttributes(race, ivs, boostAttr, reductionAttr) {
    const attrs = {};
    
    // HP calculation
    let hpBoost = 0;
    let hpReduction = 0;
    if (boostAttr === 'hp') hpBoost = 0.2;
    if (reductionAttr === 'hp') hpReduction = 0.1;
    attrs.hp = Math.ceil((1.7 * race.hp + (ivs.hp || 0) * 0.85 * 6 + 70) * (1 + hpBoost - hpReduction) + 100);
    
    // Attack calculation
    let atkBoost = 0;
    let atkReduction = 0;
    if (boostAttr === 'atk') atkBoost = 0.2;
    if (reductionAttr === 'atk') atkReduction = 0.1;
    attrs.atk = Math.ceil((1.1 * race.atk + (ivs.atk || 0) * 0.55 * 6 + 10) * (1 + atkBoost - atkReduction) + 50);
    
    // Defense calculation
    let defBoost = 0;
    let defReduction = 0;
    if (boostAttr === 'def') defBoost = 0.2;
    if (reductionAttr === 'def') defReduction = 0.1;
    attrs.def = Math.ceil((1.1 * race.def + (ivs.def || 0) * 0.55 * 6 + 10) * (1 + defBoost - defReduction) + 50);
    
    // Special Attack calculation
    let spaBoost = 0;
    let spaReduction = 0;
    if (boostAttr === 'spa') spaBoost = 0.2;
    if (reductionAttr === 'spa') spaReduction = 0.1;
    attrs.spa = Math.ceil((1.1 * race.spa + (ivs.spa || 0) * 0.55 * 6 + 10) * (1 + spaBoost - spaReduction) + 50);
    
    // Special Defense calculation
    let spdBoost = 0;
    let spdReduction = 0;
    if (boostAttr === 'spd') spdBoost = 0.2;
    if (reductionAttr === 'spd') spdReduction = 0.1;
    attrs.spd = Math.ceil((1.1 * race.spd + (ivs.spd || 0) * 0.55 * 6 + 10) * (1 + spdBoost - spdReduction) + 50);
    
    // Speed calculation
    let speBoost = 0;
    let speReduction = 0;
    if (boostAttr === 'spe') speBoost = 0.2;
    if (reductionAttr === 'spe') speReduction = 0.1;
    attrs.spe = Math.ceil((1.1 * race.spe + (ivs.spe || 0) * 0.55 * 6 + 10) * (1 + speBoost - speReduction) + 50);
    
    return attrs;
}