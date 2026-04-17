from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
import os
import math

app = Flask(__name__)
CORS(app)

# 加载属性克制数据
def load_weakness_table():
    with open("attr/attr_map.json", "r", encoding="utf-8") as f:
        return json.load(f)

# 加载宠物数据
def load_pets():
    pets = []
    pet_dir = "pet/1-10"
    for filename in os.listdir(pet_dir):
        if filename.endswith(".json"):
            with open(os.path.join(pet_dir, filename), "r", encoding="utf-8") as f:
                pet = json.load(f)
                pets.append(pet)
    return pets

# 加载技能数据
def load_skills():
    skills = {}
    for root, dirs, files in os.walk("petskill"):
        for filename in files:
            if filename.endswith(".json") and filename != "skill_types.json":
                with open(os.path.join(root, filename), "r", encoding="utf-8") as f:
                    skill = json.load(f)
                    skills[skill["skill_id"]] = skill
    return skills

# 单属性伤害倍率计算
def get_multiplier(attack_attr: str, defend_attr: str, weakness_data: dict) -> float:
    return weakness_data["multiplier"][attack_attr][defend_attr]

# 双属性伤害计算
def get_multiplier_dual(attack_attr: str, defend_attr1: str, defend_attr2: str, weakness_data: dict) -> float:
    m1 = weakness_data["multiplier"][attack_attr][defend_attr1]
    m2 = weakness_data["multiplier"][attack_attr][defend_attr2]
    
    # 双重克制
    if m1 == 2.0 and m2 == 2.0:
        return 3.0
    # 双重抵抗
    elif m1 == 0.5 and m2 == 0.5:
        return 1 / 3
    # 一克制一抵抗 → 抵消
    else:
        return m1 * m2

# 属性计算
def calculate_attributes(race, iv, boost):
    attributes = {}
    # 生命计算公式
    attributes["hp"] = math.ceil((1.7 * race["hp"] + iv * 0.85 * 6 + 70) * (1 + boost) + 100)
    # 其他属性计算公式
    for attr in ["atk", "def", "spa", "spd", "spe"]:
        attributes[attr] = math.ceil((1.1 * race[attr] + iv * 0.55 * 6 + 10) * (1 + boost) + 50)
    return attributes

# 伤害计算
def calculate_damage(attacker_atk, defender_def, skill_power, weakness_multiplier, response_multiplier=1, power_bonus=0, ability_level=1, power_boost=0, damage_reduction=0, weather_effect=0):
    # 技能威力计算
    skill_power_calc = power_boost * weakness_multiplier * (1 - damage_reduction) * (1 + weather_effect)
    # 伤害计算公式
    damage = math.ceil((attacker_atk / defender_def) * 0.9 * (skill_power * response_multiplier + power_bonus) * ability_level)
    return damage

# 能力等级计算
def calculate_ability_level(attack_boost, defense_reduction, attack_reduction, defense_boost):
    return (1 + attack_boost + defense_reduction) / (1 + attack_reduction + defense_boost)

# 加载数据
weakness_data = load_weakness_table()
pets = load_pets()
skills = load_skills()

# API路由

# 获取宠物列表
@app.route('/api/pets', methods=['GET'])
def get_pets():
    return jsonify(pets)

# 获取宠物详细信息
@app.route('/api/pet/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    for pet in pets:
        if pet["pet_id"] == pet_id:
            return jsonify(pet)
    return jsonify({"error": "Pet not found"}), 404

# 获取宠物可装备技能
@app.route('/api/skills/<int:pet_id>', methods=['GET'])
def get_pet_skills(pet_id):
    for pet in pets:
        if pet["pet_id"] == pet_id:
            pet_skills = []
            for skill_id in pet["skills"]:
                if skill_id in skills:
                    pet_skills.append(skills[skill_id])
            return jsonify(pet_skills)
    return jsonify({"error": "Pet not found"}), 404

# 获取技能详细信息
@app.route('/api/skill/<int:skill_id>', methods=['GET'])
def get_skill(skill_id):
    if skill_id in skills:
        return jsonify(skills[skill_id])
    return jsonify({"error": "Skill not found"}), 404

# 计算宠物属性
@app.route('/api/calculate/attributes', methods=['POST'])
def calculate_pet_attributes():
    data = request.json
    race = data.get("race")
    iv = data.get("iv", 0)
    boost = data.get("boost", 0)
    
    if not race:
        return jsonify({"error": "Race data is required"}), 400
    
    attributes = calculate_attributes(race, iv, boost)
    return jsonify(attributes)

# 计算伤害
@app.route('/api/calculate/damage', methods=['POST'])
def calculate_battle_damage():
    data = request.json
    attacker_atk = data.get("attacker_atk")
    defender_def = data.get("defender_def")
    skill_power = data.get("skill_power")
    weakness_multiplier = data.get("weakness_multiplier", 1)
    response_multiplier = data.get("response_multiplier", 1)
    power_bonus = data.get("power_bonus", 0)
    ability_level = data.get("ability_level", 1)
    power_boost = data.get("power_boost", 0)
    damage_reduction = data.get("damage_reduction", 0)
    weather_effect = data.get("weather_effect", 0)
    
    if None in [attacker_atk, defender_def, skill_power]:
        return jsonify({"error": "Missing required parameters"}), 400
    
    damage = calculate_damage(attacker_atk, defender_def, skill_power, weakness_multiplier, response_multiplier, power_bonus, ability_level, power_boost, damage_reduction, weather_effect)
    return jsonify({"damage": damage})

# 计算属性克制关系
@app.route('/api/calculate/weakness', methods=['POST'])
def calculate_weakness():
    data = request.json
    attack_attr = data.get("attack_attr")
    defend_attr1 = data.get("defend_attr1")
    defend_attr2 = data.get("defend_attr2", "0")
    
    if not attack_attr or not defend_attr1:
        return jsonify({"error": "Missing required parameters"}), 400
    
    if defend_attr2 == "0":
        multiplier = get_multiplier(attack_attr, defend_attr1, weakness_data)
    else:
        multiplier = get_multiplier_dual(attack_attr, defend_attr1, defend_attr2, weakness_data)
    
    return jsonify({"multiplier": multiplier})

# 主页面
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5010)