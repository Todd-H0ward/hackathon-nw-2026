# XenoChoice — интерфейс лаборатории

Фронтенд исследовательской лаборатории: гипотетическая жизнь на реальных планетах. React 19, TypeScript, Vite, Three.js / React Three Fiber, Zustand, TanStack Query, Axios, Tailwind. Состояние считает Go-движок через REST и WebSocket.

## Локальный запуск

```sh
pnpm install
cp .env-example .env
XENOCHOICE_ORIGIN=http://127.0.0.1:8081 pnpm dev
```

В соседнем `backend` запустите `go run ./cmd/lab`. `VITE_XENOCHOICE_API_URL=/api/v2` направляет запросы через Vite proxy; `XENOCHOICE_ORIGIN` задаётся в окружении команды. Без него proxy использует порт 8080 полного сервера. Абсолютный API URL требует подходящих CORS и схемы HTTPS.

## Пользовательский сценарий

1. Выбрать планету на главной (карусель) и войти в лабораторию — планета переносится в viewport бесшовным ferry.
2. При первом заходе в редактор запускается spotlight-обучение (можно повторить кнопкой в rail).
3. Эксперимент создаётся на сервере и запускается; пауза, приток/шум, импульс / возмущение / истощение.
4. Создать колонию: положение, особи, энергия, структура, стратегия и связи.
5. Наблюдать особей, решения, метрики и журнал; сравнить режимы в аналитике; смотреть миры в атласе.
6. Экспорт JSON/CSV, импорт записи, воспроизведение. FAQ (`/faq`) — база знаний о модели.
7. Выход домой — обратный ferry из viewport обратно в карусель.

При воздействии на паузе UI делает такт, чтобы применить команду. Просмотр записи не меняет исходный опыт.

## Устройство

- `pages/home` — выбор мира, 3D-карусель, вход.
- `pages/sandbox` — лаборатория, конструктор, просмотр записи; layout для sibling-страниц.
- `pages/demo` — рассказ о машине выбора.
- `pages/analytics` — метрики текущего прогона.
- `pages/atlas` — обзор миров и экспериментов.
- `pages/faq` — документация и справочник параметров.
- `features/ecosystem` — адаптация серверных снимков и слой жизни на глобусе.
- `features/planet-transition` — ferry планеты между home и sandbox.
- `features/lab-tour` — spotlight-онбординг лаборатории (Driver.js).
- `store/lab` — состояние UI и опыты по планетам.
- `shared/api/xenochoice` — API v2, типы, REST и WebSocket.
- `shared/ui` — UI-kit, LabRail, Sparkline, глобус.
- `shared/constants` — маршруты, storage keys, WORLD_THUMB.
- `shared/voice` — распознавание, команды и озвучка действий.

API v2 — camelCase, отдельный Axios-клиент. WebSocket обновляет UI до 10 раз/с, при обрыве — переподключение и REST polling. Голос зависит от браузера и разрешений; для основного сценария не обязателен.

## Проверки и сборка

```sh
pnpm check
pnpm build
```

Если оболочка pnpm недоступна при уже установленных зависимостях:

```sh
./node_modules/.bin/biome check .
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
```

Сборка тяжелее из‑за 3D. `nginx.conf` проксирует `/api/` и WebSocket на backend :8080, клиентские маршруты — через `index.html`. Переменные `VITE_*` вшиваются на этапе сборки.
