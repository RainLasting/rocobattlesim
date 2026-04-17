import json
from PIL import Image, ImageDraw, ImageFont

# ---------------------- 配置 ----------------------
JSON_PATH = "rock_kid_weakness.json"
OUTPUT_IMG = "rock_type_chart.png"

# 字体（Windows 自带；Mac/Linux 自行改路径）
FONT_PATH = "msyh.ttc"  # 微软雅黑
FONT_SIZE = 14
CELL_W = 70
CELL_H = 30
PADDING = 5

# ---------------------------------------------------

def load_data(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def draw_type_chart(data):
    attrs = data["attribute_order"]
    multiplier = data["multiplier"]
    n = len(attrs)

    # 画布尺寸
    width = CELL_W * (n + 1)
    height = CELL_H * (n + 1)
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # 字体
    try:
        font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
    except:
        font = ImageFont.load_default()

    # 画顶部（防御方）
    for j, attr in enumerate(attrs):
        x = (j + 1) * CELL_W + PADDING
        y = PADDING
        draw.text((x, y), attr, fill="black", font=font)

    # 画左侧（攻击方）
    for i, attr in enumerate(attrs):
        x = PADDING
        y = (i + 1) * CELL_H + PADDING
        draw.text((x, y), attr, fill="black", font=font)

    # 画格子内容
    for i, att in enumerate(attrs):
        for j, df in enumerate(attrs):
            val = multiplier[att][df]
            if val == 2.0:
                text = "↑2×"
                color = (0, 180, 0)  # 绿
            elif val == 0.5:
                text = "↓½"
                color = (220, 0, 0)  # 红
            else:
                text = "—"
                color = (0, 0, 0)

            x = (j + 1) * CELL_W + PADDING + 20
            y = (i + 1) * CELL_H + PADDING
            draw.text((x, y), text, fill=color, font=font)

    # 画网格线
    for i in range(n + 2):
        # 横线
        draw.line([(0, i * CELL_H), (width, i * CELL_H)], fill="lightgray")
        # 竖线
        draw.line([(i * CELL_W, 0), (i * CELL_W, height)], fill="lightgray")

    img.save(OUTPUT_IMG)
    print(f"图片已保存：{OUTPUT_IMG}")

if __name__ == "__main__":
    data = load_data(JSON_PATH)
    draw_type_chart(data)