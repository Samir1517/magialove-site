# -*- coding: utf-8 -*-
"""Извлечение триад Тень/Дар/Сиддхи из распознанной книги.

Ключи в книге идут по порядку 1..64 — это проверено сверкой номера блока с
номерами в теле каждой главы («11-я Тень», «29-го Дара»): расхождений ноль.
"""
import io
import json
import re

SRC = "G:/claud/magialove/books/dizajn-cheloveka.txt"
OUT = ("C:/Users/user/AppData/Local/Temp/claude/G--claud-magialove/"
       "7c803d84-a616-4d43-961d-220939d19bd0/scratchpad/triads-final.json")

L = io.open(SRC, encoding="utf-8").read().split("\n")
starts = [i for i, l in enumerate(L) if re.match(r"^\s*ГЕННЫЙ\s*$", l)]

LEVEL = r"(ТЕНЬ|ДАР|СИДДХИ)"
# «ДАР И СИДДХИ — СВОБОДА»: у 55-х ключей оба уровня названы одним словом.
COMBO = re.compile(r"^\s*(?:\d\s?\d?-(?:Я|Й)\s+)?ДАР\s+И\s+СИДДХИ\s*[—–-]\s*(.+?)\s*$", re.I)
# Обычный заголовок, в том числе с номером впереди и строчными буквами.
DASH = re.compile(r"^\s*(?:\d\s?\d?-(?:Я|Й)\s+)?" + LEVEL + r"\s*[—–-]\s*(.+?)\s*$", re.I)
# Без тире («СИДДХИ БЛАГОДАТИ») — только короткая строка целиком заглавными,
# иначе шаблон цепляет обычные предложения из текста главы.
NODASH = re.compile(r"^\s*(?:\d\s?\d?-(?:Я|Й)\s+)?" + LEVEL + r"\s+([А-ЯЁ]{4,}(?:\s+[А-ЯЁ]{3,})?)\s*$")

res = {}
for k, s in enumerate(starts):
    e = starts[k + 1] if k + 1 < len(starts) else len(L)
    lv = {}
    for i in range(s, e):
        line = L[i]
        m = COMBO.match(line)
        if m:
            for key in ("ДАР", "СИДДХИ"):
                lv.setdefault(key, m.group(1).strip())
            continue
        m = DASH.match(line)
        if not m and len(line.strip()) <= 28:
            m = NODASH.match(line)
        # Имя уровня всегда короткое (самое длинное — «Универсальная любовь»).
        # Без верхней границы шаблон цепляет обычные предложения из текста: у
        # 55-х ключей глава длинная, и «СИДДХИ — Это качество Прозрачности…»
        # попадало в данные вместо «Свобода».
        if m and 2 < len(m.group(2).strip()) <= 40:
            lv.setdefault(m.group(1).upper(), m.group(2).strip())
    res[k + 1] = lv

# Правки заголовков, покалеченных распознаванием. Каждая подтверждена телом главы.
FIXES = {
    # Заголовок не распознан вовсе. В главе: «квантовый скачок от 29-го Дара в
    # 29-ю Сиддхи», «программный партнёр этой сиддхи — 30-я Сиддхи Восторга, и
    # эти два слова — преданность и восторг — неразделимы».
    29: ("СИДДХИ", "Преданность"),
    # В книге «СИДДХИ БЛАГОДАТИ» — родительный падеж. Именительный берётся из
    # перечня печатей: «Седьмая Печать — Благодать — 22-я Сиддхи».
    22: ("СИДДХИ", "Благодать"),
    # В книге «ДАР ЛОВКОСТИ» — тоже родительный.
    26: ("ДАР", "Ловкость"),
}
for gate, (level, value) in FIXES.items():
    res[gate][level] = value


def norm(s):
    s = s.strip().rstrip(".")
    return s[0].upper() + s[1:].lower() if s.isupper() else s[0].upper() + s[1:]


incomplete = {g: v for g, v in res.items() if len(v) < 3}
print("блоков:", len(starts))
print("полных ключей:", sum(1 for v in res.values() if len(v) == 3), "из 64")
print("неполные:", incomplete)

out = {g: {k: norm(v) for k, v in res[g].items()} for g in sorted(res)}
io.open(OUT, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
for g in (1, 6, 22, 26, 29, 55, 57, 61, 64):
    print(g, out[g])
