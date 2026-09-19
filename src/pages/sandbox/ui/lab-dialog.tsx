import type { RefObject } from 'react';

import { ArrowUpRight, X } from 'lucide-react';

import type { GlobeBodyId } from '@/shared/ui/globe';
import { cn } from '@/shared/lib/utils';

import {
  MODEL_VERSION,
  type Simulation,
  WORLDS,
} from '@/features/ecosystem/model';

import { BODY_IDS, type LabModal } from '../lib';

type LabDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  modal: LabModal;
  sim: Simulation;
  seed: string;
  onSeedChange: (value: string) => void;
  onClose: () => void;
  onSelectWorld: (id: GlobeBodyId) => void;
  onDownload: () => void;
  onReset: () => void;
  onReplay: () => void;
};

const worldThumb: Record<GlobeBodyId, string> = {
  earth: "bg-[url('/images/globe/earth_color.jpg')] bg-[position:35%_50%]",
  mars: "bg-[url('/images/globe/mars_color.jpg')]",
  venus: "bg-[url('/images/globe/venus_color.jpg')]",
};

export const LabDialog = ({
  dialogRef,
  modal,
  sim,
  seed,
  onSeedChange,
  onClose,
  onSelectWorld,
  onDownload,
  onReset,
  onReplay,
}: LabDialogProps) => (
  <dialog
    ref={dialogRef}
    onCancel={onClose}
    onClose={onClose}
    className="bg-[#111b23] text-[#dae6e9] border border-[#3c514f] rounded-[13px] w-[min(620px,90vw)] max-h-[85vh] p-[35px] fixed inset-0 m-auto shadow-[0_25px_100px_#0009] [&::backdrop]:bg-[#02070cd9] [&::backdrop]:backdrop-blur-[8px] max-[700px]:py-[30px] max-[700px]:px-5"
  >
    <button
      type="button"
      className={cn(
        'size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]',
        'absolute right-3.5 top-3.5',
      )}
      aria-label="Закрыть"
      onClick={onClose}
    >
      <X size={19} />
    </button>
    {modal === 'guide' && (
      <>
        <div className="[font:9px_monospace] tracking-[1.45px] text-[#82929f]">
          ИНСТРУМЕНТ ИССЛЕДОВАТЕЛЯ
        </div>
        <h2 className="text-[28px] font-normal tracking-[-0.8px] leading-[1.3] my-[18px] max-[700px]:text-2xl">
          Не управляйте жизнью.
          <br />
          Создавайте условия.
        </h2>
        <p className="text-xs text-[#95a9b4] leading-[1.9]">
          Вы — исследователь, а не участник голосования. Внесите первичные
          структуры, измените доступный ресурс или вызовите возмущение. Затем
          наблюдайте, какие решения помогают сообществам сохраняться.
        </p>
        <ol className="pl-[18px] text-[#8fa6af] leading-[1.8] text-xs grid gap-[13px] my-5">
          <li>
            <b className="text-[#c0d7cc] font-medium">Выберите среду.</b> Реальные
            планеты имеют разные условия; коэффициенты жизни являются допущениями
            модели.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Запустите эксперимент.</b>{' '}
            Светящиеся кристаллы — не люди, а небиологические особи. Их цвет
            обозначает колонию.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Измените условия.</b> Импульс
            усиливает приток, возмущение повышает затраты, истощение временно
            отключает ресурс.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Проверьте гипотезу.</b> Изучите
            причины решений, рождения, смерти и отделение дочерних колоний.
            Экспортируйте результаты.
          </li>
        </ol>
        <div className="bg-[#1c2b2c] border border-[#324a45] p-3.5 rounded-md text-[10px] text-[#849f95] leading-[1.9] mt-5">
          Модель {MODEL_VERSION}. В браузере работает отдельный демонстрационный
          движок; подключение к серверной научной модели ещё не выполнено. EU —
          условная энергия. Энтропия — информационная, не термодинамическая.
          Задержка — время доставки сигнала, а не доказанная задержка реакции.
        </div>
      </>
    )}
    {modal === 'atlas' && (
      <>
        <div className="[font:9px_monospace] tracking-[1.45px] text-[#82929f]">
          ТРИ СРЕДЫ · ТРИ ЭКСПЕРИМЕНТА
        </div>
        <h2 className="text-[28px] font-normal tracking-[-0.8px] leading-[1.3] my-[18px] max-[700px]:text-2xl">
          Атлас миров
        </h2>
        {BODY_IDS.map((id) => (
          <button
            type="button"
            className="flex w-full items-center gap-[17px] bg-[#16222a] border border-[#2e4149] rounded-[7px] p-[18px] mt-3 text-left [&_svg]:shrink-0 [&_svg]:text-[#a7c7b7] max-[700px]:p-3 max-[700px]:gap-2.5"
            key={id}
            onClick={() => {
              onSelectWorld(id);
              onClose();
            }}
          >
            <span
              className={cn(
                'size-8 shrink-0 block rounded-full bg-cover shadow-[inset_-10px_-3px_10px_#000c,0_0_13px_#94cfce15] max-[700px]:size-[25px]',
                'size-[45px]',
                worldThumb[id],
              )}
            />
            <div>
              <h3 className="text-[15px] font-[450] m-0 mb-1.5 text-[#d4e0da]">
                {WORLDS[id].name}{' '}
                <small className="[font:9px_monospace] text-[#6b9291] ml-[9px] max-[700px]:block max-[700px]:ml-0 max-[700px]:my-1.5">
                  {WORLDS[id].temperature} °C / {WORLDS[id].gravity} м/с²
                </small>
              </h3>
              <p className="text-[10px] text-[#95a9b4] leading-[1.9]">
                {WORLDS[id].description}
              </p>
            </div>
            <ArrowUpRight size={18} />
          </button>
        ))}
        <p className="bg-[#1c2b2c] border border-[#324a45] p-3.5 rounded-md text-[10px] text-[#849f95] leading-[1.9] mt-5 [&_a]:text-[#bbdacb] [&_a]:underline">
          Состояния миров сохраняются при переключении. Время идёт только в
          открытом мире. Средние справочные значения взяты из{' '}
          <a
            href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
            target="_blank"
            rel="noreferrer"
          >
            NASA Planetary Fact Sheet
          </a>
          . Они не описывают все локальные условия поверхности.
        </p>
      </>
    )}
    {modal === 'reset' && (
      <>
        <div className="[font:9px_monospace] tracking-[1.45px] text-[#82929f]">
          НОВЫЙ ЗАПУСК
        </div>
        <h2 className="text-[28px] font-normal tracking-[-0.8px] leading-[1.3] my-[18px] max-[700px]:text-2xl">
          Начать эксперимент заново?
        </h2>
        <p className="text-xs text-[#95a9b4] leading-[1.9]">
          Состояние текущего мира будет заменено тремя первичными колониями.
          Другие миры сохранятся. При необходимости сначала скачайте JSON.
        </p>
        <label className="flex items-center gap-[15px] my-5 [font:12px_monospace]">
          Seed
          <input
            type="number"
            min="1"
            max="999999"
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            className="bg-[#1b2a32] border border-[#456156] rounded-[5px] p-2.5 w-[150px] text-[#d0e4d8]"
          />
        </label>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-[9px] border border-[#33414d] bg-[#151d25] text-[#bfcdd6] text-[11px] py-[11px] px-[15px] rounded-md hover:bg-[#1f2b36]"
            onClick={onDownload}
          >
            Скачать текущий
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-[9px] border border-[#b6dbc7] bg-[#b6dbc7] text-[#14231b] text-[11px] font-[650] py-[11px] px-[15px] rounded-md hover:bg-[#d1eadb]"
            onClick={onReset}
          >
            Начать заново
          </button>
        </div>
      </>
    )}
    {modal === 'replay' && (
      <>
        <div className="[font:9px_monospace] tracking-[1.45px] text-[#82929f]">
          ВОСПРОИЗВОДИМОСТЬ
        </div>
        <h2 className="text-[28px] font-normal tracking-[-0.8px] leading-[1.3] my-[18px] max-[700px]:text-2xl">
          Повторить тот же эксперимент
        </h2>
        <p className="text-xs text-[#95a9b4] leading-[1.9]">
          Будут воспроизведены seed {sim.seed}, {sim.tick} тактов и{' '}
          {sim.interventions.length} вмешательств. Сравниваются состояния особей
          и колоний, очереди сигналов, метрики и генератор случайных чисел.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-[9px] border border-[#b6dbc7] bg-[#b6dbc7] text-[#14231b] text-[11px] font-[650] py-[11px] px-[15px] rounded-md hover:bg-[#d1eadb]"
          onClick={onReplay}
        >
          Воспроизвести и сравнить
        </button>
      </>
    )}
  </dialog>
);
