export type StoreFormat = 'hiper' | 'super' | 'mini' | 'atacado';
export type Channel = 'varejo' | 'atacado';
export type Segment = 'craft' | 'premium' | 'mainstream';
export type Placement = 'shelf' | 'cold';

export interface RuleVersion {
  id: string;
  label: string;
  status: 'provisional' | 'approved';
  effectiveFrom: string;
  notes: string[];
}

export interface PlacementScore {
  shelf: number;
  cold: number;
}

export interface PresenceAlternative {
  id: string;
  label: string;
}

export interface PresenceRequirement {
  id: string;
  label: string;
  segment: Segment | 'nab';
  alternatives: PresenceAlternative[];
  scores: Record<StoreFormat, PlacementScore>;
}

export interface SoviRule {
  segment: Segment;
  label: string;
  target: number;
  points: number;
}

export interface PlanogramRule {
  id: string;
  label: string;
  points: number;
  segment: Segment | 'nab';
}

export interface ExtraPointBand {
  id: string;
  min: number;
  max: number | null;
  targets: Record<Segment, number>;
}

export interface PriceRulerEntry {
  id: string;
  channel: Channel;
  uf: 'RJ';
  segment: string;
  brand: string;
  sku: string;
  regular: number;
  promotional: number;
  validFrom: string;
  validTo: string;
}

export interface ActionPlan {
  cause: string;
  action: string;
  owner: string;
  dueDate: string;
}

export type PresenceAnswerValue = string | null | undefined;

export interface VisitDraft {
  schemaVersion: 2;
  id: string;
  createdAt: string;
  updatedAt: string;
  identity: {
    storeName: string;
    storeCode: string;
    collaborator: string;
    companyTime: string;
    storeTime: string;
    channel: Channel;
    format: StoreFormat;
    uf: 'RJ';
    visitDate: string;
  };
  safety: {
    epis: boolean | null;
    exitKnown: boolean | null;
    safePhoneUse: boolean | null;
  };
  presence: Record<
    string,
    { shelf: PresenceAnswerValue; cold: PresenceAnswerValue }
  >;
  sovi: Record<Segment, { worldCm: number | null; heinekenCm: number | null }>;
  planogram: Record<string, boolean | null>;
  extraPoints: {
    total: number | null;
    qualifying: Record<Segment, number | null>;
  };
  cooler: {
    inspected: boolean | null;
    correctlyPositioned: boolean | null;
    coldSovi: number | null;
  };
  fdsPriceExecution: boolean | null;
  priceObservations: Array<{
    id: string;
    rulerEntryId: string;
    observed: number | null;
  }>;
  actions: Record<string, ActionPlan>;
}

export interface Gap {
  id: string;
  metric: 'fds' | 'price' | 'readiness';
  area: string;
  title: string;
  detail: string;
  recoverablePoints: number;
  severity: 'critical' | 'attention' | 'info';
  requiresPlan?: boolean;
}

export interface FdsEvaluation {
  total: number;
  pillars: {
    presence: number;
    positioning: number;
    visibility: number;
    pricing: number;
  };
  shares: Record<Segment, { value: number | null; target: number; met: boolean }>;
  extraPointBand: ExtraPointBand | null;
  gaps: Gap[];
  warnings: string[];
}

export interface PriceEvaluation {
  observedCount: number;
  conformingCount: number;
  percentage: number | null;
  results: Array<{
    observationId: string;
    entry: PriceRulerEntry | null;
    observed: number | null;
    status: 'regular' | 'promotional' | 'outside' | 'missing-ruler' | 'invalid' | 'unanswered';
  }>;
  gaps: Gap[];
}

export interface ReadinessEvaluation {
  score: number;
  label: 'Pronto' | 'Em preparação' | 'Atenção';
  factors: Array<{ id: string; label: string; earned: number; possible: number }>;
  gaps: Gap[];
}

export interface VisitEvaluation {
  fds: FdsEvaluation;
  price: PriceEvaluation;
  readiness: ReadinessEvaluation;
  prioritizedGaps: Gap[];
}
