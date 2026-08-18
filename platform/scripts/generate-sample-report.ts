import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createEmptyVisit } from '../src/domain/visit';
import { evaluateVisit } from '../src/domain/rules/engine';
import { PLANOGRAM_RULES, PRESENCE_REQUIREMENTS } from '../src/domain/rules/rule-config';
import { priceEntriesFor } from '../src/domain/rules/price-ruler';
import { buildExecutivePdf } from '../src/report/executive-pdf';

const visit = createEmptyVisit(new Date('2026-08-17T14:00:00-03:00'));
visit.identity = {
  ...visit.identity,
  storeName: 'Supermercado Copacabana',
  storeCode: 'RJ-001',
  collaborator: 'Promotora Exemplo',
  companyTime: '2 anos',
  storeTime: '8 meses',
  channel: 'varejo',
  format: 'super',
  visitDate: '2026-08-17',
};
visit.safety = { epis: true, exitKnown: true, safePhoneUse: true };
for (const requirement of PRESENCE_REQUIREMENTS) {
  const score = requirement.scores.super;
  visit.presence[requirement.id] = {
    shelf: score.shelf > 0 ? requirement.alternatives[0].id : undefined,
    cold: score.cold > 0 ? requirement.alternatives[0].id : undefined,
  };
}
visit.presence['craft-baden-ipa'].shelf = null;
visit.sovi = {
  craft: { worldCm: 100, heinekenCm: 48 },
  premium: { worldCm: 120, heinekenCm: 72 },
  mainstream: { worldCm: 200, heinekenCm: 46 },
};
for (const rule of PLANOGRAM_RULES) visit.planogram[rule.id] = true;
visit.planogram['craft-dark-to-light'] = false;
visit.extraPoints = { total: 12, qualifying: { craft: 1, premium: 2, mainstream: 2 } };
visit.cooler = { inspected: true, correctlyPositioned: false, coldSovi: 52 };
visit.fdsPriceExecution = true;
const priceEntries = priceEntriesFor('varejo');
visit.priceObservations = [
  { id: 'sample-price-1', rulerEntryId: priceEntries[0].id, observed: priceEntries[0].promotional },
  { id: 'sample-price-2', rulerEntryId: priceEntries[1].id, observed: priceEntries[1].regular + 0.11 },
];
let evaluation = evaluateVisit(visit);
const priority = evaluation.prioritizedGaps.find((gap) => gap.severity === 'critical');
if (priority) {
  visit.actions[priority.id] = {
    cause: 'Espaço ocupado por item concorrente, conforme informado pela equipe.',
    action: 'Negociar recomposição do espaço e revisar abastecimento.',
    owner: 'Promotora Exemplo',
    dueDate: '2026-08-20',
  };
}
evaluation = evaluateVisit(visit);
const outputDirectory = resolve(process.cwd(), 'output', 'pdf');
mkdirSync(outputDirectory, { recursive: true });
const outputPath = resolve(outputDirectory, 'visita-em-cena-relatorio-validacao.pdf');
const pdf = buildExecutivePdf(visit, evaluation);
writeFileSync(outputPath, Buffer.from(pdf.output('arraybuffer')));
process.stdout.write(outputPath);
