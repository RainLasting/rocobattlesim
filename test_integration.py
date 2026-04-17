"""
战斗系统集成测试
验证完整的伤害计算流程
"""

import requests
import json

def test_integration():
    """集成测试：测试完整的伤害计算API"""
    print("=" * 70)
    print("战斗系统集成测试")
    print("=" * 70)

    # API端点
    api_url = "http://localhost:5011/api/calculate/damage"

    # 测试用例1：基础伤害
    print("\n测试1: 基础伤害计算")
    data1 = {
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

    try:
        response = requests.post(api_url, json=data1)
        result = response.json()
        print(f"  输入: 基础参数")
        print(f"  输出: 伤害 = {result['damage']}")
        print(f"  预期: 180")
        print(f"  状态: {'✓' if result['damage'] == 180 else '✗'}")
    except Exception as e:
        print(f"  错误: {e}")

    # 测试用例2：能力等级提升
    print("\n测试2: 能力等级提升")
    data2 = {
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
        "attack_boost": 1.0,  # 100%提升
        "defense_reduction": 0,
        "attack_reduction": 0,
        "defense_boost": 0
    }

    try:
        response = requests.post(api_url, json=data2)
        result = response.json()
        print(f"  输入: 攻击提升100%")
        print(f"  输出: 伤害 = {result['damage']}")
        print(f"  预期: 360")
        print(f"  状态: {'✓' if result['damage'] == 360 else '✗'}")
    except Exception as e:
        print(f"  错误: {e}")

    # 测试用例3：威力加成和提升
    print("\n测试3: 威力加成和提升")
    data3 = {
        "attacker_atk": 100,
        "defender_def": 50,
        "defender_spd": 50,
        "skill_power": 100,
        "skill_type": 1,
        "weakness_multiplier": 1,
        "response_multiplier": 1,
        "power_bonus": 50,
        "power_boost": 0.5,  # 50%
        "damage_reduction": 0,
        "weather_effect": 0,
        "attack_boost": 0,
        "defense_reduction": 0,
        "attack_reduction": 0,
        "defense_boost": 0
    }

    try:
        response = requests.post(api_url, json=data3)
        result = response.json()
        print(f"  输入: 威力加成+50, 威力提升50%")
        print(f"  输出: 伤害 = {result['damage']}")
        print(f"  预期: 405")
        print(f"  状态: {'✓' if result['damage'] == 405 else '✗'}")
    except Exception as e:
        print(f"  错误: {e}")

    # 测试用例4：魔法攻击
    print("\n测试4: 魔法攻击")
    data4 = {
        "attacker_atk": 100,
        "defender_def": 50,
        "defender_spd": 80,  # 魔防
        "skill_power": 100,
        "skill_type": 2,  # 魔攻
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

    try:
        response = requests.post(api_url, json=data4)
        result = response.json()
        print(f"  输入: 魔攻, 魔防=80")
        print(f"  输出: 伤害 = {result['damage']}")
        print(f"  预期: 113")
        print(f"  状态: {'✓' if result['damage'] == 113 else '✗'}")
    except Exception as e:
        print(f"  错误: {e}")

    print("\n" + "=" * 70)
    print("集成测试完成")
    print("=" * 70)


if __name__ == "__main__":
    test_integration()