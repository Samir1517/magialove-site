/**
 * Часовые пояса для ввода места рождения.
 *
 * Почему пояс, а не город: движкам эфемерид нужна только IANA-таймзона, чтобы
 * перевести местное время рождения в UTC (историческое летнее время при этом
 * учитывается корректно — этим занимается date-fns-tz). Широта и долгота
 * понадобятся только для расчёта асцендента и домов, которых текущие движки
 * не считают. Поэтому просим минимум, а не полный адрес.
 */

export interface TimezoneOption {
  tz: string;
  label: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { tz: "Europe/Kaliningrad", label: "Калининград (MSK−1)" },
  { tz: "Europe/Moscow", label: "Москва, Санкт-Петербург (MSK)" },
  { tz: "Europe/Samara", label: "Самара, Ижевск (MSK+1)" },
  { tz: "Asia/Yekaterinburg", label: "Екатеринбург, Пермь, Уфа (MSK+2)" },
  { tz: "Asia/Omsk", label: "Омск (MSK+3)" },
  { tz: "Asia/Krasnoyarsk", label: "Красноярск, Новокузнецк (MSK+4)" },
  { tz: "Asia/Novosibirsk", label: "Новосибирск, Томск (MSK+4)" },
  { tz: "Asia/Irkutsk", label: "Иркутск, Улан-Удэ (MSK+5)" },
  { tz: "Asia/Yakutsk", label: "Якутск, Чита (MSK+6)" },
  { tz: "Asia/Vladivostok", label: "Владивосток, Хабаровск (MSK+7)" },
  { tz: "Asia/Magadan", label: "Магадан, Южно-Сахалинск (MSK+8)" },
  { tz: "Asia/Kamchatka", label: "Петропавловск-Камчатский (MSK+9)" },
  { tz: "Europe/Minsk", label: "Минск" },
  { tz: "Europe/Kyiv", label: "Киев" },
  { tz: "Europe/Chisinau", label: "Кишинёв" },
  { tz: "Asia/Tbilisi", label: "Тбилиси" },
  { tz: "Asia/Yerevan", label: "Ереван" },
  { tz: "Asia/Baku", label: "Баку" },
  { tz: "Asia/Almaty", label: "Алматы, Астана" },
  { tz: "Asia/Bishkek", label: "Бишкек" },
  { tz: "Asia/Tashkent", label: "Ташкент" },
  { tz: "Asia/Dushanbe", label: "Душанбе" },
  { tz: "Asia/Ashgabat", label: "Ашхабад" },
  { tz: "Europe/Riga", label: "Рига" },
  { tz: "Europe/Vilnius", label: "Вильнюс" },
  { tz: "Europe/Tallinn", label: "Таллин" },
  { tz: "Europe/Berlin", label: "Берлин, Варшава, Прага" },
  { tz: "Europe/London", label: "Лондон" },
  { tz: "Asia/Jerusalem", label: "Тель-Авив, Иерусалим" },
  { tz: "Asia/Dubai", label: "Дубай" },
  { tz: "America/New_York", label: "Нью-Йорк" },
  { tz: "America/Los_Angeles", label: "Лос-Анджелес" },
];

export const DEFAULT_TZ = "Europe/Moscow";
