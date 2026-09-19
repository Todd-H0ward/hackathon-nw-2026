import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Input,
  MetricCard,
  NavButton,
  Select,
  Separator,
  Slider,
  StatusDot,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToastProvider,
  useToast,
} from '@/shared/ui';

/* ── Internal showcase wrapper that needs toast context ── */
function UIKitContent() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(72);
  const [switchOn, setSwitchOn] = useState(true);
  const [activeNav, setActiveNav] = useState('lab');

  const sparkData = Array.from({ length: 14 }, (_, i) => ({
    value: 40 + Math.sin(i * 0.6) * 30 + Math.random() * 10,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-primary text-3xl">✳</span>
          <h1 className="text-2xl font-bold tracking-tight">
            xenochoice <span className="text-muted-foreground font-normal text-base">/ UI Kit</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Компоненты на основе shadcn + Tailwind v4 · XenoChoice Dark Theme
        </p>
      </div>

      {/* ── Badge ── */}
      <section className="space-y-4">
        <SectionTitle>Badge</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Badge>● СИМУЛЯЦИЯ АКТИВНА</Badge>
          <Badge variant="accent">● АКЦЕНТ</Badge>
          <Badge variant="green">● ONLINE</Badge>
          <Badge variant="outline">ВИЗУАЛЬНЫЙ КОНСТРУКТОР</Badge>
          <Badge>01 / RESPONSE</Badge>
        </div>
      </section>

      <Separator />

      {/* ── StatusDot ── */}
      <section className="space-y-4">
        <SectionTitle>StatusDot</SectionTitle>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><StatusDot variant="green" /> Движок готов</span>
          <span className="flex items-center gap-2"><StatusDot variant="accent" /> Симуляция активна</span>
          <span className="flex items-center gap-2"><StatusDot variant="muted" /> Offline</span>
        </div>
      </section>

      <Separator />

      {/* ── Button ── */}
      <section className="space-y-4">
        <SectionTitle>Button</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">↗ &nbsp; Экспорт</Button>
          <Button variant="primary">＋ &nbsp; Новый эксперимент</Button>
          <Button variant="ghost">Отмена</Button>
          <Button variant="ghost-accent">Атлас миров</Button>
          <Button variant="play" size="icon">▶</Button>
          <Button variant="outline" size="sm">↺</Button>
          <Button variant="destructive" size="sm">Удалить</Button>
          <Button disabled>Отключено</Button>
        </div>
      </section>

      <Separator />

      {/* ── NavButton ── */}
      <section className="space-y-4">
        <SectionTitle>NavButton</SectionTitle>
        <div className="w-[218px] space-y-[7px]">
          {[
            { id: 'lab', icon: '◈', label: 'Лаборатория' },
            { id: 'builder', icon: '▧', label: 'Конструктор' },
            { id: 'analytics', icon: '⌁', label: 'Аналитика' },
            { id: 'archive', icon: '▤', label: 'Эксперименты', count: 3 },
          ].map((item) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              count={item.count}
              active={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </NavButton>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Tabs ── */}
      <section className="space-y-4">
        <SectionTitle>Tabs</SectionTitle>
        <Tabs defaultValue="sim">
          <TabsList>
            <TabsTrigger value="sim" badge="01">Симуляция</TabsTrigger>
            <TabsTrigger value="build" badge="02">Конструктор</TabsTrigger>
            <TabsTrigger value="analytics" badge="03">Аналитика</TabsTrigger>
          </TabsList>
          <TabsContent value="sim">
            <p className="text-sm text-muted-foreground">Вкладка «Симуляция» активна.</p>
          </TabsContent>
          <TabsContent value="build">
            <p className="text-sm text-muted-foreground">Вкладка «Конструктор» активна.</p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="text-sm text-muted-foreground">Вкладка «Аналитика» активна.</p>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* ── Card ── */}
      <section className="space-y-4">
        <SectionTitle>Card</SectionTitle>
        <div className="max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="text-primary">◎</span> &nbsp; Энцелад / Ледяные гейзеры
              </CardTitle>
              <Badge variant="accent">● СИМУЛЯЦИЯ АКТИВНА</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Наблюдайте, как физика становится поведением.
              </p>
            </CardContent>
            <CardFooter>
              <span className="font-mono text-[10px] text-[#a5b997]">32 КОЛОНИИ</span>
              <Button variant="outline" size="sm">Подробнее</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ── MetricCard ── */}
      <section className="space-y-4">
        <SectionTitle>MetricCard</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Мощность"
            icon="ϟ"
            value="28.4"
            unit="у.е."
            description="Активность сети"
            sparkData={sparkData}
            sparkColor="#c08162"
          />
          <MetricCard
            label="Задержка ответа"
            icon="◷"
            value="3.7"
            unit="тактов"
            description="Время принятия решения"
            sparkData={sparkData.map(d => ({ value: d.value * 0.4 }))}
            sparkColor="#c08162"
          />
          <MetricCard
            label="Эффективность"
            icon="↗"
            value="61.3"
            unit="%"
            description="Доля активных колоний"
            sparkData={sparkData}
            sparkColor="#c08162"
          />
          <MetricCard
            label="Энтропия"
            icon="⌘"
            value="0.97"
            unit="бит"
            description="Неопределённость выбора"
            sparkData={sparkData.map(d => ({ value: d.value * 0.6 }))}
            sparkColor="#b0ce93"
          />
        </div>
      </section>

      <Separator />

      {/* ── Form Controls ── */}
      <section className="space-y-4">
        <SectionTitle>Form Controls</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <div className="space-y-6">
            <Select label="Небесное тело">
              <option>◉ &nbsp; Энцелад · Сатурн</option>
              <option>◉ &nbsp; Ио · Юпитер</option>
              <option>◉ &nbsp; Титан · Сатурн</option>
              <option>◉ &nbsp; Тритон · Нептун</option>
            </Select>

            <Slider
              label="Поток энергии"
              outputValue={`${sliderValue} %`}
              min={0}
              max={100}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number((e.target as HTMLInputElement).value))}
              minLabel="0 %"
              maxLabel="100 %"
            />

            <Slider
              label="Порог выбора"
              outputValue="0.65"
              defaultValue={65}
              min={10}
              max={95}
              minLabel="Реакция"
              maxLabel="Осознанный выбор"
            />
          </div>

          <div className="space-y-6">
            <Input
              label="SEED"
              type="number"
              defaultValue={2048}
              min={1}
              max={999999}
            />

            <Switch
              label="Эволюция системы"
              checked={switchOn}
              onChange={(e) => setSwitchOn((e.target as HTMLInputElement).checked)}
            />

            <Separator />

            <div className="flex gap-2 items-center">
              <Input
                type="number"
                inputSize="sm"
                defaultValue={2048}
                className="w-[85px]"
              />
              <Button variant="outline" size="sm">↵ Применить</Button>
              <span className="text-muted-foreground text-[10px]">Воспроизводимо</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Dialog & Toast ── */}
      <section className="space-y-4">
        <SectionTitle>Dialog & Toast</SectionTitle>
        <div className="flex gap-3 flex-wrap">
          <Button variant="default" onClick={() => setDialogOpen(true)}>
            Открыть диалог
          </Button>
          <Button variant="primary" onClick={() => toast('Стратегия применена ✳')}>
            Показать Toast
          </Button>
          <Button variant="ghost-accent" onClick={() => toast('Эксперимент сохранён')}>
            Toast 2
          </Button>
        </div>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Атлас необычной жизни</DialogTitle>
          <DialogDescription>
            Энцелад — сообщества ледяных гейзеров. Ио — тепловые колонии.
            Титан — сланцевые зеркала. Тритон — акустические сети азотного льда.
            Миры взяты из легенды хакатона; в этом прототипе они используют общую абстрактную модель.
          </DialogDescription>
          <DialogClose onClick={() => setDialogOpen(false)}>Понятно</DialogClose>
        </Dialog>
      </section>

      {/* Footer */}
      <div className="border-t border-border pt-6 flex justify-between font-mono text-[9px] tracking-[0.5px] text-muted-foreground">
        <span>XENOCHOICE © 2026 &nbsp; / &nbsp; UI KIT</span>
        <span>shadcn · Tailwind v4 · React 19 <span className="text-primary">✳</span></span>
      </div>
    </div>
  );
}

/* ── Section title helper ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-mono uppercase tracking-[1.7px] text-muted-foreground">
      {children}
    </h2>
  );
}

/* ── Page export (wraps with ToastProvider) ── */
export function UIKitPage() {
  return (
    <ToastProvider>
      <UIKitContent />
    </ToastProvider>
  );
}
