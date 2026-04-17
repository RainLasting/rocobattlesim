/**
 * 事件处理模块
 * 处理页面事件监听和响应
 */

// 设置事件监听器
function setupEventListeners() {
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateDamage);
    
    // 下一回合按钮
    document.getElementById('next-turn-btn').addEventListener('click', handleNextTurn);
    
    // 实时计算事件监听器
    // 我方个体值相关
    document.getElementById('my-iv-attr1').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('my-iv-attr2').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('my-iv-attr3').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('my-iv-value1').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-iv-value2').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-iv-value3').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-boost').addEventListener('change', function() { updateBoostReductionOptions('my'); calculateRealTimeAttributes(); });
    document.getElementById('my-reduction').addEventListener('change', function() { updateBoostReductionOptions('my'); calculateRealTimeAttributes(); });
    
    // 敌方个体值相关
    document.getElementById('enemy-iv-attr1').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('enemy-iv-attr2').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('enemy-iv-attr3').addEventListener('change', function() { updateIvAttributeOptions(); calculateRealTimeAttributes(); });
    document.getElementById('enemy-iv-value1').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-iv-value2').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-iv-value3').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-boost').addEventListener('change', function() { updateBoostReductionOptions('enemy'); calculateRealTimeAttributes(); });
    document.getElementById('enemy-reduction').addEventListener('change', function() { updateBoostReductionOptions('enemy'); calculateRealTimeAttributes(); });

    // 我方能力等级相关
    document.getElementById('my-phys-atk-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-magic-atk-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-phys-def-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-magic-def-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('my-speed-boost').addEventListener('input', calculateRealTimeAttributes);

    // 敌方能力等级相关
    document.getElementById('enemy-phys-atk-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-magic-atk-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-phys-def-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-magic-def-boost').addEventListener('input', calculateRealTimeAttributes);
    document.getElementById('enemy-speed-boost').addEventListener('input', calculateRealTimeAttributes);

    // 技能重新选择按钮
    document.getElementById('my-reselect-skills').addEventListener('click', function() {
        if (myPet) {
            openSkillConfigModal(myPet, 'my');
        }
    });
    
    document.getElementById('enemy-reselect-skills').addEventListener('click', function() {
        if (enemyPet) {
            openSkillConfigModal(enemyPet, 'enemy');
        }
    });
    
    // 初始化互斥逻辑
    updateIvAttributeOptions();
    updateBoostReductionOptions('my');
    updateBoostReductionOptions('enemy');
}

// 下一回合按钮点击事件
function handleNextTurn() {
    // 获取当前伤害值
    const myDamage = parseFloat(document.getElementById('my-damage').textContent) || 0;
    const enemyDamage = parseFloat(document.getElementById('enemy-damage').textContent) || 0;
    
    // 更新血量
    hpData.enemy.current = Math.max(0, hpData.enemy.current - myDamage);
    hpData.my.current = Math.max(0, hpData.my.current - enemyDamage);
    
    // 重新计算并显示属性
    calculateRealTimeAttributes();
}

// 点击外部关闭下拉菜单
document.addEventListener('click', function(event) {
    const allDropdowns = document.querySelectorAll('[id$="-dropdown1"], [id$="-dropdown2"], [id$="-dropdown3"]');
    const allButtons = document.querySelectorAll('[onclick^="toggleIvDropdown"]');
    
    let clickedInside = false;
    allButtons.forEach(button => {
        if (button.contains(event.target)) {
            clickedInside = true;
        }
    });
    
    allDropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
            clickedInside = true;
        }
    });
    
    if (!clickedInside) {
        allDropdowns.forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});