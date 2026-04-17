from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
import os
import math
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
CORS(app)

# 数据缓存
weakness_data = None
pets = []
skills = {}

# 加载属性克制数据
def load_weakness_table():
    with open("attr/attr_map.json", "r", encoding="utf-8") as f:
        return json.load(f)

# 加载宠物数据 - 扫描pet目录下所有子目录
def load_pets():
    global pets
    pets = []
    pet_dir = "pet"
    if not os.path.exists(pet_dir):
        return pets
    for root, dirs, files in os.walk(pet_dir):
        for filename in files:
            if filename.endswith(".json"):
                try:
                    with open(os.path.join(root, filename), "r", encoding="utf-8") as f:
                        pet = json.load(f)
                        pets.append(pet)
                except Exception as e:
                    print(f"Error loading pet file {filename}: {e}")
    return pets

# 加载技能数据 - 扫描petskill目录下所有子目录
def load_skills():
    global skills
    skills = {}
    petskill_dir = "petskill"
    if not os.path.exists(petskill_dir):
        return skills
    for root, dirs, files in os.walk(petskill_dir):
        for filename in files:
            if filename.endswith(".json") and filename != "skill_types.json":
                try:
                    with open(os.path.join(root, filename), "r", encoding="utf-8") as f:
                        skill = json.load(f)
                        skills[skill["skill_id"]] = skill
                except Exception as e:
                    print(f"Error loading skill file {filename}: {e}")
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
def calculate_damage(attacker_atk, defender_def, defender_spd, skill_power, skill_type, weakness_multiplier, response_multiplier=1, power_bonus=0, power_boost=0, damage_reduction=0, weather_effect=0, attack_boost=0, defense_reduction=0, attack_reduction=0, defense_boost=0):
    # 根据技能类型选择防御属性
    # skill_type: 1=物攻(物理), 2=魔攻(魔法), 3=防御, 4=状态
    if skill_type == 2:
        actual_defender_def = defender_spd
    else:
        actual_defender_def = defender_def

    # 计算能力等级
    ability_level = calculate_ability_level(attack_boost, defense_reduction, attack_reduction, defense_boost)

    # 新伤害计算公式
    # 伤害=进攻方攻击/防御方防御*0.9*（技能威力*应对倍率+威力加成）*能力等级*（1+威力提升）*克制关系*天气影响*（1-减伤）
    damage = math.ceil(
        (attacker_atk / actual_defender_def) * 0.9 *
        (skill_power * response_multiplier + power_bonus) *
        ability_level *
        (1 + power_boost) *
        weakness_multiplier *
        (1 + weather_effect) *
        (1 - damage_reduction)
    )
    return damage

# 能力等级计算
def calculate_ability_level(attack_boost, defense_reduction, attack_reduction, defense_boost):
    return (1 + attack_boost + defense_reduction) / (1 + attack_reduction + defense_boost)

# 加载数据
weakness_data = load_weakness_table()
pets = load_pets()
skills = load_skills()

# 数据文件监听处理器
class DataFileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.json'):
            print(f"检测到新文件: {event.src_path}")
            self.reload_data(event.src_path)
    
    def on_deleted(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.json'):
            print(f"检测到文件删除: {event.src_path}")
            self.reload_data(event.src_path)
    
    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.json'):
            print(f"检测到文件修改: {event.src_path}")
            self.reload_data(event.src_path)
    
    def on_moved(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.json') or event.dest_path.endswith('.json'):
            print(f"检测到文件移动: {event.src_path} -> {event.dest_path}")
            self.reload_data(event.dest_path)
    
    def reload_data(self, file_path):
        global pets, skills
        if 'petskill' in file_path:
            print("重新加载技能数据...")
            load_skills()
        elif 'pet' in file_path:
            print("重新加载宠物数据...")
            load_pets()

# 启动文件监听器
def start_file_watcher():
    observer = Observer()
    event_handler = DataFileHandler()
    
    # 监听宠物目录
    pet_dir = os.path.abspath("pet")
    if os.path.exists(pet_dir):
        observer.schedule(event_handler, pet_dir, recursive=True)
        print(f"开始监听宠物目录: {pet_dir}")
    
    # 监听技能目录
    petskill_dir = os.path.abspath("petskill")
    if os.path.exists(petskill_dir):
        observer.schedule(event_handler, petskill_dir, recursive=True)
        print(f"开始监听技能目录: {petskill_dir}")
    
    observer.start()
    return observer

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
    defender_spd = data.get("defender_spd")
    skill_power = data.get("skill_power")
    skill_type = data.get("skill_type")
    weakness_multiplier = data.get("weakness_multiplier", 1)
    response_multiplier = data.get("response_multiplier", 1)
    power_bonus = data.get("power_bonus", 0)
    power_boost = data.get("power_boost", 0)
    damage_reduction = data.get("damage_reduction", 0)
    weather_effect = data.get("weather_effect", 0)
    # 能力等级相关参数
    attack_boost = data.get("attack_boost", 0)
    defense_reduction = data.get("defense_reduction", 0)
    attack_reduction = data.get("attack_reduction", 0)
    defense_boost = data.get("defense_boost", 0)

    if None in [attacker_atk, defender_def, defender_spd, skill_power, skill_type]:
        return jsonify({"error": "Missing required parameters"}), 400

    damage = calculate_damage(attacker_atk, defender_def, defender_spd, skill_power, skill_type, weakness_multiplier, response_multiplier, power_bonus, power_boost, damage_reduction, weather_effect, attack_boost, defense_reduction, attack_reduction, defense_boost)
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
    observer = start_file_watcher()
    try:
        app.run(debug=True, port=5011)
    except KeyboardInterrupt:
        print("停止文件监听器...")
        observer.stop()
    observer.join()