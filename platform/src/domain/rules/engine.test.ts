import { describe, expect, it } from 'vitest';
import { clearPriceObservation, createEmptyVisit, parseVisitDraft } from '../visit';
import {
  evaluateFds,
  evaluatePrice,
  evaluateVisit,
  extraPointBandFor,
} from './engine';
import {
  EXTRA_POINT_BANDS,
  PLANOGRAM_RULES,
  PRESENCE_REQUIREMENTS,
  applicablePresenceRequirements,
} from './rule-config';
import { priceEntriesFor } from './price-ruler';
import type { StoreFormat, VisitDraft } from './types';

function completeVisit(format: StoreFormat = 'super'): VisitDraft {
  const visit = createEmptyVisit(new Date('2026-08-17T12:00:00Z'));
  visit.identity = {
    ...visit.identity,
    storeName: 'Loja Copacabana',
    storeCode: 'RJ-001',
    collaborator: 'Pessoa Promotora',
    companyTime: '2 anos',
    storeTime: '8 meses',
    channel: format === 'atacado' ? 'atacado' : 'varejo',
    format,
    visitDate: '2026-08-17',
  };
  visit.safety = { epis: true, exitKnown: true, safePhoneUse: true };
  visit.cooler = { inspected: true, correctlyPositioned: true, coldSovi: 60 };
  visit.fdsPriceExecution = true;

  for (const requirement of PRESENCE_REQUIREMENTS) {
    const first = requirement.alternatives[0].id;
    const score = requirement.scores[format];
    visit.presence[requirement.id] = {
      shelf: score.shelf > 0 ? first : undefined,
      cold: score.cold > 0 ? first : undefined,
    };
  }
  visit.sovi = {
    craft: { worldCm: 100, heinekenCm: 53 },
    premium: { worldCm: 100, heinekenCm: 57 },
    mainstream: { worldCm: 100, heinekenCm: 25 },
  };
  for (const rule of PLANOGRAM_RULES) visit.planogram[rule.id] = true;
  visit.extraPoints = {
    total: 22,
    qualifying: { craft: 1, premium: 6, mainstream: 3 },
  };
  const price = priceEntriesFor(visit.identity.channel)[0];
  visit.priceObservations = [
    { id: 'price-1', rulerEntryId: price.id, observed: price.regular },
  ];
  return visit;
}

describe('motor FDS versionado', () => {
  it.each(['hiper', 'super', 'mini', 'atacado'] as StoreFormat[])(
    'fecha os tetos sem ultrapassar 100 no formato %s',
    (format) => {
      const result = evaluateFds(completeVisit(format));
      expect(result.pillars).toEqual({
        presence: 40,
        positioning: 35,
        visibility: 20,
        pricing: 5,
      });
      expect(result.total).toBe(100);
    },
  );

  it('trata alternativas OR por ID e pontua uma única vez', () => {
    const first = completeVisit('hiper');
    const second = structuredClone(first);
    const rule = PRESENCE_REQUIREMENTS.find((item) => item.id === 'craft-baden-ipa')!;
    first.presence[rule.id].shelf = rule.alternatives[0].id;
    second.presence[rule.id].shelf = rule.alternatives[1].id;

    expect(evaluateFds(first).pillars.presence).toBe(40);
    expect(evaluateFds(second).pillars.presence).toBe(40);
  });

  it('mantém gôndola e gelada como colocações independentes', () => {
    const visit = completeVisit('hiper');
    const rule = PRESENCE_REQUIREMENTS.find((item) => item.id === 'premium-hnk-350')!;
    const full = evaluateFds(visit).pillars.presence;
    visit.presence[rule.id].cold = null;
    const withoutCold = evaluateFds(visit).pillars.presence;
    expect(full - withoutCold).toBe(rule.scores.hiper.cold);
    expect(visit.presence[rule.id].shelf).toBeTruthy();
  });

  it('ignora IDs que não pertencem ao grupo OR', () => {
    const visit = completeVisit('super');
    const rule = PRESENCE_REQUIREMENTS.find((item) => item.id === 'craft-baden-ipa')!;
    visit.presence[rule.id].shelf = 'sku-forjado';
    const result = evaluateFds(visit);
    expect(result.pillars.presence).toBe(39.5);
    expect(result.gaps.some((gap) => gap.id === `presence:${rule.id}:shelf`)).toBe(true);
  });

  it('exige plano apenas para ausência confirmada, não para item ainda não avaliado', () => {
    const visit = completeVisit('super');
    const rule = PRESENCE_REQUIREMENTS.find((item) => item.id === 'craft-baden-ipa')!;
    visit.presence[rule.id].shelf = undefined;
    expect(evaluateFds(visit).gaps.find((gap) => gap.id === `presence:${rule.id}:shelf`)?.requiresPlan).toBe(false);
    visit.presence[rule.id].shelf = null;
    expect(evaluateFds(visit).gaps.find((gap) => gap.id === `presence:${rule.id}:shelf`)?.requiresPlan).toBe(true);
  });

  it('calcula SOVI nos limites e rejeita medidas impossíveis', () => {
    const visit = completeVisit();
    visit.sovi.premium.heinekenCm = 56.9;
    expect(evaluateFds(visit).pillars.positioning).toBe(26);
    visit.sovi.premium.heinekenCm = 101;
    const result = evaluateFds(visit);
    expect(result.shares.premium.value).toBeNull();
    expect(result.pillars.positioning).toBe(26);
  });
});

describe('faixas e pontuação de pontos extras', () => {
  it.each([
    [5, 'pe-0-5'],
    [6, 'pe-6-10'],
    [10, 'pe-6-10'],
    [11, 'pe-11-15'],
    [15, 'pe-11-15'],
    [16, 'pe-16-20'],
    [20, 'pe-16-20'],
    [21, 'pe-21-plus'],
    [22, 'pe-21-plus'],
  ])('classifica %i PEs na faixa %s', (total, band) => {
    expect(extraPointBandFor(total)?.id).toBe(band);
  });

  it('mantém as faixas contíguas e configuráveis', () => {
    expect(EXTRA_POINT_BANDS.map((band) => band.id)).toHaveLength(5);
    expect(extraPointBandFor(21)?.min).toBe(21);
  });

  it('não concede 6 pontos Craft quando a meta da faixa até 5 é zero', () => {
    const visit = completeVisit();
    visit.extraPoints = {
      total: 5,
      qualifying: { craft: 0, premium: 1, mainstream: 1 },
    };
    expect(evaluateFds(visit).pillars.visibility).toBe(14);
  });
});

describe('régua de preço', () => {
  it('aceita exatamente o preço regular ou promocional e rejeita terceiro valor', () => {
    const visit = completeVisit();
    const entry = priceEntriesFor('varejo').find(
      (item) => item.regular !== item.promotional,
    )!;
    visit.priceObservations = [
      { id: 'regular', rulerEntryId: entry.id, observed: entry.regular },
      { id: 'promo', rulerEntryId: entry.id, observed: entry.promotional },
      { id: 'outside', rulerEntryId: entry.id, observed: entry.regular + 0.01 },
    ];
    const result = evaluatePrice(visit);
    expect(result.results.map((item) => item.status)).toEqual([
      'regular',
      'promotional',
      'outside',
    ]);
    expect(result.percentage).toBe(67);
  });

  it('aplica canal, UF e vigência', () => {
    const visit = completeVisit();
    const entry = priceEntriesFor('varejo')[0];
    visit.identity.visitDate = '2026-09-01';
    visit.priceObservations = [
      { id: 'expired', rulerEntryId: entry.id, observed: entry.regular },
    ];
    expect(evaluatePrice(visit).results[0].status).toBe('missing-ruler');
  });

  it('volta de terceiro valor para não avaliado ao apagar', () => {
    const visit = completeVisit();
    const entry = priceEntriesFor('varejo').find((item) => item.regular !== item.promotional)!;
    visit.priceObservations = [
      { id: 'editable', rulerEntryId: entry.id, observed: entry.regular + 0.01 },
    ];
    expect(evaluatePrice(visit).results[0].status).toBe('outside');

    visit.priceObservations[0].observed = null;
    const cleared = evaluatePrice(visit);
    expect(cleared.results[0].status).toBe('unanswered');
    expect(cleared.observedCount).toBe(0);
    expect(cleared.percentage).toBeNull();
    expect(cleared.gaps[0].requiresPlan).toBe(false);
  });

  it('aceita regular após limpar e limpa novamente pela ação explícita', () => {
    const visit = completeVisit();
    const entry = priceEntriesFor('varejo')[0];
    visit.priceObservations = [{ id: 'clear-button', rulerEntryId: entry.id, observed: null }];
    visit.priceObservations[0].observed = entry.regular;
    expect(evaluatePrice(visit).results[0].status).toBe('regular');

    const cleared = clearPriceObservation(visit, 'clear-button');
    expect(cleared.priceObservations[0].observed).toBeNull();
    expect(evaluatePrice(cleared).results[0].status).toBe('unanswered');
  });

  it('distingue valor inválido de divergência observada', () => {
    const visit = completeVisit();
    visit.priceObservations[0].observed = Number.NaN;
    const result = evaluatePrice(visit);
    expect(result.results[0].status).toBe('invalid');
    expect(result.observedCount).toBe(0);
    expect(result.gaps[0].title).toBe('Preço inválido');
  });

  it('persiste preço limpo sem restaurar o valor anterior', () => {
    const visit = completeVisit();
    const cleared = clearPriceObservation(visit, 'price-1');
    const reloaded = parseVisitDraft(JSON.stringify(cleared));
    expect(reloaded?.priceObservations[0].observed).toBeNull();
    expect(evaluatePrice(reloaded!).results[0].status).toBe('unanswered');
  });
});

describe('separação das três métricas', () => {
  it('não altera o FDS quando apenas o preço observado muda', () => {
    const visit = completeVisit();
    const baseline = evaluateVisit(visit);
    visit.priceObservations[0].observed = 999;
    const changed = evaluateVisit(visit);
    expect(changed.fds.total).toBe(baseline.fds.total);
    expect(changed.price.percentage).toBe(0);
    expect(changed.readiness.score).toBe(baseline.readiness.score);
  });

  it('reinicia uma visita com novo ID e sem estado misturado', () => {
    const first = completeVisit();
    const second = createEmptyVisit(new Date('2026-08-18T12:00:00Z'));
    expect(second.id).not.toBe(first.id);
    expect(second.identity.storeName).toBe('');
    expect(second.presence).toEqual({});
    expect(second.priceObservations).toEqual([]);
  });

  it('expõe somente requisitos aplicáveis ao formato', () => {
    const requirements = applicablePresenceRequirements('atacado');
    expect(requirements.length).toBeGreaterThan(0);
    for (const requirement of requirements) {
      const score = requirement.scores.atacado;
      expect(score.shelf + score.cold).toBeGreaterThan(0);
    }
  });
});
