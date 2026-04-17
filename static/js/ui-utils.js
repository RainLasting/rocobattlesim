/**
 * UI工具模块
 * 处理界面显示、DOM操作等功能
 */

// 根据血量百分比获取背景色类名
function getHpBarColorClass(current, initial) {
    if (initial === 0) return 'bg-gray-100';
    
    const percentage = current / initial;
    
    if (percentage >= 0.6667) {
        return 'bg-green-100';
    } else if (percentage > 0.3333) {
        return 'bg-yellow-100';
    } else {
        return 'bg-red-100';
    }
}

// 显示计算后的属性
function displayAttributes(side, attrs) {
    const attrDiv = document.getElementById(`${side}-attributes`);
    if (attrDiv) {
        // 初始化血量数据
        if (hpData[side].initial === 0) {
            hpData[side].initial = attrs.hp;
            hpData[side].current = attrs.hp;
        }
        
        const hpBarColorClass = getHpBarColorClass(hpData[side].current, hpData[side].initial);
        
        attrDiv.innerHTML = `
            <div class="grid grid-cols-2 gap-2 mt-2">
                <div>HP: <span class="font-medium">${attrs.hp}</span></div>
                <div>攻击: <span class="font-medium">${attrs.atk}</span></div>
                <div>防御: <span class="font-medium">${attrs.def}</span></div>
                <div>特攻: <span class="font-medium">${attrs.spa}</span></div>
                <div>特防: <span class="font-medium">${attrs.spd}</span></div>
                <div>速度: <span class="font-medium">${attrs.spe}</span></div>
            </div>
            <div class="mt-3 p-2 border border-gray-300 rounded-md ${hpBarColorClass} text-center transition-colors duration-300">
                <span class="font-medium text-gray-800">${hpData[side].current}/${hpData[side].initial}</span>
            </div>
        `;
        attrDiv.classList.remove('hidden');
    }
}

// 验证额外连击输入
function validateComboInput(input) {
    let value = parseInt(input.value);
    if (isNaN(value)) {
        value = 0;
    } else if (value < 0) {
        value = 0;
    }
    input.value = value;
}

// 获取属性克制倍率
function getMultiplier(attackAttr, defendAttr) {
    // 转换为字符串以匹配属性映射
    attackAttr = String(attackAttr);
    defendAttr = String(defendAttr);
    
    if (multiplierData && multiplierData[attackAttr] && multiplierData[attackAttr][defendAttr]) {
        return multiplierData[attackAttr][defendAttr];
    }
    return 1.0;
}

// 获取弱点箭头图标
function getWeaknessArrow(multiplier) {
    if (multiplier > 1) {
        return '<span class="text-red-600 font-bold">↑</span>';
    } else if (multiplier < 1) {
        return '<span class="text-blue-600 font-bold">↓</span>';
    }
    return '';
}

// 生成个体值下拉菜单选项
function generateIvDropdownOptions() {
    const dropdowns = [
        'my-iv-dropdown1', 'my-iv-dropdown2', 'my-iv-dropdown3',
        'enemy-iv-dropdown1', 'enemy-iv-dropdown2', 'enemy-iv-dropdown3'
    ];
    
    dropdowns.forEach(dropdownId => {
        const contentId = dropdownId + '-content';
        const content = document.getElementById(contentId);
        if (content) {
            content.innerHTML = '';
            for (let i = 0; i <= 10; i++) {
                const div = document.createElement('div');
                div.className = 'p-1 hover:bg-gray-100 cursor-pointer text-center';
                div.textContent = i;
                div.onclick = function() {
                    const valueId = dropdownId.replace('dropdown', 'value');
                    selectIvValue(valueId, i, dropdownId);
                };
                content.appendChild(div);
            }
        }
    });
}

// 切换个体值下拉菜单（带智能定位）
function toggleIvDropdown(dropdownId) {
    // 关闭所有其他下拉菜单
    const allDropdowns = document.querySelectorAll('[id$="-dropdown1"], [id$="-dropdown2"], [id$="-dropdown3"]');
    allDropdowns.forEach(dropdown => {
        if (dropdown.id !== dropdownId) {
            dropdown.classList.add('hidden');
        }
    });
    
    // 切换当前下拉菜单
    const dropdown = document.getElementById(dropdownId);
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
        // 计算智能定位
        const button = dropdown.previousElementSibling;
        const buttonRect = button.getBoundingClientRect();
        const dropdownHeight = 260; // 约11项 * 高度 + padding
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // 重置所有定位类
        dropdown.classList.remove('dropdown-up', 'dropdown-left');
        dropdown.style.left = '';
        dropdown.style.right = '';
        
        // 下方空间不足，向上展开
        if (buttonRect.bottom + dropdownHeight > viewportHeight - 20) {
            dropdown.classList.add('dropdown-up');
        }
        
        // 右侧空间不足，向左对齐
        if (buttonRect.left + dropdown.offsetWidth > viewportWidth - 20) {
            dropdown.classList.add('dropdown-left');
        }
    }
    
    dropdown.classList.toggle('hidden');
}

// 选择个体值
function selectIvValue(valueId, value, dropdownId) {
    document.getElementById(valueId).textContent = value;
    document.getElementById(dropdownId).classList.add('hidden');
    updateIvAttributeOptions();
    calculateRealTimeAttributes();
}

// 更新个体值属性选项（互斥逻辑）
function updateIvAttributeOptions() {
    const sides = ['my', 'enemy'];
    sides.forEach(side => {
        const currentSelects = [
            document.getElementById(`${side}-iv-attr1`),
            document.getElementById(`${side}-iv-attr2`),
            document.getElementById(`${side}-iv-attr3`)
        ];
        
        // 获取当前选中的值
        const selectedValues = currentSelects.map(select => select.value);
        
        // 获取所有已选择的属性
        const usedValues = selectedValues.filter(v => v !== null && v !== undefined);
        
        // 更新每个选择器的选项
        currentSelects.forEach((currentSelect, currentIndex) => {
            const options = currentSelect.options;
            const currentValue = currentSelect.value;
            
            // 遍历所有选项
            for (let i = 0; i < options.length; i++) {
                const optionValue = options[i].value;
                
                // 检查该选项是否被其他选择器使用
                const isUsedByOther = usedValues.some((selected, idx) => 
                    idx !== currentIndex && selected === optionValue
                );
                
                // 如果被其他选择器使用且不是当前选择器的值，则禁用
                options[i].disabled = isUsedByOther && optionValue !== currentValue;
            }
        });
    });
}

// 更新增益/减益选项（互斥逻辑）
function updateBoostReductionOptions(side) {
    const boostSelect = document.getElementById(`${side}-boost`);
    const reductionSelect = document.getElementById(`${side}-reduction`);
    
    const boostValue = boostSelect.value;
    const reductionValue = reductionSelect.value;
    
    // 遍历reduction选项
    for (let i = 0; i < reductionSelect.options.length; i++) {
        const optionValue = reductionSelect.options[i].value;
        // 如果boost选择了某个属性（非"无"），则在reduction中禁用该属性
        if (optionValue !== "0" && optionValue === boostValue) {
            reductionSelect.options[i].disabled = true;
        } else {
            reductionSelect.options[i].disabled = false;
        }
    }
    
    // 遍历boost选项
    for (let i = 0; i < boostSelect.options.length; i++) {
        const optionValue = boostSelect.options[i].value;
        // 如果reduction选择了某个属性（非"无"），则在boost中禁用该属性
        if (optionValue !== "0" && optionValue === reductionValue) {
            boostSelect.options[i].disabled = true;
        } else {
            boostSelect.options[i].disabled = false;
        }
    }
}

// 获取个体值对象
function getIvObject(side) {
    const ivs = {};
    for (let i = 1; i <= 3; i++) {
        const attr = document.getElementById(`${side}-iv-attr${i}`).value;
        const value = parseInt(document.getElementById(`${side}-iv-value${i}`).textContent) || 0;
        ivs[attr] = (ivs[attr] || 0) + value;
    }
    return ivs;
}

// 实时计算属性
function calculateRealTimeAttributes() {
    // 计算我方属性
    if (myPet) {
        const myIv = getIvObject('my');
        const myBoostAttr = document.getElementById('my-boost').value;
        const myReductionAttr = document.getElementById('my-reduction').value;
        const myBaseAttrs = calculatePetAttributes(myPet.race, myIv, myBoostAttr, myReductionAttr);

        // 获取能力等级百分比
        const myPhysAtkBoost = parseFloat(document.getElementById('my-phys-atk-boost').value) || 0;
        const myMagicAtkBoost = parseFloat(document.getElementById('my-magic-atk-boost').value) || 0;
        const myPhysDefBoost = parseFloat(document.getElementById('my-phys-def-boost').value) || 0;
        const myMagicDefBoost = parseFloat(document.getElementById('my-magic-def-boost').value) || 0;
        const mySpeedBoost = parseFloat(document.getElementById('my-speed-boost').value) || 0;

        // 计算最终显示属性（应用能力等级百分比）
        const myDisplayAttrs = {
            hp: myBaseAttrs.hp,
            atk: Math.ceil(myBaseAttrs.atk * (1 + myPhysAtkBoost)),
            def: Math.ceil(myBaseAttrs.def * (1 + myPhysDefBoost)),
            spa: Math.ceil(myBaseAttrs.spa * (1 + myMagicAtkBoost)),
            spd: Math.ceil(myBaseAttrs.spd * (1 + myMagicDefBoost)),
            spe: Math.ceil(myBaseAttrs.spe * (1 + mySpeedBoost))
        };

        displayAttributes('my', myDisplayAttrs);
    }

    // 计算敌方属性
    if (enemyPet) {
        const enemyIv = getIvObject('enemy');
        const enemyBoostAttr = document.getElementById('enemy-boost').value;
        const enemyReductionAttr = document.getElementById('enemy-reduction').value;
        const enemyBaseAttrs = calculatePetAttributes(enemyPet.race, enemyIv, enemyBoostAttr, enemyReductionAttr);

        // 获取能力等级百分比
        const enemyPhysAtkBoost = parseFloat(document.getElementById('enemy-phys-atk-boost').value) || 0;
        const enemyMagicAtkBoost = parseFloat(document.getElementById('enemy-magic-atk-boost').value) || 0;
        const enemyPhysDefBoost = parseFloat(document.getElementById('enemy-phys-def-boost').value) || 0;
        const enemyMagicDefBoost = parseFloat(document.getElementById('enemy-magic-def-boost').value) || 0;
        const enemySpeedBoost = parseFloat(document.getElementById('enemy-speed-boost').value) || 0;

        // 计算最终显示属性（应用能力等级百分比）
        const enemyDisplayAttrs = {
            hp: enemyBaseAttrs.hp,
            atk: Math.ceil(enemyBaseAttrs.atk * (1 + enemyPhysAtkBoost)),
            def: Math.ceil(enemyBaseAttrs.def * (1 + enemyPhysDefBoost)),
            spa: Math.ceil(enemyBaseAttrs.spa * (1 + enemyMagicAtkBoost)),
            spd: Math.ceil(enemyBaseAttrs.spd * (1 + enemyMagicDefBoost)),
            spe: Math.ceil(enemyBaseAttrs.spe * (1 + enemySpeedBoost))
        };

        displayAttributes('enemy', enemyDisplayAttrs);
    }
}