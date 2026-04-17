---
name: "latex-formula-docs"
description: "Creates professional LaTeX math formula documentation in Markdown. Invoke when user asks to document formulas, create formula docs, or write mathematical expressions in Markdown."
---

# LaTeX Formula Documentation Writer

This skill helps create professional mathematical formula documentation using LaTeX syntax in Markdown files.

## When to Use

- User asks to document formulas
- User wants to create formula documentation
- User asks to write mathematical expressions with proper LaTeX rendering
- User needs to organize mathematical formulas in a clear, structured document

## Key Principles

1. **Always wrap formulas in `$$ ... $$`** for block-level rendering (display math)
2. **Wrap variable names in `$$ ... $$`** when they appear in text, tables, or descriptions (e.g., `race_{hp}` should be written as `$$race_{hp}$$`)
3. **Use `\lceil` and `\rceil`** for ceiling functions (向上取整)
4. **Use `\lfloor` and `\rfloor`** for floor functions (向下取整)
5. **Use `\times`** for multiplication symbol (×)
6. **Use `\div`** for division symbol (÷)
7. **Use `\frac{a}{b}`** for fractions
8. **Use `\left(` and `right)`** for automatic bracket sizing
9. **Use `\text{}`** for normal text within math mode
10. **Use `\left\{ ... \right.` for left curly braces with conditions

## Formula Formatting Template

### Block Formula ($$...$$)
```latex
$$
Formula_Expression = \text{中文解释}
$$
```

### Inline Formula ($...$)
```latex
变量公式: $x = y + z$
```

### Piecewise Function
```latex
$$
f(x) = \begin{cases}
value_1 & \text{condition}_1 \\
value_2 & \text{condition}_2 \\
value_3 & \text{otherwise}
\end{cases}
$$
```

### Multi-line Formula
```latex
$$
\begin{aligned}
Result_1 &= Formula_1 \\
Result_2 &= Formula_2
\end{aligned}
$$
```

## Variable Explanation Format

Always create a table with the following columns:
| 变量 | 中文含义 | 单位 | 取值范围 | 说明 |

## Document Structure Template

```markdown
# 标题

## 目录

## 1. 公式分类
### 1.1 子分类

$$ 
公式表达式 
$$

### 1.2 子分类

$$ 
公式表达式 
$$

## 2. 变量说明

| 变量 | 中文含义 | 单位 | 取值范围 | 说明 |
|------|---------|------|----------|------|
| $$var_name$$ | 解释 | 单位 | 范围 | 说明 |

> **Note**: When writing variable names in the "变量" column, always use `$$` without backticks for proper rendering. For example:
> - Write `$$race_{hp}$$` instead of `race_{hp}` or backtick-wrapped versions
> - Write `$$attacker_{atk}$$` instead of `attacker_{atk}`

## 3. 应用场景

- **场景描述**：说明
- **重要性**：为什么重要
```

## Example

For a damage calculation formula:

```markdown
## 伤害计算公式

$$
Damage = \left\lceil \left( \frac{attacker_{atk}}{defender_{def}} \right) \times 0.9 \times (skill_{power} \times weakness_{multiplier} + base_{bonus}) \times ability_{level} \right\rceil
$$

### 变量说明

| 变量 | 中文含义 | 单位 | 取值范围 | 说明 |
|------|---------|------|----------|------|
| $$attacker_{atk}$$ | 攻击方攻击力 | - | 正整数 | 攻击者的攻击属性最终值 |
| $$defender_{def}$$ | 防御方防御力 | - | 正整数 | 防御者的防御属性最终值 |
| $$skill_{power}$$ | 技能威力 | - | 正整数 | 技能的基础威力值 |
| $$weakness_{multiplier}$$ | 属性克制倍率 | - | 0.25-4.0 | 属性克制产生的伤害倍率 |
```

## Common LaTeX Commands Reference

| Purpose | Command |
|---------|---------|
| Ceiling | `\lceil x \rceil` |
| Floor | `\lfloor x \rfloor` |
| Fraction | `\frac{numerator}{denominator}` |
| Square Root | `\sqrt{x}` |
| Power/Superscript | `x^{power}` |
| Subscript | `x_{subscript}` |
| Multiplication | `\times` |
| Division | `\div` |
| Plus-Minus | `\pm` |
| Not Equal | `\neq` |
| Greater Than or Equal | `\geq` |
| Less Than or Equal | `\leq` |
| Infinity | `\infty` |
| Text in Math | `\text{text here}` |
| Left Paren Size | `\left(` |
| Right Paren Size | `\right)` |
| Curly Brace Case | `\begin{cases} ... \end{cases}` |