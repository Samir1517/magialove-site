# Как смотреть сайт на телефонных экранах

Окно браузера в нашей среде не переразмеривается: `resize_window` рапортует
успех, а вьюпорт остаётся десктопным. Превью-харнесс на страницах результата
отдаёт нули, потому что читает скрытую копию из Suspense. Поэтому мерить
приходится иначе.

## Рабочий способ: стенд из iframe

Открыть **любую страницу того же origin**, что и проверяемая (иначе не будет
доступа к содержимому), и подменить её содержимое стендом. На проде это
`https://magialove.ru/o-servise/`, на локальном — `http://localhost:3000/o-servise/`.

```js
document.documentElement.innerHTML =
  '<head><style>body{margin:0;background:#333;display:flex;gap:14px;padding:14px;' +
  'font:12px sans-serif;color:#fff}figure{margin:0}iframe{border:0;background:#fff;display:block}' +
  '</style></head><body></body>';

const devices = [[320, 568], [360, 800], [390, 844], [412, 915], [430, 932]];
const url = '/dzhyotish-sovmestimost/rezultat/?a=1990-05-01&at=14:30&atz=Europe/Moscow' +
  '&alat=55.75&alon=37.62&b=1982-12-18&bt=07:15&btz=Europe/Moscow&blat=55.75&blon=37.62';

for (const [w, h] of devices) {
  const f = document.createElement('figure');
  f.innerHTML = '<figcaption>' + w + 'x' + h + '</figcaption>';
  const i = document.createElement('iframe');
  i.width = w; i.height = h; i.src = url; i.id = 'f' + w;
  f.appendChild(i); document.body.appendChild(f);
}
```

Замер (отдельным вызовом, дав странице догрузиться):

```js
const out = [];
for (const [w, h] of [[320, 568], [360, 800], [390, 844], [412, 915], [430, 932]]) {
  const d = document.getElementById('f' + w).contentDocument, de = d.documentElement;
  const b = d.querySelector('[class*="shareBlock"]');
  const H = b ? Math.round(b.getBoundingClientRect().height) : 0;
  const over = [...d.querySelectorAll('body *')]
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > de.clientWidth + 1; })
    .map((e) => e.tagName + '.' + String(e.className).slice(0, 24));
  out.push({ экран: w + 'x' + h, текст: d.body.innerText.length, баннер: H,
    доля: H ? Math.round(H / h * 100) + '%' : '—',
    скролл: de.scrollWidth > de.clientWidth, вылезают: [...new Set(over)].slice(0, 3) });
}
JSON.stringify(out, null, 1);
```

## Важные оговорки

**Только против прода.** На дев-сервере страницы результата внутри iframe не
догидрируются — `innerText` остаётся `«Считаем…»`, длина 8. На проде это
статика, и всё читается нормально. Признак, что замер валиден: поле `текст`
больше 200.

**Проверять поле `текст` перед тем, как верить числам.** Ноль в `баннер` при
`текст: 8` означает не «блока нет», а «страница не дорисовалась».

**Один `circle` всегда в списке `вылезают`** — это декоративный круг внутри
своего SVG, он обрезается рамкой svg и до горизонтального скролла не доводит.
Ориентироваться надо на поле `скролл`.

## Что уже мерили этим способом

Баннер «Поделись» до правки, живой сайт:

| Экран | Высота баннера | Доля экрана |
|---|---|---|
| 320×568 | 733px | 129% |
| 390×844 | 783px | 93% |
| 412×915 | 778px | 85% |

Замер тогда поправил диагноз: на 320px карточка уже была сжата до 266px, а
блок всё равно 733 — остальное давали отступы, заголовок в три строки, подпись
и две кнопки. Одного ограничения карточки не хватило бы.
