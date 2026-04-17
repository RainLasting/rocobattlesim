import json

# 加载属性克制数据
def load_weakness_table(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

# 单属性伤害倍率计算
def get_multiplier(attack_attr: str, defend_attr: str, weakness_data: dict) -> float:
    return weakness_data["multiplier"][attack_attr][defend_attr]

# ===================== 【已修正】双属性伤害计算 =====================
# 规则：
# 2.0 × 2.0 = 3.0  双重克制
# 0.5 × 0.5 = 1/3  双重抵抗
# 2.0 × 0.5 = 1.0  一克一抗
# ==================================================================
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

# ------------------- 测试示例 -------------------
if __name__ == "__main__":
    weakness_data = load_weakness_table("rock_kid_weakness.json")

    # 测试1：双重克制 → 3倍
    m1 = get_multiplier_dual("幽系", "武系", "恶系", weakness_data)
    print(f"幽系 → 武+恶 双重克制：{m1:.2f} 倍")  # 输出 3.00

    # 测试2：双重抵抗 → 1/3倍
    m2 = get_multiplier_dual("火系", "草系", "虫系", weakness_data)
    print(f"火系 → 草+虫 双重抵抗：{m2:.2f} 倍")  # 输出 0.33

    # 测试3：一克一抗 → 1倍
    m3 = get_multiplier_dual("火系", "草系", "水系", weakness_data)
    print(f"火系 → 草+水 一克一抗：{m3:.2f} 倍")  # 输出 1.00