"use client";

import { useId, useRef, useState } from "react";
import { searchCities, findCityByTz, type City } from "@/lib/data/cities";
import styles from "./CityTimezoneInput.module.css";

/**
 * Автодополнение города рождения вместо списка часовых поясов: человеку проще
 * вспомнить и набрать название города, чем искать свой пояс относительно
 * Москвы в длинном списке.
 *
 * Наружу отдаём tz и координаты выбранного города. Координаты нужны Джйотишу
 * для лагны: она считается от местного звёздного времени, поэтому вывести её
 * из одного часового пояса нельзя — Europe/Moscow тянется от Калининградской
 * границы до Урала, а десять градусов долготы сдвигают асцендент почти на
 * целый знак. Координаты необязательны: по ссылкам без них расчёт работает
 * как раньше, просто без лагны.
 */
export function CityTimezoneInput({
  value,
  onChange,
  label = "Город (или часовой пояс) рождения",
}: {
  value: string;
  onChange: (tz: string, coords?: { lat: number; lon: number }) => void;
  label?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<City | null>(() => findCityByTz(value));
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = query.trim().length >= 2 ? searchCities(query) : [];
  const displayValue = query || (selected ? `${selected.name}, ${selected.region}` : "");

  function selectCity(city: City) {
    setSelected(city);
    setQuery("");
    setOpen(false);
    onChange(city.tz, { lat: city.lat, lon: city.lon });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCity(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <label className={styles.wrap}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && suggestions.length > 0 ? `${listId}-${highlighted}` : undefined}
        className={styles.input}
        value={displayValue}
        placeholder="Начни вводить: Моск…"
        autoComplete="off"
        onChange={(e) => {
          const v = e.target.value;
          setSelected(null);
          setQuery(v);
          setOpen(true);
          setHighlighted(0);
          // Отдаём наверх лучшее совпадение сразу, на каждом нажатии, а не
          // только когда человек ткнул в подсказку. Иначе в поле остаётся
          // «Салехард», а расчёт молча идёт по Москве — человек видит свой
          // город и получает чужую карту. Для лагны это целый знак разницы.
          // Промежуточные значения не важны: в форму уходит последнее.
          // Если совпадения нет, ничего не трогаем — лучше прежний известный
          // город, чем данные, которых не существует.
          const best = searchCities(v, 1)[0];
          if (best) onChange(best.tz, { lat: best.lat, lon: best.lon });
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Уходя из поля, доводим набранное до конца. Иначе в поле остаётся
          // «Салехард», а расчёт молча идёт по Москве: человек видит свой
          // город и получает чужую карту. Разница в два часа — это целый знак
          // лагны и, бывает, соседняя накшатра.
          blurTimer.current = setTimeout(() => {
            setOpen(false);
            const typed = query.trim();
            if (!typed) return;
            const best = searchCities(typed, 1)[0];
            // Нашли — выбираем сами. Не нашли — стираем набранное и
            // возвращаем прежний выбор, чтобы в поле не осталось названия,
            // за которым нет ни пояса, ни координат.
            if (best) selectCity(best);
            else setQuery("");
          }, 150);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && suggestions.length > 0 && (
        <ul id={listId} className={styles.list} role="listbox">
          {suggestions.map((c, i) => (
            <li key={`${c.name}-${c.region}`} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                id={`${listId}-${i}`}
                className={i === highlighted ? `${styles.option} ${styles.optionActive}` : styles.option}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  selectCity(c);
                }}
                onMouseEnter={() => setHighlighted(i)}
              >
                {c.name}
                <em>{c.region}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length >= 2 && suggestions.length === 0 && (
        <ul className={styles.list} role="listbox">
          {/* Раньше советовали «выбери ближайший крупный в своём поясе». Для
              часового пояса это было безобидно, но лагна считается от местного
              звёздного времени: город за сотни километров сдвинет восходящий
              знак. Теперь честно говорим, чем придётся заплатить. */}
          <li className={styles.empty}>
            Города нет в списке — возьми ближайший к месту рождения. Часовой пояс от этого
            не пострадает, а вот восходящий знак в Джйотише может сместиться, если город
            далеко.
          </li>
        </ul>
      )}
    </label>
  );
}
