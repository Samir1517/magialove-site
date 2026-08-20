import type { Metadata } from "next";
import Link from "next/link";

import { CONDITIONING_BY_CENTER } from "@/lib/content/human-design-pro";
import { GATE_IN_PAIR } from "@/lib/content/human-design-triads";
import { GENE_KEYS } from "@/lib/data/human_design/gene-keys";
import { applyGender } from "@/lib/content/gender";
import { calcPersonalDesign, calcComposite, toPersonChart } from "@/lib/engines/human_design";
import { makePerson } from "@/lib/engines/person";
import { Bodygraph } from "@/components/viz/Bodygraph";
import { SellerLine } from "@/components/result/SellerLine";
import { VignetteArt } from "./rezultat/ProArt";
import styles from "./prodazha.module.css";

/**
 * Продающая страница разбора «Почему именно он». 750 ₽.
 *
 * Тон-лестница (утверждена заказчиком): вход — прямая подруга (боль её
 * словами, без унижения), середина — снятие вины, вскрытие и живые фрагменты
 * разбора, финал и цена — спокойный эксперт. К моменту оплаты она видит
 * механику и честные оговорки, а не «подругу».
 *
 * Доверие без выдумок: отзывов, счётчиков и фото здесь нет и не будет —
 * их не существует. Вместо них: настоящие фрагменты продукта (импортированы
 * из контент-констант разбора, разойтись не могут), честные ограничения,
 * строка продавца. Возвраты убраны по решению заказчика (21.08.2026): цена
 * импульсная, риск снят показом настоящих фрагментов до оплаты.
 */

export const metadata: Metadata = {
  title: "«Почему именно он» — профессиональный разбор пары по Дизайну человека",
  description:
    "Почему тянет именно к нему — и почему именно он умеет делать больно. Профессиональный разбор пары по двум датам рождения: что вас держит, что не изменится никогда и как с этим обращаться. 750 ₽, готов сразу после оплаты.",
};

/**
 * Ссылка оплаты Продамуса. Плейсхолдер до подключения: заменить на платёжную
 * ссылку из кабинета (см. issledovaniya/04-vydacha-i-oplata-vyvody.md — поле
 * «Доступы к материалам» + Success URL на страницу rezultat).
 */
const PAYMENT_URL = "#kupit";

/** Род для фрагментов: умолчание продукта — она о нём. */
const g = (s: string) => applyGender(s, { self: "ж", other: "м" });

export default function PochemuImennoOnPage() {
  const ajna = CONDITIONING_BY_CENTER.ajna;
  const gGate = CONDITIONING_BY_CENTER.g;
  const greed = GATE_IN_PAIR[54];
  const greedKey = GENE_KEYS[54];

  // Пример карты пары для витрины: даты подобраны перебором так, чтобы карта
  // продавала. Все три электромагнитных канала — весомые темы пары: 6-59
  // «Близости», 19-49 «Синтеза», 30-41 «Узнавания»; общий — 1-8 «Вдохновения»;
  // всего 7 каналов, чтобы линии читались. Считается один раз на сборке;
  // геометрия — канонический Bodygraph из разбора.
  const exampleA = calcPersonalDesign(makePerson("1994-02-04", "17:37", "Europe/Moscow", undefined, "ж"));
  const exampleB = calcPersonalDesign(makePerson("1989-05-14", "11:16", "Europe/Moscow", undefined, "м"));
  const exampleComposite = calcComposite(exampleA, exampleB);

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.brand}>СОВМЕСТИМОСТЬ</Link>
        <Link href="/dizajn-cheloveka-sovmestimost/" className={styles.brand}>Дизайн человека</Link>
      </div>

      {/* ============ HERO: подруга ============ */}
      <header className={styles.hero}>
        <div className={styles.heroEyebrow}>Профессиональный разбор пары · Дизайн человека</div>
        <h1 className={styles.heroTitle}>Почему именно он</h1>
        <div className={styles.heroVignette}><VignetteArt /></div>
        <p className={styles.heroLead}>
          Почему тянет именно к нему — и почему именно он умеет делать больно.
          Это одно и то же место в вашей карте.
        </p>
        <p className={styles.heroSub}>
          Бесплатный расчёт на этом сайте отвечает, подходите ли вы. Профессиональный
          разбор — о другом: что вас на самом деле держит, что в нём не изменится никогда —
          и как с этим обращаться, чтобы оно работало на вас, а не против. Есть одна
          механика, из-за которой всё повторяется, — она ниже.
        </p>
        <a className={styles.cta} href="#kupit">Получить разбор пары — 750 ₽</a>
        <div className={styles.ctaNote}>Готов сразу после оплаты · ссылка остаётся навсегда</div>
      </header>

      {/* ============ УЗНАВАНИЕ: сцены ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Узнаёшь?</div>
        <h2 className={styles.h2}>Это происходит у вас годами — просто не имело названия</h2>
        <div className={styles.scenes}>
          <div className={styles.scene}>
            Ты говоришь наполовину. Он переформулирует — и выходит лучше, чем у тебя. Ты
            соглашаешься, потому что действительно лучше. И так двадцать раз. А на двадцать
            первый ты уже молчишь.
          </div>
          <div className={styles.scene}>
            Рядом с ним ты берёшься за всё подряд и не понимаешь, откуда столько сил. А через
            месяц лежишь без движения — и кажется, что это ты слабая.
          </div>
          <div className={styles.scene}>
            Он уехал — и вдруг непонятно, зачем эта работа, тот ли город и та ли ты вообще.
            Вернулся — снова ясно. И кажется, что ясность в нём.
          </div>
          <div className={styles.scene}>
            Ты всё про вас поняла ещё год назад. И до сих пор не можешь объяснить, почему
            тебя к нему так тянет.
          </div>
        </div>
      </section>

      {/* ============ РАЗВОРОТ: снятие вины ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Дело не в тебе</div>
        <h2 className={styles.h2}>И не в том, что ты «выбираешь не тех»</h2>
        <p className={styles.lede}>
          У каждого из вас с рождения есть карта: набор качеств, посчитанный по дате, времени
          и месту рождения. Когда две карты оказываются рядом, между ними возникает механика —
          одни места притягивают, другие изматывают, и это не про характер и не про «мало
          старались».
        </p>
        <div className={styles.turn}>
          <p className={styles.turnText}>
            Механизм притяжения и механизм боли — это буквально одно и то же место в вашей
            паре. Тянет туда, где он закрывает недостающую половину тебя. И ранит — ровно
            там же.
          </p>
        </div>
        <p className={styles.note}>
          Разбор показывает это место по имени — и что с ним делать. Не «расстаньтесь» и не
          «терпите»: механику, с которой можно обращаться.
        </p>
      </section>

      <hr className={styles.divider} />

      {/* ============ ЭКСПЕРТ: что это ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Что это</div>
        <h2 className={styles.h2}>Не тест и не гороскоп: расчёт по двум датам рождения</h2>
        <p className={styles.lede}>
          Никаких вопросов и самооценок — только астрономия и таблицы Дизайна человека.
          В расчёт идут два момента рождения; всё считается прямо в твоём браузере, даты
          никуда не отправляются.
        </p>
        <p className={styles.lede}>
          Поэтому текст невозможно переиспользовать для другой пары: убери из него номера
          ваших ворот — он развалится. Это противоположность гороскопам, которые подходят
          всем. И вместо «процента совместимости» разбор даёт вашей паре имя — по главному
          каналу, который вас связывает.
        </p>
      </section>

      {/* ============ ЭКСПЕРТ: состав ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Что внутри</div>
        <h2 className={styles.h2}>Восемь разделов о вас двоих</h2>
        <div className={styles.blocks}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>Главное за минуту</div>
            <div className={styles.blockText}>
              Имя вашей пары, что вас держит, что изматывает и что не изменится — ответ сразу,
              до подробностей.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              Почему тянет именно к нему
            </div>
            <div className={styles.blockText}>
              Каналы, которые замыкаются только между вами, поимённо: чего не хватало тебе,
              чего ему, и что появляется, когда вы рядом. Здесь же честно про обратную
              сторону каждого такого места.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>Где вы меняете друг друга</div>
            <div className={styles.blockText}>
              В чём именно рядом с ним ты перестаёшь быть собой — и что ты делаешь с ним,
              сама того не замечая. По каждому месту: что не изменится никогда, а что
              лечится одним действием.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              Что в нём не изменится, а что изменится
              <span className={styles.blockTag}>главный вопрос</span>
            </div>
            <div className={styles.blockText}>
              Каждая общая тема в трёх формах: как выглядит в страхе, как в силе и куда
              способна дорасти. Надежда «он перестанет быть таким» — ложная. Надежда «это же
              самое перестанет меня ранить» — обоснованная. Разбор показывает разницу.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              Как с этим обращаться
            </div>
            <div className={styles.blockText}>
              Бытовые ключи к самым сильным чертам: как просить, говорить и реагировать,
              зная эту черту, — чтобы она работала на вас. С историями пар, в которых
              узнаёшь себя.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              Чего в вашей паре нет
              <span className={styles.blockTag}>такого не делает никто</span>
            </div>
            <div className={styles.blockText}>
              Темы, которых между вами нет и не будет — их неоткуда взять. Все рассказывают,
              что у вас есть; никто не говорит, на что не надо тратить годы.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>Полная карта: 26 точек каждого</div>
            <div className={styles.blockText}>
              Справочник вашей пары: все активации обоих с именами позиций и пометками, что
              идёт само, а что даётся усилием.
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>Что с этим делать</div>
            <div className={styles.blockText}>
              Не вердикт, а инструменты: что тебе действительно нужно, что даётся вам легко,
              чего избегать — и восемь вопросов к себе, к которым возвращаются.
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ============ ФРАГМЕНТЫ: настоящие куски продукта ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Не обещания — фрагменты</div>
        <h2 className={styles.h2}>Так выглядит текст разбора</h2>
        <p className={styles.note}>
          Это настоящие куски из разбора — те же, что получишь ты, только про свою пару и по
          своим датам.
        </p>

        <div className={styles.fragment}>
          <div className={styles.fragmentLabel}>Из раздела «Где вы меняете друг друга» — если у тебя открыт центр мышления</div>
          <div className={styles.fragmentText}>
            <p>{g(ajna.you.scene)}</p>
            <p>{g(ajna.you.light)}</p>
            <p><span className={styles.fixedTag}>Не изменится:</span> {g(ajna.you.fixed)}</p>
            <p><span className={styles.fixedTag}>Изменится:</span> {g(ajna.you.changeable)}</p>
          </div>
        </div>

        <div className={styles.fragment}>
          <div className={styles.fragmentLabel}>
            Из раздела «Что не изменится» — если у вас общая тема 54, «{greedKey.shadow}» в страхе
          </div>
          <div className={styles.fragmentText}>
            <p>
              <span className={styles.fixedTag}>В страхе «{greedKey.shadow}»</span> — {g(greed.shadow)}
            </p>
            <p>
              <span className={styles.fixedTag}>В силе «{greedKey.gift}»</span> — {g(greed.gift)}
            </p>
            <p>
              <span className={styles.fixedTag}>Как с этим обращаться</span> — {g(greed.key!)}
            </p>
          </div>
        </div>

        <div className={styles.fragment}>
          <div className={styles.fragmentLabel}>Из раздела «Где вы меняете друг друга» — если центр направления открыт у него</div>
          <div className={styles.fragmentText}>
            <p>{g(gGate.partner.scene)}</p>
            <p><span className={styles.fixedTag}>Не изменится:</span> {g(gGate.partner.fixed)}</p>
          </div>
        </div>

        <div className={styles.fragment}>
          <div className={styles.fragmentLabel}>А так выглядит карта пары — обе карты на одной схеме</div>
          <div className={styles.mapWrap}>
            <Bodygraph
              composite={{ channels: exampleComposite.channels, definedCenters: exampleComposite.definedCenters }}
              a={toPersonChart(exampleA)}
              b={toPersonChart(exampleB)}
              nameA="Она"
              nameB="Он"
              size={280}
            />
          </div>
          <p className={styles.note}>
            Это пример по чужим датам — твоя считается по вашим двум. Розовые линии — её,
            сиреневые — его. А линии из двух цветов сразу — каналы, которые замыкаются
            только вдвоём: её половина плюс его. То самое «почему тянет». Попробуй прямо
            здесь — тронь любую линию, и карта расскажет, чья она и что значит.
          </p>
        </div>

        <div className={styles.midCta}>
          <a className={styles.cta} href="#kupit">Рассчитать нашу пару</a>
          <div className={styles.ctaNote}>Считается по вашим двум датам · готов сразу после оплаты</div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ============ ЧЕСТНОСТЬ ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Честно</div>
        <h2 className={styles.h2}>Чего разбор не сделает</h2>
        <div className={styles.honest}>
          <p>
            Он не скажет, быть вам вместе или нет, — этого не скажет никакой расчёт и никакой
            специалист. Он не пообещает «вернуть его» и не переделает человека: набор тем в
            карте фиксирован с рождения, и мы говорим об этом прямо.
          </p>
          <p>
            Что он делает: показывает механику — почему у вас происходит именно так — и даёт
            выполнимые ходы. Меняется не человек. Меняется то, во что вам обходятся его и
            твои черты.
          </p>
        </div>
      </section>

      {/* ============ КАК ПОЛУЧИТЬ ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Как это работает</div>
        <h2 className={styles.h2}>Три шага — и разбор у тебя</h2>
        <ol className={styles.steps}>
          <li>
            Вводишь даты, время и место рождения обоих. Точное время важно: карта считается
            по моменту, а не по дню.
          </li>
          <li>Оплачиваешь 750 ₽ — картой или СБП, с чеком.</li>
          <li>
            Разбор открывается сразу и остаётся у тебя навсегда: ссылка не сгорает, вернуться
            можно когда угодно. Захочешь — перешли её партнёру или подруге: посторонним она
            бесполезна, в ней ваши даты.
          </li>
        </ol>
        <p className={styles.note}>
          Приватность: расчёт происходит в твоём браузере, даты рождения не отправляются на
          сервер и нигде не хранятся.
        </p>
      </section>

      {/* ============ ЦЕНА ============ */}
      <section className={styles.section} id="kupit">
        <div className={styles.eyebrow}>Цена</div>
        <h2 className={styles.h2}>Один разбор — одна цена</h2>
        <div className={styles.priceCard}>
          <div className={styles.priceValue}>750 ₽</div>
          <div className={styles.priceOld}>
            Готовые парные PDF-разборы по Дизайну человека продаются от 2 190 ₽; час у живого
            консультанта — втрое дороже.
          </div>
          <ul className={styles.priceList}>
            <li>Восемь разделов по вашим двум датам — объём хорошей книжной главы</li>
            <li>Полная карта пары: 52 точки, все каналы, общие темы</li>
            <li>Ссылка навсегда, можно перечитывать и пересылать</li>
            <li>Готов сразу после оплаты, без ожидания</li>
            <li>Что покупаешь — видно до оплаты: фрагменты выше взяты из разбора как есть</li>
          </ul>
          <a className={styles.cta} href={PAYMENT_URL}>Получить разбор пары</a>
          <div className={styles.ctaNote}>Оплата картой или СБП · чек придёт на почту</div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className={styles.section}>
        <div className={styles.eyebrow}>Вопросы</div>
        <h2 className={styles.h2}>Что спрашивают перед покупкой</h2>

        <details className={styles.faqBox}>
          <summary>Это считается только по датам — откуда точность?</summary>
          <div className={styles.faqInner}>
            Расчёт астрономический: положения планет на два момента рождения, переведённые в
            карту по таблицам Дизайна человека. Мы открыто показываем, как считаем, — на сайте
            есть страница <Link href="/o-servise/">«Как мы считаем»</Link> с проверкой по
            независимым источникам. А точность
            текста проверяется просто: сцены из разбора либо происходят у вас, либо нет.
          </div>
        </details>

        <details className={styles.faqBox}>
          <summary>Чем это отличается от бесплатного расчёта?</summary>
          <div className={styles.faqInner}>
            Бесплатный отвечает на вопрос «что мы создаём вдвоём»: композит, каналы, типы,
            профили. Профессиональный — о другом: почему тянет именно к нему, где вы меняете
            друг друга, что не изменится никогда и как с этим обращаться, чего в паре нет.
            Эти слои в бесплатном не показываются — не из жадности: они требуют другой
            глубины текста.
          </div>
        </details>

        <details className={styles.faqBox}>
          <summary>У нас всё хорошо. Он нам нужен?</summary>
          <div className={styles.faqInner}>
            Тогда разбор прочитается не как спасение, а как карта: почему у вас легко там, где
            у других тяжело, и на какие места стоит опираться в трудные периоды. Пары, у
            которых всё хорошо, обычно узнают себя громче всех.
          </div>
        </details>

        <details className={styles.faqBox}>
          <summary>А если он прочитает?</summary>
          <div className={styles.faqInner}>
            Разбор написан так, чтобы его мог читать тот, о ком он написан: ни одно качество в
            нём не осуждается — называются свойства и их формы, и у каждой тяжёлой вещи есть
            выход. Многие пересылают ссылку партнёру сознательно: это повод для разговора,
            который сам не начинался.
          </div>
        </details>

        <details className={styles.faqBox}>
          <summary>Что, если мне не подойдёт?</summary>
          <div className={styles.faqInner}>
            Ты уже видела товар: фрагменты выше — настоящие куски разбора, взятые из него как
            есть. Весь разбор написан этим же языком и с этой же прямотой, только про вас
            двоих и по вашим датам. Если фрагменты не отозвались — не покупай. Если
            отозвались — внутри восемь таких разделов.
          </div>
        </details>

        <details className={styles.faqBox}>
          <summary>Время рождения знаю примерно. Считать можно?</summary>
          <div className={styles.faqInner}>
            Можно, но честно скажем: часть карты зависит от времени сильно. Если время
            приблизительное, лучше сначала уточнить его — в свидетельстве о рождении или в
            роддоме. Разбор по неточному времени может описать красивую, но чужую пару.
          </div>
        </details>
      </section>

      {/* ============ ФИНАЛ: пик ============ */}
      <div className={styles.finale}>
        <p className={styles.finaleText}>
          Ты можешь ещё год гадать, почему тебя к нему тянет и почему рядом с ним больно.
          А можешь за вечер увидеть это место в вашей карте — по имени.
        </p>
        <a className={styles.cta} href="#kupit">Рассчитать нашу пару</a>
        <div className={styles.ctaNote}>Готов сразу · ссылка навсегда · по вашим датам</div>
      </div>

      <hr className={styles.divider} />
      <SellerLine />
    </div>
  );
}
