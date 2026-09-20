/**
 * Types for the XenoChoice Sandbox API v2 ("Машина выбора").
 * Mirrors the live backend response shapes (http://80.78.247.32:8080/swagger/index.html),
 * which are richer than the OpenAPI schema's simplified examples — field names and
 * nullability below were verified against real responses, not just the spec.
 */

export type WorldId = 'earth' | 'mars' | 'venus';

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PlanetaryReference = {
  bodyName: string;
  meanTemperatureCelsius: number;
  temperatureKelvin: number;
  gravity: number;
  surfacePressureBar: number;
  source: string;
  sourceDate: string;
};

export type LocalScenarioConfig = {
  regionName: string;
  baseFlow: number;
  noiseAmplitude: number;
  specificParams: Record<string, number>;
};

export type ModelConfig = {
  organismType: string;
  dt: number;
  eMax: number;
  reserveTarget: number;
  maintenanceRate: number;
  starvationLimit: number;
  maxPopulation: number;
  maxColonies: number;
};

export type World = {
  id: WorldId;
  name: string;
  description: string;
  reference: PlanetaryReference;
  scenario: LocalScenarioConfig;
  model: ModelConfig;
  textureUrl: string;
};

export type Genome = {
  wE: number;
  wD: number;
  wC: number;
  wR: number;
  wCost: number;
  lambda: number;
  hThreshold: number;
};

/** `lastDecision.selectedAction` values observed from the live model. */
export type DecisionAction = 'STORE' | 'GROW' | 'DIVIDE' | 'TRANSFER';

export type DecisionTrace = {
  individualId: string;
  mode: string;
  tick: number;
  selectedAction: DecisionAction;
  selectedTarget?: string;
  scores: Record<string, number>;
  chosenScore: number;
  reasoning: string;
};

export type Individual = {
  id: string;
  worldId: WorldId;
  colonyId: string;
  parentId?: string;
  lat: number;
  lng: number;
  energy: number;
  biomass: number;
  memory: number;
  genome: Genome;
  alive: boolean;
  age: number;
  generation: number;
  starvationTicks: number;
  birthTick: number;
  lastDivisionTick: number;
  lastDecision?: DecisionTrace;
};

export type Colony = {
  parentColonyId?: string;
  id: string;
  worldId: WorldId;
  name: string;
  color: string;
  formedAtTick: number;
  individualIds: string[];
  metrics: {
    population: number;
    totalEnergy: number;
    totalBiomass: number;
    mortalityRate: number;
    communicationLevel: number;
    decisionDistribution: Record<DecisionAction, number> | null;
  };
};

export type Channel = {
  id: string;
  fromId: string;
  toId: string;
  distance: number;
  conductance: number;
  maxPower: number;
  loss: number;
  delayTicks: number;
  enabled: boolean;
};

export type Signal = {
  id: string;
  senderId: string;
  receiverId: string;
  normalizedE: number;
  value: number;
  isStarving: boolean;
  emittedTick: number;
  deliveryTick: number;
};

export type MetricsSnapshot = {
  tick: number;
  timeTU: number;
  population: number;
  activeColonies: number;
  survivalRate: number;
  inputPower: number;
  usefulPower: number;
  /** Fraction 0..1 in the live backend, despite the swagger example showing 79.8. */
  efficiency: number;
  decisionEntropy: number;
  deliveryLatency: number;
  deliveryMeasured: boolean;
  responseMeasured: boolean;
  responseLatency: number;
  birthsTotal: number;
  colonySplitsTotal: number;
  deathsTotal: number;
  meanWelfare: number;
  balanceResidual: number;
};

export type EnergyBalance = {
  initialStored: number;
  inoculated: number;
  externalInput: number;
  currentStored: number;
  inTransit: number;
  maintenance: number;
  signaling: number;
  channelLoss: number;
  conversionLoss: number;
  divisionCost: number;
  overflow: number;
  deathDissipation: number;
};

export type ExperimentStatus =
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

export type StateSnapshot = {
  mode: ExperimentMode;
  flow: number;
  noise: number;
  interventions: Intervention[];
  tick: number;
  revision: number;
  checksum: string;
  status: ExperimentStatus;
  world: World;
  individuals: Individual[];
  colonies: Colony[];
  channels: Channel[];
  inTransit: {
    senderId: string;
    receiverId: string;
    emittedTick: number;
    deliveryTick: number;
    netEnergy: number;
  }[];
  signals: Signal[];
  metrics: MetricsSnapshot;
  balance: EnergyBalance;
};

export type Intervention = {
  id: string;
  tick: number;
  sequence: number;
  type: InterventionType;
  targetId: string;
  value: number;
};

export type InterventionType =
  | 'add_inoculum'
  | 'set_flow'
  | 'set_noise'
  | 'impulse'
  | 'perturbation'
  | 'depletion'
  | 'toggle_mutations'
  | 'set_mode'
  | 'set_channel';

export type ExperimentMode = 'reactive' | 'adaptive' | 'evolutionary';

export type Experiment = {
  id: string;
  name: string;
  worldId: WorldId;
  mode: ExperimentMode;
  status: ExperimentStatus;
  seed: number;
  speed: number;
  parameters: Record<string, number>;
  interventions: Intervention[];
  initialSnapshot: StateSnapshot;
  latestSnapshot?: StateSnapshot;
  createdAt: string;
  updatedAt: string;
};

export type CreateExperimentRequest = {
  name: string;
  worldId: WorldId;
  mode: ExperimentMode;
  seed: number;
};

export type CommandType = 'start' | 'pause' | 'resume' | 'step' | 'setSpeed';

export type CommandRequest = {
  command: CommandType;
  speed?: 1 | 2 | 5;
  expectedRevision?: number;
};

export type CommandResult = {
  experimentId: string;
  revision: number;
  status: ExperimentStatus;
  tick: number;
};

export type InterventionRequest = {
  name?: string;
  color?: string;
  duration?: number;
  params?: Record<string, number>;
  genome?: Genome;
  type: InterventionType;
  targetId: string;
  value: number;
};

export type ReplayRequest = { targetTick: number };

export type ExportFormat = 'json' | 'csv';

export type ExportBundle = {
  schemaVersion: string;
  modelVersion: string;
  prng: unknown;
  experimentId: string;
  name: string;
  world: World;
  mode: ExperimentMode;
  status: ExperimentStatus;
  seed: string;
  parameters: Record<string, number>;
  interventions: Intervention[];
  finalSnapshot: StateSnapshot;
  metricsHistory: MetricsSnapshot[];
};

/** WS push envelope from `/experiments/{id}/stream`. */
export type StreamMessage = {
  experimentId: string;
  payload: StateSnapshot;
};
