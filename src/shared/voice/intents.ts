export type ResearchIntent =
  | 'impulse'
  | 'storm'
  | 'depletion'
  | 'pause'
  | 'start'
  | 'step'
  | 'analytics'
  | 'laboratory'
  | 'population'
  | 'entropy'
  | 'power'
  | 'efficiency'
  | 'colony';

export type FieldSetting = 'resource' | 'noise';

export type VoiceCommandResult =
  | { type: 'intent'; intent: ResearchIntent }
  | {
      type: 'setting';
      setting: FieldSetting;
      mode: 'relative' | 'absolute';
      value: number;
    }
  | {
      type: 'mutation';
      value: boolean;
    }
  | {
      type: 'speed';
      value: 1 | 2 | 5;
    };

/**
 * Расстояние Дамерау-Левенштейна (учитывает вставки, удаления, замены и перестановки соседних букв).
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const d: number[][] = [];
  for (let i = 0; i <= al; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // удаление
        d[i][j - 1] + 1, // вставка
        d[i - 1][j - 1] + cost, // замена
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // перестановка (transposition)
      }
    }
  }
  return d[al][bl];
}

/**
 * Нормализация для нечеткого поиска:
 * - нижний регистр
 * - замена ё на е
 * - удаление мягких (ь) и твердых (ъ) знаков, так как при распознавании речи они часто теряются
 * - очистка знаков препинания
 */
export function normalizeFuzzy(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[ьъ]/g, '')
    .replace(/[^а-яa-z0-9\s+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Словарь чисел на русском языке для распознавания числительных от речи.
 */
const RUSSIAN_NUMBER_WORDS: Record<string, number> = {
  ноль: 0,
  один: 1,
  одна: 1,
  два: 2,
  две: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
  десять: 10,
  одиннадцать: 11,
  двенадцать: 12,
  тринадцать: 13,
  четырнадцать: 14,
  пятнадцать: 15,
  шестнадцать: 16,
  семнадцать: 17,
  восемнадцать: 18,
  девятнадцать: 19,
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
  шестьдесят: 60,
  семьдесят: 70,
  восемьдесят: 80,
  девяносто: 90,
  сто: 100,
};

/**
 * Извлекает число из строки (как цифры, так и слова).
 */
function extractNumber(text: string): number | null {
  // Прямое число в цифрах
  const digitMatch = text.match(/([+-]?\d+(?:\.\d+)?)/);
  if (digitMatch) {
    return Number.parseFloat(digitMatch[1]);
  }

  // Поиск по словам
  const words = text.split(/\s+/);
  let total = 0;
  let found = false;

  for (const word of words) {
    const cleanWord = word.replace(/[ьъ]/g, '');
    for (const [numWord, val] of Object.entries(RUSSIAN_NUMBER_WORDS)) {
      const cleanNumWord = numWord.replace(/[ьъ]/g, '');
      if (cleanWord === cleanNumWord) {
        total += val;
        found = true;
        break;
      }
    }
  }

  return found ? total : null;
}

/**
 * Проверяет, подходит ли слово под ключевое слово с допустимым расстоянием Дамерау-Левенштейна.
 */
function matchesFuzzyWord(word: string, target: string, maxDist = 2): boolean {
  const normWord = normalizeFuzzy(word);
  const normTarget = normalizeFuzzy(target);
  if (normWord === normTarget) return true;
  if (
    normWord.startsWith(normTarget) &&
    normWord.length <= normTarget.length + 2
  )
    return true;
  if (Math.abs(normWord.length - normTarget.length) > maxDist) return false;
  return damerauLevenshtein(normWord, normTarget) <= maxDist;
}

/**
 * Проверяет наличие ключевого слова в наборе слов фразы.
 */
function containsFuzzyKeyword(
  words: string[],
  targets: string[],
  maxDist = 2,
): boolean {
  for (const word of words) {
    for (const target of targets) {
      if (matchesFuzzyWord(word, target, maxDist)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Парсер команд изменения настроек и полей:
 * - Приток ресурса (resource)
 * - Шум среды (noise)
 * - Мутации (mutation)
 * - Скорость (speed)
 */
function parseFieldCommand(rawText: string): VoiceCommandResult | null {
  const normalized = rawText.toLowerCase().replace(/ё/g, 'е').trim();

  // 1. Мутации при делении: включить / выключить
  const mutationKeywords = [
    'мутаци',
    'мутации',
    'мутацию',
    'мутация',
    'мутаций',
  ];
  const hasMutation = mutationKeywords.some((k) => normalized.includes(k));
  if (hasMutation) {
    if (/(?:выключ\S*|отключ\S*|деактивир\S*|убер\S*|выкл)/.test(normalized))
      return { type: 'mutation', value: false };
    if (/(?:включ\S*|активир\S*|вруб\S*|подключ\S*|вкл)/.test(normalized))
      return { type: 'mutation', value: true };
  }

  // 2. Скорость симуляции
  if (
    /(?:скорост\S*|темп|быстрее|замедл\S*|ускор\S*|медленнее)/.test(normalized)
  ) {
    if (/(?:^|\s)(?:5|пять|максимум|максимальн\S*)(?:\s|$)/.test(normalized)) {
      return { type: 'speed', value: 5 };
    }
    if (/(?:^|\s)(?:2|два|две|двойк\S*)(?:\s|$)/.test(normalized)) {
      return { type: 'speed', value: 2 };
    }
    if (
      /(?:^|\s)(?:1|один|одна|нормальн\S*|единиц\S*)(?:\s|$)/.test(normalized)
    ) {
      return { type: 'speed', value: 1 };
    }
    if (/(?:быстрее|ускор\S*|увелич\S*)/.test(normalized)) {
      return { type: 'speed', value: 2 };
    }
    if (/(?:медленнее|замедл\S*|уменьш\S*)/.test(normalized)) {
      return { type: 'speed', value: 1 };
    }
  }

  // 3. Приток ресурса (resource) или Шум среды (noise)
  const isResource = /(?:приток|ресурс\S*|поток)/.test(normalized);
  const isNoise = /(?:шум\S*|помех\S*)/.test(normalized);

  if (isResource || isNoise) {
    const setting: FieldSetting = isResource ? 'resource' : 'noise';

    // Определяем знак/направление изменения
    const isIncrease =
      /(?:увелич\S*|прибав\S*|подним\S*|повыс\S*|добав\S*|\bплюс\b|\+)/.test(
        normalized,
      );
    const isDecrease =
      /(?:уменьш\S*|сниз\S*|убав\S*|пониз\S*|отним\S*|\bминус\b|-)/.test(
        normalized,
      );

    const num = extractNumber(normalized);

    if (num !== null) {
      if (isIncrease) {
        return {
          type: 'setting',
          setting,
          mode: 'relative',
          value: Math.abs(num),
        };
      }
      if (isDecrease) {
        return {
          type: 'setting',
          setting,
          mode: 'relative',
          value: -Math.abs(num),
        };
      }
      // Если указан явный знак в строке (+10 или -10)
      if (/\+/.test(normalized)) {
        return {
          type: 'setting',
          setting,
          mode: 'relative',
          value: Math.abs(num),
        };
      }
      if (/-/.test(normalized)) {
        return {
          type: 'setting',
          setting,
          mode: 'relative',
          value: -Math.abs(num),
        };
      }

      // Если сказано: "поменяй приток на 70%" или "приток 50" -> абсолютное значение
      if (
        /(?:поменяй|измени|установи|поставь|сделай|на)/.test(normalized) ||
        (!isIncrease && !isDecrease)
      ) {
        return {
          type: 'setting',
          setting,
          mode: 'absolute',
          value: Math.abs(num),
        };
      }
    }
  }

  return null;
}

/**
 * Конфигурация для нечеткого распознавания намерений (интентов).
 * Включает распространенные опечатки и фонетические вариации речи.
 */
const INTENT_PREDICTORS: {
  intent: ResearchIntent;
  keywords: string[];
  maxDist?: number;
  regex?: RegExp;
}[] = [
  {
    intent: 'impulse',
    // Опечатки и формы: импульс, импулс, имплус, инпульс, импус, импуль, pulse
    keywords: [
      'импульс',
      'импулс',
      'имплус',
      'инпульс',
      'импус',
      'импуль',
      'импульса',
      'импульсом',
      'импульсы',
      'импульсик',
      'pulse',
    ],
    maxDist: 2,
    regex: /(?:^|\s)(?:имп[ул]{2,3}с\S*|инпульс\S*|pulse)(?:\s|$)/i,
  },
  {
    intent: 'storm',
    keywords: ['буря', 'бурю', 'шторм', 'возмущение', 'возмущенье'],
    maxDist: 2,
    regex: /(?:^|\s)(?:бурю|буря|возмущен\S*|шторм\S*)(?:\s|$)/i,
  },
  {
    intent: 'depletion',
    keywords: ['истощение', 'истощенье', 'дефицит'],
    maxDist: 2,
    regex: /(?:^|\s)(?:истощен\S*|дефицит\S*|отключи ресурс)(?:\s|$)/i,
  },
  {
    intent: 'pause',
    keywords: ['пауза', 'паузу', 'останови', 'стоп', 'замри'],
    maxDist: 1,
    regex: /(?:^|\s)(?:пауз\S*|останови\S*|стоп|замри)(?:\s|$)/i,
  },
  {
    intent: 'start',
    keywords: ['старт', 'запусти', 'продолжи', 'поехали', 'пуск', 'возобнови'],
    maxDist: 1,
    regex:
      /(?:^|\s)(?:запусти\S*|продолжи\S*|старт|пуск|поехали|возобнови\S*)(?:\s|$)/i,
  },
  {
    intent: 'step',
    keywords: ['шаг', 'такт', 'шагни'],
    maxDist: 1,
    regex: /(?:^|\s)(?:один шаг|один такт|следующий такт|шаг|такт)(?:\s|$)/i,
  },
  {
    intent: 'analytics',
    keywords: ['аналитика', 'аналитику', 'графики'],
    maxDist: 2,
    regex: /(?:^|\s)(?:аналитик\S*|график\S*)(?:\s|$)/i,
  },
  {
    intent: 'laboratory',
    keywords: ['лаборатория', 'лабораторию', 'планета'],
    maxDist: 2,
    regex: /(?:^|\s)(?:лаборатори\S*|на планету|планет\S*)(?:\s|$)/i,
  },
  {
    intent: 'population',
    keywords: ['популяция', 'популяцию', 'численность'],
    maxDist: 2,
    regex: /(?:^|\s)(?:популяци\S*|численност\S*)(?:\s|$)/i,
  },
  {
    intent: 'entropy',
    keywords: ['энтропия', 'энтропию'],
    maxDist: 2,
    regex: /(?:^|\s)энтропи\S*(?:\s|$)/i,
  },
  {
    intent: 'power',
    keywords: ['мощность'],
    maxDist: 2,
    regex: /(?:^|\s)мощност\S*(?:\s|$)/i,
  },
  {
    intent: 'efficiency',
    keywords: ['эффективность', 'кпд'],
    maxDist: 2,
    regex: /(?:^|\s)(?:эффективност\S*|кпд)(?:\s|$)/i,
  },
  {
    intent: 'colony',
    keywords: ['колония', 'колонию', 'зародыш'],
    maxDist: 2,
    regex:
      /(?:^|\s)(?:создай колонию|добавь колонию|новая колония|зародыш)(?:\s|$)/i,
  },
];

/**
 * Основная функция разбора голосовой команды:
 * Сначала проверяет команды управления полями/параметрами среды,
 * затем нечетко ищет намерения симуляции с предсказанием искаженных слов.
 */
export function parseResearchVoiceCommand(
  text: string,
): VoiceCommandResult | null {
  const normalized = text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^а-яa-z0-9\s+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Отрицание отменяет команду
  if (/(?:^|\s)(?:не|нет|отмени|нельзя)(?:\s|$)/.test(normalized)) return null;

  if (/(?:^|\s)(?:и|затем|потом|одновременно)(?:\s|$)/.test(normalized))
    return null;

  // 1. Проверяем команды изменения полей и настроек
  const fieldCmd = parseFieldCommand(text);

  // 2. Проверяем интенты (регулярки + нечеткое сопоставление)
  const words = normalized
    .split(/\s+/)
    .filter(
      (w) =>
        w &&
        ![
          'бро',
          'брат',
          'пожалуйста',
          'сделай',
          'мне',
          'давай',
          'ну',
          'ка',
          'покажи',
          'установи',
          'поставь',
          'измени',
          'поменяй',
        ].includes(w),
    );
  const matchedIntents: ResearchIntent[] = [];

  for (const predictor of INTENT_PREDICTORS) {
    let matched = false;

    // Сначала быстрая проверка регулярным выражением
    if (predictor.regex?.test(normalized)) {
      matched = true;
    } else if (
      containsFuzzyKeyword(words, predictor.keywords, predictor.maxDist ?? 2)
    ) {
      matched = true;
    }

    if (matched) {
      matchedIntents.push(predictor.intent);
    }
  }

  // Разрешение неоднозначностей: если указана метрика, приоритет над 'analytics'
  let filtered = matchedIntents;
  if (
    filtered.some((i) =>
      ['population', 'entropy', 'power', 'efficiency'].includes(i),
    )
  ) {
    filtered = filtered.filter((i) => i !== 'analytics');
  }

  if (fieldCmd) {
    const fieldCount = [
      /(?:приток|ресурс|поток)/,
      /(?:шум|помех)/,
      /мутаци/,
      /(?:скорост|темп)/,
    ].filter((r) => r.test(normalized)).length;
    if (
      fieldCount > 1 ||
      filtered.some((i) => !['power', 'analytics'].includes(i))
    )
      return null;
    return fieldCmd;
  }
  if (filtered.length === 1) {
    return { type: 'intent', intent: filtered[0] };
  }

  return null;
}

/**
 * Совместимость со старым API parseResearchIntent:
 * Возвращает ResearchIntent или null.
 */
export function parseResearchIntent(text: string): ResearchIntent | null {
  const res = parseResearchVoiceCommand(text);
  if (res && res.type === 'intent') {
    return res.intent;
  }
  return null;
}
