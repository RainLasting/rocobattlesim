/**
 * 宠物过滤模块
 * 处理宠物筛选和选择功能
 */

// 加载所有宠物数据
function loadAllPets() {
    return new Promise((resolve) => {
        fetch('/api/pets')
            .then(response => response.json())
            .then(data => {
                allPets = data;
                filteredPets = data;
                resolve(data);
            });
    });
}

// 生成属性过滤选项
function generateAttrFilterOptions() {
    const container = document.getElementById('attr-filter-container');
    if (container) {
        container.innerHTML = '';
        Object.entries(attrMap).forEach(([id, name]) => {
            const button = document.createElement('button');
            button.className = 'attr-filter-btn px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors';
            button.textContent = name;
            button.dataset.value = id;
            button.addEventListener('click', function() {
                this.classList.toggle('bg-primary');
                this.classList.toggle('text-white');
                this.classList.toggle('border-primary');
                applyFilter();
            });
            container.appendChild(button);
        });
    }
}

// 打开过滤模态框
function openFilterModal(side) {
    currentFilterSide = side;
    document.getElementById('filter-side-label').textContent = side === 'my' ? '我方' : '敌方';
    currentPage = 1;
    applyFilter();
    document.getElementById('pet-filter-modal').classList.remove('hidden');
}

// 关闭过滤模态框
function closeFilterModal() {
    document.getElementById('pet-filter-modal').classList.add('hidden');
}

// 应用过滤
function applyFilter() {
    // 获取选择的属性
    const selectedAttrs = [];
    document.querySelectorAll('.attr-filter-btn.bg-primary').forEach(button => {
        selectedAttrs.push(button.dataset.value);
    });
    
    // 获取属性值过滤条件
    const statFilters = [];
    const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    stats.forEach(stat => {
        const valueElement = document.getElementById(`filter-${stat}-value`);
        const operatorElement = document.getElementById(`filter-${stat}-operator`);
        const value = valueElement ? parseInt(valueElement.value) || 0 : 0;
        const operator = operatorElement ? operatorElement.value : 'gte';
        statFilters.push({ stat, value, operator });
    });
    
    // 过滤宠物
    filteredPets = allPets.filter(pet => {
        // 检查属性过滤
        if (selectedAttrs.length > 0) {
            const petAttrs = [String(pet.attr1)];
            if (pet.attr2) {
                petAttrs.push(String(pet.attr2));
            }
            // 所有选择的属性都必须在宠物属性中
            const hasAllAttrs = selectedAttrs.every(attr => petAttrs.includes(attr));
            if (!hasAllAttrs) {
                return false;
            }
        }
        
        // 检查属性值过滤
        for (const filter of statFilters) {
            // 只有当值大于0时才进行过滤
            if (filter.value > 0) {
                const petValue = pet.race[filter.stat];
                switch (filter.operator) {
                    case 'gte':
                        if (petValue < filter.value) return false;
                        break;
                    case 'lte':
                        if (petValue > filter.value) return false;
                        break;
                    case 'eq':
                        if (petValue !== filter.value) return false;
                        break;
                }
            }
        }
        
        return true;
    });
    
    // 重置到第一页
    currentPage = 1;
    
    // 更新宠物列表显示
    updatePetFilterList();
}

// 更新宠物列表显示
function updatePetFilterList() {
    const listContainer = document.getElementById('pet-filter-list');
    const resultCount = document.getElementById('filter-result-count');
    const currentPageSpan = document.getElementById('filter-current-page');
    const totalPagesSpan = document.getElementById('filter-total-pages');
    const prevBtn = document.getElementById('filter-prev-btn');
    const nextBtn = document.getElementById('filter-next-btn');
    
    // 更新结果数量
    resultCount.textContent = filteredPets.length;
    
    // 计算总页数
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);
    totalPagesSpan.textContent = totalPages;
    currentPageSpan.textContent = currentPage;
    
    // 计算当前页的宠物
    const startIndex = (currentPage - 1) * petsPerPage;
    const endIndex = startIndex + petsPerPage;
    const currentPagePets = filteredPets.slice(startIndex, endIndex);
    
    // 显示宠物列表
    listContainer.innerHTML = '';
    currentPagePets.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'p-3 border rounded-md hover:bg-gray-50 cursor-pointer';
        petCard.innerHTML = `
            <div class="font-medium">${pet.name}</div>
            <div class="text-sm text-gray-600">属性: ${attrMap[pet.attr1]}${pet.attr2 ? `, ${attrMap[pet.attr2]}` : ''}</div>
            <div class="text-xs text-gray-500 mt-1">
                HP: ${pet.race.hp} | 攻击: ${pet.race.atk} | 防御: ${pet.race.def} | 特攻: ${pet.race.spa} | 特防: ${pet.race.spd} | 速度: ${pet.race.spe}
            </div>
        `;
        petCard.addEventListener('click', function() {
            selectPet(pet);
        });
        listContainer.appendChild(petCard);
    });
    
    // 更新分页按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // 添加分页按钮事件
    prevBtn.onclick = function() {
        if (currentPage > 1) {
            currentPage--;
            updatePetFilterList();
        }
    };
    
    nextBtn.onclick = function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePetFilterList();
        }
    };
}

// 选择宠物
function selectPet(pet) {
    if (currentFilterSide === 'my') {
        myPet = pet;
        // 显示宠物信息
        const petInfoDiv = document.getElementById('my-pet-info');
        petInfoDiv.classList.remove('hidden');
        petInfoDiv.querySelector('h4').textContent = pet.name;
        document.getElementById('my-attr1').textContent = attrMap[pet.attr1];
        document.getElementById('my-attr2').textContent = pet.attr2 ? attrMap[pet.attr2] : '无';
        document.getElementById('my-hp').textContent = pet.race.hp;
        document.getElementById('my-atk').textContent = pet.race.atk;
        document.getElementById('my-def').textContent = pet.race.def;
        document.getElementById('my-spa').textContent = pet.race.spa;
        document.getElementById('my-spd').textContent = pet.race.spd;
        document.getElementById('my-spe').textContent = pet.race.spe;
        
        // 打开技能配置模态框
        openSkillConfigModal(pet, 'my');
    } else {
        enemyPet = pet;
        // 显示宠物信息
        const petInfoDiv = document.getElementById('enemy-pet-info');
        petInfoDiv.classList.remove('hidden');
        petInfoDiv.querySelector('h4').textContent = pet.name;
        document.getElementById('enemy-attr1').textContent = attrMap[pet.attr1];
        document.getElementById('enemy-attr2').textContent = pet.attr2 ? attrMap[pet.attr2] : '无';
        document.getElementById('enemy-hp').textContent = pet.race.hp;
        document.getElementById('enemy-atk').textContent = pet.race.atk;
        document.getElementById('enemy-def').textContent = pet.race.def;
        document.getElementById('enemy-spa').textContent = pet.race.spa;
        document.getElementById('enemy-spd').textContent = pet.race.spd;
        document.getElementById('enemy-spe').textContent = pet.race.spe;
        
        // 打开技能配置模态框
        openSkillConfigModal(pet, 'enemy');
    }
    
    // 关闭过滤模态框
    closeFilterModal();
}