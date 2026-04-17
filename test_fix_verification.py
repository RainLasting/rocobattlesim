"""
测试能力提升和威力提升（百分比）功能
验证修复是否成功
"""

import requests
import json

def test_power_boost_and_ability_level():
    """测试能力提升和威力提升功能"""
    print("=" * 70)
    print("测试能力提升和威力提升功能")
    print("=" * 70)

    # API端点
    api_url = "http://localhost:5011/api/calculate/damage"

    # 基础参数
    base_params = {
        "attacker_atk": 100,
        "defender_def": 50,
        "defender_spd": 50,
        "skill_power": 100,
        "skill_type": 1,
        "weakness_multiplier": 1,
        "response_multiplier": 1,
        "power_bonus": 0,
        "power_boost": 0,
        "damage_reduction": 0,
        "weather_effect": 0,
        "attack_boost": 0,
        "defense_reduction": 0,
        "attack_reduction": 0,
        "defense_boost": 0
    }

    # 测试1: 基础伤害（对照）
    print("\n测试1: 基础伤害（对照）")
    response = requests.post(api_url, json=base_params)
    base_damage = response.json()['damage']
    print(f"  基础伤害: {base_damage}")

    # 测试2: 威力提升（百分比）
    print("\n测试2: 威力提升（百分比）")
    params_boost = base_params.copy()
    params_boost['power_boost'] = 0.5  # 50%提升
    response = requests.post(api_url, json=params_boost)
    boost_damage = response.json()['damage']
    print(f"  威力提升50%伤害: {boost_damage}")
    print(f"  预期: 基础伤害 × 1.5 = {base_damage * 1.5}")
    print(f"  状态: {'✓' if boost_damage > base_damage else '✗'}")

    # 测试3: 能力等级提升
    print("\n测试3: 能力等级提升")
    params_ability = base_params.copy()
    params_ability['attack_boost'] = 1.0  # 100%攻击提升
    response = requests.post(api_url, json=params_ability)
    ability_damage = response.json()['damage']
    print(f"  攻击提升100%伤害: {ability_damage}")
    print(f"  预期: 基础伤害 × 2 = {base_damage * 2}")
    print(f"  状态: {'✓' if ability_damage > base_damage else '✗'}")

    # 测试4: 威力提升 + 能力等级提升
    print("\n测试4: 威力提升 + 能力等级提升")
    params_combined = base_params.copy()
    params_combined['power_boost'] = 0.5  # 50%提升
    params_combined['attack_boost'] = 1.0  # 100%攻击提升
    response = requests.post(api_url, json=params_combined)
    combined_damage = response.json()['damage']
    print(f"  威力提升50% + 攻击提升100%伤害: {combined_damage}")
    print(f"  预期: 基础伤害 × 1.5 × 2 = {base_damage * 1.5 * 2}")
    print(f"  状态: {'✓' if combined_damage > max(boost_damage, ability_damage) else '✗'}")

    # 测试5: 魔法攻击 + 能力等级
    print("\n测试5: 魔法攻击 + 能力等级")
    params_magic = base_params.copy()
    params_magic['skill_type'] = 2  # 魔攻
    params_magic['defender_spd'] = 80  # 魔防
    params_magic['attack_boost'] = 1.0  # 100%攻击提升
    response = requests.post(api_url, json=params_magic)
    magic_damage = response.json()['damage']
    # 先计算基础魔攻伤害
    params_magic_base = params_magic.copy()
    params_magic_base['attack_boost'] = 0
    response_base = requests.post(api_url, json=params_magic_base)
    magic_base_damage = response_base.json()['damage']
    print(f"  魔法攻击基础伤害: {magic_base_damage}")
    print(f"  魔法攻击+攻击提升100%伤害: {magic_damage}")
    print(f"  预期: 魔法基础伤害 × 2 = {magic_base_damage * 2}")
    print(f"  状态: {'✓' if magic_damage > magic_base_damage else '✗'}")

    print("\n" + "=" * 70)
    print("测试完成")
    print("=" * 70)


if __name__ == "__main__":
    test_power_boost_and_ability_level()