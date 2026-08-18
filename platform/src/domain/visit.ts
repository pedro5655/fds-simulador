import type { Segment, VisitDraft } from './rules/types';

const segments: Segment[] = ['craft', 'premium', 'mainstream'];

export function createEmptyVisit(now = new Date()): VisitDraft {
  const iso = now.toISOString();
  const sovi = Object.fromEntries(
    segments.map((segment) => [segment, { worldCm: null, heinekenCm: null }]),
  ) as VisitDraft['sovi'];

  return {
    schemaVersion: 2,
    id: crypto.randomUUID(),
    createdAt: iso,
    updatedAt: iso,
    identity: {
      storeName: '',
      storeCode: '',
      collaborator: '',
      companyTime: '',
      storeTime: '',
      channel: 'varejo',
      format: 'super',
      uf: 'RJ',
      visitDate: now.toISOString().slice(0, 10),
    },
    safety: { epis: null, exitKnown: null, safePhoneUse: null },
    presence: {},
    sovi,
    planogram: {},
    extraPoints: {
      total: null,
      qualifying: { craft: null, premium: null, mainstream: null },
    },
    cooler: { inspected: null, correctlyPositioned: null, coldSovi: null },
    fdsPriceExecution: null,
    priceObservations: [],
    actions: {},
  };
}

export function isVisitDraft(value: unknown): value is VisitDraft {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VisitDraft>;
  return candidate.schemaVersion === 2 && typeof candidate.id === 'string';
}

export function clearPriceObservation(visit: VisitDraft, observationId: string): VisitDraft {
  return {
    ...visit,
    priceObservations: visit.priceObservations.map((observation) =>
      observation.id === observationId ? { ...observation, observed: null } : observation,
    ),
  };
}

export function parseVisitDraft(raw: string | null): VisitDraft | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isVisitDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
