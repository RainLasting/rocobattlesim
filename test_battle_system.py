"""
战斗系统单元测试
验证能力等级和伤害计算的准确性
"""

import math
import unittest
from app import calculate_ability_level, calculate_damage

class TestBattleSystem(unittest.TestCase):
    """战斗系统单元测试类"""

    def test_ability_level_calculation(self):
        """测试能力等级计算"""
        # 测试案例1: 我方攻击提升100%，敌方防御不变
        # 预期结果: (1 + 1.0 + 0) / (1 + 0 + 0) = 2
        result = calculate_ability_level(1.0, 0, 0, 0)
        self.assertAlmostEqual(result, 2.0, places=5)

        # 测试案例2: 我方攻击降低50%，敌方防御提升50%
        # 预期结果: (1 + 0 + 0) / (1 + 0.5 + 0.5) = 0.5
        result = calculate_ability_level(0, 0, 0.5, 0.5)
        self.assertAlmostEqual(result, 0.5, places=5)

        # 测试案例3: 我方攻击提升50%，敌方防御降低25%
        # 预期结果: (1 + 0.5 + 0.25) / (1 + 0 + 0) = 1.75
        result = calculate_ability_level(0.5, 0.25, 0, 0)
        self.assertAlmostEqual(result, 1.75, places=5)

        # 测试案例4: 我方攻击降低30%，敌方防御提升20%
        # 预期结果: (1 + 0 + 0) / (1 + 0.3 + 0.2) = 0.666666...
        result = calculate_ability_level(0, 0, 0.3, 0.2)
        self.assertAlmostEqual(result, 0.6666666666666666, places=5)

        # 测试案例5: 无任何提升或降低
        # 预期结果: (1 + 0 + 0) / (1 + 0 + 0) = 1
        result = calculate_ability_level(0, 0, 0, 0)
        self.assertAlmostEqual(result, 1.0, places=5)

    def test_damage_calculation_basic(self):
        """测试基础伤害计算"""
        # 基础参数
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 50,
            'skill_power': 100,
            'skill_type': 1,  # 物攻
            'weakness_multiplier': 1,
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0,
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 测试基础伤害
        # 公式: (100/50)*0.9*(100*1+0)*1*(1+0)*1*(1+0)*(1-0) = 180
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 180)

    def test_damage_calculation_with_power_bonus(self):
        """测试威力加成（数值）"""
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 50,
            'skill_power': 100,
            'skill_type': 1,
            'weakness_multiplier': 1,
            'response_multiplier': 1,
            'power_bonus': 50,
            'power_boost': 0,
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 公式: (100/50)*0.9*(100*1+50)*1*(1+0)*1*(1+0)*(1-0) = 270
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 270)

    def test_damage_calculation_with_power_boost(self):
        """测试威力提升（百分比）"""
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 50,
            'skill_power': 100,
            'skill_type': 1,
            'weakness_multiplier': 1,
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0.5,  # 50%
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 公式: (100/50)*0.9*(100*1+0)*1*(1+0.5)*1*(1+0)*(1-0) = 270
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 270)

    def test_damage_calculation_with_ability_level(self):
        """测试能力等级影响"""
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 50,
            'skill_power': 100,
            'skill_type': 1,
            'weakness_multiplier': 1,
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0,
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 1.0,  # 100%提升
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 公式: (100/50)*0.9*(100*1+0)*2*(1+0)*1*(1+0)*(1-0) = 360
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 360)

    def test_damage_calculation_with_weakness(self):
        """测试属性克制"""
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 50,
            'skill_power': 100,
            'skill_type': 1,
            'weakness_multiplier': 2.0,  # 克制
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0,
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 公式: (100/50)*0.9*(100*1+0)*1*(1+0)*2*(1+0)*(1-0) = 360
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 360)

    def test_damage_calculation_with_magic_attack(self):
        """测试魔法攻击（使用速度作为防御）"""
        base_params = {
            'attacker_atk': 100,
            'defender_def': 50,
            'defender_spd': 80,  # 魔防
            'skill_power': 100,
            'skill_type': 2,  # 魔攻
            'weakness_multiplier': 1,
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0,
            'damage_reduction': 0,
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 公式: (100/80)*0.9*(100*1+0)*1*(1+0)*1*(1+0)*(1-0) = 112.5 → 113
        damage = calculate_damage(**base_params)
        self.assertEqual(damage, 113)

    def test_damage_calculation_with_all_factors(self):
        """测试所有因素综合影响"""
        # 测试所有因素综合影响
        # 修正后的参数，确保结果合理
        params = {
            'attacker_atk': 100,
            'defender_def': 100,  # 防御=攻击，确保基础比例为1
            'defender_spd': 100,
            'skill_power': 100,
            'skill_type': 1,
            'weakness_multiplier': 2.0,
            'response_multiplier': 1.2,
            'power_bonus': 20,
            'power_boost': 0.5,
            'damage_reduction': 0.2,
            'weather_effect': 0.1,
            'attack_boost': 1.0,  # 100%提升
            'defense_reduction': 0,
            'attack_reduction': 0,
            'defense_boost': 0
        }

        # 计算过程：
        # (100/100)*0.9 = 0.9
        # (100*1.2 + 20) = 140
        # 140 * 2 (能力等级) = 280
        # 280 * 1.5 (威力提升) = 420
        # 420 * 2 (克制) = 840
        # 840 * 1.1 (天气) = 924
        # 924 * 0.8 (减伤) = 739.2
        # 0.9 * 739.2 = 665.28 → 666
        damage = calculate_damage(**params)
        self.assertEqual(damage, 666)

    def test_damage_calculation_edge_cases(self):
        """测试边界情况"""
        # 测试最小伤害（确保不会出现0或负数）
        params = {
            'attacker_atk': 1,
            'defender_def': 1000,
            'defender_spd': 1000,
            'skill_power': 1,
            'skill_type': 1,
            'weakness_multiplier': 0.33,  # 抵抗
            'response_multiplier': 1,
            'power_bonus': 0,
            'power_boost': 0,
            'damage_reduction': 0.9,  # 90%减伤
            'weather_effect': 0,
            'attack_boost': 0,
            'defense_reduction': 0,
            'attack_reduction': 0.5,  # 50%攻击降低
            'defense_boost': 1.0  # 100%防御提升
        }

        # 应该至少造成1点伤害
        damage = calculate_damage(**params)
        self.assertGreater(damage, 0)

if __name__ == '__main__':
    unittest.main()