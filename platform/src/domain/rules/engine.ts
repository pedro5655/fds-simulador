import {
  EXTRA_POINT_BANDS,
  EXTRA_POINT_WEIGHTS,
  PLANOGRAM_RULES,
  PRESENCE_REQUIREMENTS,
  RULESET_VERSION,
  SOVI_RULES,
  applicablePresenceRequirements,
} from './rule-config';
import { PRICE_RULER_ENTRIES } from './price-ruler';
import type {
  ActionPlan,
  ExtraPointBand,
  FdsEvaluation,
  Gap,
  Placement,
  PriceEvaluation,
  ReadinessEvaluation,
  Segment,
  VisitDraft,
  VisitEvaluation,
} from './types';

const segments: Segment[] = ['craft', 'premium', 'mainstream'];
const segmentLabel: Record<Segment, string> = {
  craft: 'Craft',
  premium: 'Premium',
  mainstream: 'Mainstream',
};

const round1 = (value: number): number => Math.round(value * 10) / 10;
const cap = (value: number, maximum: number): number => Math.min(maximum, Math.max(0, round1(value)));
const cents = (value: number): number => Math.round(value * 100);

function isAllowedAlternative(
  value: string | null | undefined,
  allowedIds: string[],
): value is string {
  return typeof value === 'string' && allowedIds.includes(value);
}

export function extraPointBandFor(total: number | null): ExtraPointBand | null {
  if (total === null || !Number.isFinite(total) || total < 0) return null;
  return (
    EXTRA_POINT_BANDS.find(
      (band) => total >= band.min && (band.max === null || total <= band.max),
    ) ?? null
  );
}

export function evaluateFds(visit: VisitDraft): FdsEvaluation {
  const gaps: Gap[] = [];
  const warnings = [...RULESET_VERSION.notes];
  let presenceScore = 0;

  for (const requirement of PRESENCE_REQUIREMENTS) {
    const answer = visit.presence[requirement.id] ?? {};
    const allowedIds = requirement.alternatives.map((alternative) => alternative.id);
    const score = requirement.scores[visit.identity.format];

    for (const placement of ['shelf', 'cold'] as Placement[]) {
      const possible = score[placement];
      if (possible <= 0) continue;
      if (isAllowedAlternative(answer[placement], allowedIds)) {
        presenceScore += possible;
      } else {
        const where = placement === 'shelf' ? 'gôndola' : 'gelada';
        gaps.push({
          id: `presence:${requirement.id}:${placement}`,
          metric: 'fds',
          area: 'Presença',
          title: `${requirement.label} - ${where}`,
          detail:
            answer[placement] === undefined
              ? 'Item ainda não avaliado.'
              : `Nenhuma das alternativas OR foi encontrada em ${where}.`,
          recoverablePoints: possible,
          severity: possible >= 2 ? 'critical' : 'attention',
          requiresPlan: answer[placement] === null,
        });
      }
    }
  }
  presenceScore = cap(presenceScore, 40);

  const shares = {} as FdsEvaluation['shares'];
  let soviScore = 0;
  for (const rule of SOVI_RULES) {
    const input = visit.sovi[rule.segment];
    const world = input.worldCm;
    const heineken = input.heinekenCm;
    const isValid =
      world !== null &&
      heineken !== null &&
      world > 0 &&
      heineken >= 0 &&
      heineken <= world;
    const value = isValid ? round1((heineken / world) * 100) : null;
    const met = value !== null && value >= rule.target;
    shares[rule.segment] = { value, target: rule.target, met };

    if (met) {
      soviScore += rule.points;
    } else {
      const detail =
        world !== null && heineken !== null && heineken > world
          ? 'Medida HEINEKEN maior que o mundo da categoria; corrija a medição.'
          : value === null
            ? 'Medição ainda incompleta.'
            : `Atual ${value}% versus meta ${rule.target}%.`;
      gaps.push({
        id: `sovi:${rule.segment}`,
        metric: 'fds',
        area: 'SOVI',
        title: `${rule.label} abaixo da meta`,
        detail,
        recoverablePoints: rule.points,
        severity: 'critical',
        requiresPlan: value !== null,
      });
    }
  }

  let planogramScore = 0;
  for (const rule of PLANOGRAM_RULES) {
    if (visit.planogram[rule.id] === true) {
      planogramScore += rule.points;
    } else {
      gaps.push({
        id: `planogram:${rule.id}`,
        metric: 'fds',
        area: 'Planograma',
        title: rule.label,
        detail:
          visit.planogram[rule.id] === false
            ? 'Critério marcado como não conforme.'
            : 'Critério ainda não avaliado.',
        recoverablePoints: rule.points,
        severity: rule.points >= 1 ? 'attention' : 'info',
        requiresPlan: visit.planogram[rule.id] === false,
      });
    }
  }
  const positioningScore = cap(soviScore + planogramScore, 35);

  const band = extraPointBandFor(visit.extraPoints.total);
  let visibilityScore = 0;
  if (!band) {
    gaps.push({
      id: 'extra:total',
      metric: 'fds',
      area: 'Pontos extras',
      title: 'Total de pontos extras não informado',
      detail: 'Informe o total de pontos extras de cerveja para aplicar a faixa.',
      recoverablePoints: 20,
      severity: 'critical',
      requiresPlan: false,
    });
  } else {
    for (const segment of segments) {
      const target = band.targets[segment];
      const actual = visit.extraPoints.qualifying[segment];
      const points = EXTRA_POINT_WEIGHTS[segment];
      // Decisão provisória explícita: target 0 é não aplicável e não pontua.
      if (target === 0) continue;
      if (actual !== null && actual >= target) {
        visibilityScore += points;
      } else {
        gaps.push({
          id: `extra:${segment}`,
          metric: 'fds',
          area: 'Pontos extras',
          title: `${segmentLabel[segment]} abaixo da meta de PE`,
          detail: `${actual ?? 0} PE qualificado(s) versus meta ${target}.`,
          recoverablePoints: points,
          severity: 'critical',
          requiresPlan: actual !== null,
        });
      }
    }
  }
  visibilityScore = cap(visibilityScore, 20);

  const pricingScore = visit.fdsPriceExecution === true ? 5 : 0;
  if (visit.fdsPriceExecution !== true) {
    gaps.push({
      id: 'fds:pricing-execution',
      metric: 'fds',
      area: 'Precificação FDS',
      title: 'Execução de etiquetas/preços não confirmada',
      detail:
        'Critério provisório independente da régua. A fórmula oficial dos 5 pontos aguarda homologação.',
      recoverablePoints: 5,
      severity: 'attention',
      requiresPlan: visit.fdsPriceExecution === false,
    });
  }

  return {
    total: cap(presenceScore + positioningScore + visibilityScore + pricingScore, 100),
    pillars: {
      presence: presenceScore,
      positioning: positioningScore,
      visibility: visibilityScore,
      pricing: pricingScore,
    },
    shares,
    extraPointBand: band,
    gaps,
    warnings,
  };
}

export function evaluatePrice(visit: VisitDraft): PriceEvaluation {
  const results: PriceEvaluation['results'] = [];
  const gaps: Gap[] = [];

  for (const observation of visit.priceObservations) {
    const entry =
      PRICE_RULER_ENTRIES.find(
        (candidate) =>
          candidate.id === observation.rulerEntryId &&
          candidate.channel === visit.identity.channel &&
          candidate.uf === visit.identity.uf &&
          visit.identity.visitDate >= candidate.validFrom &&
          visit.identity.visitDate <= candidate.validTo,
      ) ?? null;
    let status: PriceEvaluation['results'][number]['status'];
    if (observation.observed === null) status = 'unanswered';
    else if (!Number.isFinite(observation.observed) || observation.observed < 0) status = 'invalid';
    else if (!entry) status = 'missing-ruler';
    else if (cents(observation.observed) === cents(entry.regular)) status = 'regular';
    else if (cents(observation.observed) === cents(entry.promotional)) status = 'promotional';
    else status = 'outside';

    results.push({
      observationId: observation.id,
      entry,
      observed: observation.observed,
      status,
    });

    if (status === 'unanswered') {
      gaps.push({
        id: `price:${observation.id}:unanswered`,
        metric: 'price',
        area: 'Régua de preço',
        title: 'Preço não avaliado',
        detail: entry ? `${entry.brand} ${entry.sku} está na lista, mas o valor observado foi limpo ou ainda não foi preenchido.` : 'O item está na lista, mas o preço observado não foi preenchido.',
        recoverablePoints: 0,
        severity: 'attention',
        requiresPlan: false,
      });
    } else if (status === 'invalid') {
      gaps.push({
        id: `price:${observation.id}:invalid`,
        metric: 'price',
        area: 'Régua de preço',
        title: 'Preço inválido',
        detail: 'Informe um valor numérico maior ou igual a zero, ou limpe a observação.',
        recoverablePoints: 0,
        severity: 'attention',
        requiresPlan: false,
      });
    } else if (status === 'outside' || status === 'missing-ruler') {
      gaps.push({
        id: `price:${observation.id}`,
        metric: 'price',
        area: 'Régua de preço',
        title: entry ? `${entry.brand} ${entry.sku} fora da régua` : 'SKU sem régua vigente',
        detail: entry
          ? `Observado R$ ${observation.observed?.toFixed(2)}; válidos R$ ${entry.regular.toFixed(2)} OU R$ ${entry.promotional.toFixed(2)}.`
          : 'A combinação canal, UF, SKU e vigência não foi encontrada.',
        recoverablePoints: 0,
        severity: 'critical',
        requiresPlan: observation.observed !== null,
      });
    }
  }

  const observed = results.filter((result) =>
    result.status === 'regular' ||
    result.status === 'promotional' ||
    result.status === 'outside' ||
    result.status === 'missing-ruler',
  );
  const conforming = observed.filter(
    (result) => result.status === 'regular' || result.status === 'promotional',
  );
  return {
    observedCount: observed.length,
    conformingCount: conforming.length,
    percentage: observed.length ? Math.round((conforming.length / observed.length) * 100) : null,
    results,
    gaps,
  };
}

function actionIsComplete(action: ActionPlan | undefined): boolean {
  return Boolean(
    action?.cause.trim() &&
      action.action.trim() &&
      action.owner.trim() &&
      action.dueDate,
  );
}

export function evaluateReadiness(
  visit: VisitDraft,
  priorityGaps: Gap[] = [],
): ReadinessEvaluation {
  const factors: ReadinessEvaluation['factors'] = [];
  const gaps: Gap[] = [];
  const add = (
    id: string,
    label: string,
    earned: number,
    possible: number,
    detail: string,
    requiresPlan = false,
  ) => {
    factors.push({ id, label, earned: round1(earned), possible });
    if (earned < possible) {
      gaps.push({
        id: `readiness:${id}`,
        metric: 'readiness',
        area: 'Prontidão',
        title: label,
        detail,
        recoverablePoints: round1(possible - earned),
        severity: possible - earned >= 8 ? 'critical' : 'attention',
        requiresPlan,
      });
    }
  };

  const identityFields = [
    visit.identity.storeName,
    visit.identity.storeCode,
    visit.identity.collaborator,
    visit.identity.visitDate,
  ];
  add(
    'identity',
    'Identificação da visita',
    (identityFields.filter((value) => value.trim()).length / identityFields.length) * 10,
    10,
    'Complete loja, código, colaborador e data.',
  );

  const safetyValues = Object.values(visit.safety);
  const negativeSafetyItems = [
    visit.safety.epis === false ? 'EPIs' : null,
    visit.safety.exitKnown === false ? 'saída de emergência' : null,
    visit.safety.safePhoneUse === false ? 'uso seguro do celular' : null,
  ].filter((value): value is string => value !== null);
  add(
    'safety',
    'Segurança, EPIs e saída',
    (safetyValues.filter((value) => value === true).length / safetyValues.length) * 20,
    20,
    negativeSafetyItems.length
      ? `Resposta negativa registrada em: ${negativeSafetyItems.join(', ')}.`
      : 'Confirme EPIs, saída de emergência e uso seguro do celular.',
    safetyValues.some((value) => value === false),
  );

  const requirements = applicablePresenceRequirements(visit.identity.format);
  const placementAnswers = requirements.flatMap((requirement) => {
    const score = requirement.scores[visit.identity.format];
    const answer = visit.presence[requirement.id] ?? {};
    return (['shelf', 'cold'] as Placement[])
      .filter((placement) => score[placement] > 0)
      .map((placement) => answer[placement]);
  });
  const answeredPlacements = placementAnswers.filter((value) => value !== undefined).length;
  add(
    'presence',
    'Mapa de presença concluído',
    placementAnswers.length ? (answeredPlacements / placementAnswers.length) * 15 : 15,
    15,
    'Avalie todas as presenças aplicáveis em gôndola e gelada.',
  );

  const soviComplete = segments.filter((segment) => {
    const value = visit.sovi[segment];
    return (
      value.worldCm !== null &&
      value.heinekenCm !== null &&
      value.worldCm > 0 &&
      value.heinekenCm >= 0 &&
      value.heinekenCm <= value.worldCm
    );
  }).length;
  add(
    'sovi',
    'Medições SOVI válidas',
    (soviComplete / segments.length) * 15,
    15,
    'Meça mundo e espaço HEINEKEN de Craft, Premium e Mainstream.',
  );

  const executionAnswers = [
    visit.extraPoints.total,
    ...segments.map((segment) => visit.extraPoints.qualifying[segment]),
    visit.fdsPriceExecution,
  ];
  const planogramAnswered = PLANOGRAM_RULES.filter(
    (rule) => visit.planogram[rule.id] !== undefined,
  ).length;
  const executionRatio =
    (executionAnswers.filter((value) => value !== null).length +
      planogramAnswered / PLANOGRAM_RULES.length) /
    (executionAnswers.length + 1);
  add(
    'execution',
    'Execução e pontos extras',
    executionRatio * 15,
    15,
    'Conclua planograma, PE e precificação FDS.',
  );

  const coolerEarned =
    (visit.cooler.inspected === true ? 4 : 0) +
    (visit.cooler.correctlyPositioned === true ? 4 : 0) +
    (visit.cooler.coldSovi !== null ? 2 : 0);
  add(
    'cooler',
    'Geladeira pronta para o tour',
    coolerEarned,
    10,
    'Inspecione, valide o posicionamento e registre o SOVI gelado.',
  );

  add(
    'price',
    'Régua de preço verificada',
    visit.priceObservations.some((item) => item.observed !== null) ? 5 : 0,
    5,
    'Registre ao menos um preço observado.',
  );

  const actionable = priorityGaps.filter((gap) => gap.requiresPlan).slice(0, 5);
  const completedPlans = actionable.filter((gap) => actionIsComplete(visit.actions[gap.id])).length;
  add(
    'plans',
    'Plano das prioridades',
    actionable.length ? (completedPlans / actionable.length) * 10 : 10,
    10,
    'Preencha causa, ação, responsável e prazo das cinco maiores prioridades.',
  );

  const score = cap(
    factors.reduce((total, factor) => total + factor.earned, 0),
    100,
  );
  return {
    score,
    label: score >= 85 ? 'Pronto' : score >= 60 ? 'Em preparação' : 'Atenção',
    factors,
    gaps,
  };
}

function prioritySort(a: Gap, b: Gap): number {
  const severity = { critical: 3, attention: 2, info: 1 };
  return (
    b.recoverablePoints - a.recoverablePoints ||
    severity[b.severity] - severity[a.severity] ||
    a.title.localeCompare(b.title)
  );
}

export function evaluateVisit(visit: VisitDraft): VisitEvaluation {
  const fds = evaluateFds(visit);
  const price = evaluatePrice(visit);
  const baseGaps = [...fds.gaps, ...price.gaps].sort(prioritySort);
  // Prontidão não herda a conformidade da régua: ela mede preparo operacional.
  // Planos de divergência de preço continuam no diagnóstico, sem acoplar as métricas.
  const readiness = evaluateReadiness(visit, fds.gaps);
  const prioritizedGaps = [...baseGaps, ...readiness.gaps].sort(prioritySort);
  return { fds, price, readiness, prioritizedGaps };
}
