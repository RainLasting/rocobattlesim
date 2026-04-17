/**
 * 技能配置模块
 * 处理技能选择、配置等功能
 */

// 打开技能配置模态框
function openSkillConfigModal(pet, side) {
    currentSkillConfigPet = pet;
    currentSkillConfigSide = side;
    selectedSkills = [];
    
    // 加载宠物技能
    loadAllSkillsForConfig(pet.pet_id);
    
    // 设置模态框标题
    document.getElementById('skill-config-side').textContent = side === 'my' ? '我方' : '敌方';
    
    // 显示模态框
    document.getElementById('skill-config-modal').classList.remove('hidden');
}

// 关闭技能配置模态框
function closeSkillConfigModal() {
    document.getElementById('skill-config-modal').classList.add('hidden');
}

// 加载宠物所有技能
function loadAllSkillsForConfig(petId) {
    fetch(`/api/skills/${petId}`)
        .then(response => response.json())
        .then(skills => {
            allSkills = skills;
            filterAndDisplaySkills();
            updateSelectedSkillsDisplay();
        });
}

// 筛选并显示技能
function filterAndDisplaySkills() {
    const typeFilter = document.getElementById('skill-type-filter').value;
    const powerFilter = parseInt(document.getElementById('skill-power-filter').value);
    
    // 筛选技能
    const filteredSkills = allSkills.filter(skill => {
        // 类型筛选
        if (typeFilter !== '0' && String(skill.type_id) !== typeFilter) {
            return false;
        }
        // 威力筛选
        if (skill.power > powerFilter) {
            return false;
        }
        return true;
    });
    
    // 显示技能
    const container = document.getElementById('skill-list-container');
    container.innerHTML = '';
    
    filteredSkills.forEach(skill => {
        const isSelected = selectedSkills.some(s => s.skill_id === skill.skill_id);
        const isDisabled = selectedSkills.length >= 4 && !isSelected;
        
        const skillCard = document.createElement('div');
        skillCard.className = `p-3 border rounded-md transition-all duration-200 ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
        
        skillCard.innerHTML = `
            <div class="font-medium">${skill.name}</div>
            <div class="text-sm text-gray-600">类型: ${skillTypes[skill.type_id]} | 威力: ${skill.power}</div>
            <div class="text-sm text-gray-600">属性: ${attrMap[skill.attr_id]}</div>
            <div class="text-xs text-gray-500 mt-1">${skill.desc}</div>
            ${isSelected ? '<div class="mt-2 text-xs text-blue-600 font-medium">已选择</div>' : ''}
        `;
        
        if (!isDisabled) {
            skillCard.addEventListener('click', function() {
                toggleSkillSelection(skill);
            });
        }
        
        container.appendChild(skillCard);
    });
}

// 切换技能选择状态
function toggleSkillSelection(skill) {
    const index = selectedSkills.findIndex(s => s.skill_id === skill.skill_id);
    
    if (index > -1) {
        // 取消选择
        selectedSkills.splice(index, 1);
    } else {
        // 选择技能（最多4个）
        if (selectedSkills.length < 4) {
            selectedSkills.push(skill);
        }
    }
    
    // 更新显示
    filterAndDisplaySkills();
    updateSelectedSkillsDisplay();
}

// 更新已选技能显示
function updateSelectedSkillsDisplay() {
    const container = document.getElementById('selected-skills-container');
    container.innerHTML = '';
    
    if (selectedSkills.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-4">还未选择技能</div>';
        return;
    }
    
    selectedSkills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'p-3 border border-blue-200 bg-blue-50 rounded-md relative';
        
        skillCard.innerHTML = `
            <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div class="font-medium">${skill.name}</div>
            <div class="text-sm text-gray-600">类型: ${skillTypes[skill.type_id]}</div>
            <div class="text-sm text-gray-600">威力: ${skill.power}</div>
        `;
        
        // 添加取消选择事件
        const removeBtn = skillCard.querySelector('button');
        removeBtn.addEventListener('click', function() {
            toggleSkillSelection(skill);
        });
        
        container.appendChild(skillCard);
    });
}

// 确认技能选择
function confirmSkillSelection() {
    if (selectedSkills.length === 0) {
        alert('请至少选择一个技能');
        return;
    }
    
    // 加载选中的技能
    if (currentSkillConfigSide === 'my') {
        mySkills = selectedSkills;
        loadPetSkills(currentSkillConfigPet.pet_id, 'my');
    } else {
        enemySkills = selectedSkills;
        loadPetSkills(currentSkillConfigPet.pet_id, 'enemy');
    }
    
    // 关闭模态框
    closeSkillConfigModal();
}

// 加载宠物技能
function loadPetSkills(petId, side) {
    const skills = side === 'my' ? mySkills : enemySkills;
    
    const skillsDiv = document.getElementById(`${side}-skills`);
    skillsDiv.innerHTML = '';
    
    // 设置2x2网格布局
    skillsDiv.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
    
    skills.forEach(skill => {
        // 计算弱点倍率
        let multiplier = 1;
        if ((side === 'my' && enemyPet) || (side === 'enemy' && myPet)) {
            const attackAttr = skill.attr_id;
            const defendPet = side === 'my' ? enemyPet : myPet;
            const defendAttr1 = defendPet.attr1;
            const defendAttr2 = defendPet.attr2;
            
            if (defendAttr2) {
                // 双属性
                const m1 = getMultiplier(attackAttr, defendAttr1);
                const m2 = getMultiplier(attackAttr, defendAttr2);
                
                if (m1 === 2.0 && m2 === 2.0) {
                    multiplier = 3.0;
                } else if (m1 === 0.5 && m2 === 0.5) {
                    multiplier = 1 / 3;
                } else {
                    multiplier = m1 * m2;
                }
            } else {
                // 单属性
                multiplier = getMultiplier(attackAttr, defendAttr1);
            }
        }
        
        // 获取箭头图标
        const arrowIcon = getWeaknessArrow(multiplier);
        
        const skillDiv = document.createElement('div');
        skillDiv.className = 'p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer';
        skillDiv.innerHTML = `
            <div class="font-medium">${skill.name}</div>
            <div class="text-sm text-gray-600">威力: ${skill.power} | 属性: ${attrMap[skill.attr_id]} ${arrowIcon}</div>
            <div class="text-xs text-gray-500">${skill.desc}</div>
            ${skill.can_hit === 1 ? `<div class="mt-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">额外连击次数</label>
                <input type="number" class="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" min="0" value="0" data-skill-id="${skill.skill_id}">
            </div>` : ''}
        `;
        skillDiv.addEventListener('click', function() {
            if (side === 'my') {
                mySelectedSkill = skill;
            } else {
                enemySelectedSkill = skill;
            }
            // 高亮选中的技能
            const skillDivs = skillsDiv.querySelectorAll('div');
            skillDivs.forEach(div => div.classList.remove('bg-blue-50', 'border-blue-300'));
            skillDiv.classList.add('bg-blue-50', 'border-blue-300');
        });
        
        // 为额外连击输入字段添加验证
        if (skill.can_hit === 1) {
            const comboInput = skillDiv.querySelector('input[data-skill-id]');
            if (comboInput) {
                comboInput.addEventListener('input', function() {
                    validateComboInput(this);
                });
            }
        }
        
        skillsDiv.appendChild(skillDiv);
    });
}