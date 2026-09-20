import type { DriveStep } from 'driver.js';

import { TOUR_ANCHORS, tourAnchorSelector } from '@/shared/constants';

/** Editor is ready when the planet viewport chrome is mounted and visible. */
export const LAB_TOUR_EDITOR_READY_SELECTOR = tourAnchorSelector(
  TOUR_ANCHORS.VIEWPORT,
);

export const LAB_TOUR_STEPS: DriveStep[] = [
  {
    element: tourAnchorSelector(TOUR_ANCHORS.ROLE),
    popover: {
      title: 'Не управляйте жизнью.<br />Создавайте условия.',
      description:
        'Вы — исследователь, а не участник голосования. Внесите первичные структуры, измените доступный ресурс или вызовите возмущение. Затем наблюдайте, какие решения помогают сообществам сохраняться.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.NAV),
    popover: {
      title: 'Разделы лаборатории',
      description:
        'Лаборатория — основной редактор эксперимента. Аналитика показывает динамику, атлас — сравнение миров.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.HABITAT),
    popover: {
      title: 'Среда обитания',
      description:
        'Выберите планету. Реальные тела имеют разные температуру, гравитацию и давление; коэффициенты жизни — допущения модели.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.SETTINGS),
    popover: {
      title: 'Условия эксперимента',
      description:
        'Задайте приток ресурса, шум среды и мутации при делении. Эти параметры определяют, насколько легко сообществам выживать и ветвиться.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.VIEWPORT),
    popover: {
      title: 'Поверхностный слой',
      description:
        'Светящиеся кристаллы — небиологические особи. Цвет обозначает колонию. Здесь вы наблюдаете жизнь в реальном времени.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.TIME_CONTROLS),
    popover: {
      title: 'Управление временем',
      description:
        'Запуск, пауза, один такт и сброс эксперимента. Скорость меняет темп модельного времени.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.INTERVENTIONS),
    popover: {
      title: 'Воздействия',
      description:
        'Импульс усиливает приток, возмущение повышает затраты, истощение временно отключает ресурс. Каждое воздействие длится 60 модельных тактов.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.METRICS),
    popover: {
      title: 'Метрики эксперимента',
      description:
        'Мощность, ответ на воздействие, использование ресурса и энтропия решений — краткая сводка текущего запуска.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.COLONIES),
    popover: {
      title: 'Живые сообщества',
      description:
        'Список колоний на планете. Выберите сообщество, чтобы изучить его состав и историю.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.ADD_COLONY),
    popover: {
      title: 'Внести зародыши',
      description:
        'Добавьте новую первичную структуру в эксперимент — в пределах лимита особей и колоний для этой планеты.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.INSPECTOR),
    popover: {
      title: 'Инспектор колонии',
      description:
        'Поколение, запас энергии и причина текущего действия особи. Здесь проверяют гипотезу о том, какие решения помогают сохраняться.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: tourAnchorSelector(TOUR_ANCHORS.EXPORT),
    popover: {
      title: 'Сохраните исследование',
      description:
        'Экспортируйте результаты. Условия, действия и seed сохраняются в записи. Планета — реальная. Формы жизни — гипотетические.',
      side: 'right',
      align: 'end',
    },
  },
];
