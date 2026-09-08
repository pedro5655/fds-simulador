import type { Channel, PriceRulerEntry, RuleVersion } from './types';

export const PRICE_RULER_VERSION: RuleVersion = {
  id: 'price-rj-2026.08.2',
  label: 'Régua RJ Agosto/2026',
  status: 'approved',
  effectiveFrom: '2026-08-01',
  notes: [
    'Conforme somente quando o preço observado for exatamente o Regular OU o Promocional.',
    'Um terceiro valor é fora da régua.',
    'A conformidade não alimenta automaticamente os 5 pontos de precificação FDS.',
    'Inclui atualizações SPIN/Praya/NAB e lançamentos Heineken Ultimate (330ml régua 7,29 sem promo e 350ml régua 6,29 sem promo).',
  ],
};

type SourceRow = [
  segment: string,
  brand: string,
  sku: string,
  atacadoRegular: number,
  atacadoPromo: number,
  varejoRegular: number,
  varejoPromo: number,
];

// Transcrição da régua RJ Agosto/2026 fornecida pelo usuário.
const sourceRows: SourceRow[] = [
  // --- CRAFT ---
  ['CRAFT', 'BADEN - BADEN', '600 ML DESC', 14.19, 14.19, 14.99, 14.99],
  ['CRAFT', 'BADEN - BADEN', 'LATA 350', 6.39, 5.59, 6.69, 5.89],
  ['CRAFT', 'BLUE MOON', 'LATA 350', 8.99, 6.99, 9.49, 7.39],
  ['CRAFT', 'BLUE MOON', 'LONG NECK', 10.99, 10.99, 11.59, 11.59],
  ['CRAFT', 'EISENBAHN ESTILOS', 'LATA 350', 5.69, 5.09, 5.99, 5.39],
  ['CRAFT', 'EISENBAHN ESTILOS', 'LONG NECK', 6.79, 6.79, 7.19, 7.19],
  ['CRAFT', 'LAGUNITAS', 'LATA 350', 8.99, 6.99, 9.49, 7.39],
  ['CRAFT', 'LAGUNITAS', 'LONG NECK', 10.99, 10.99, 11.59, 11.59],
  ['CRAFT', 'LAGUNITAS DAY TIME', 'LATA 350', 8.99, 6.99, 9.49, 7.39],
  ['CRAFT', 'LAGUNITAS DAY TIME', 'LONG NECK', 10.99, 10.99, 11.59, 11.59],
  ['CRAFT', 'PRAYA CLASSICA', '600 ML', 17.09, 15.19, 17.99, 15.99],
  ['CRAFT', 'PRAYA CLASSICA', 'LN 355', 10.89, 9.49, 11.49, 9.99],
  ['CRAFT', 'PRAYA CLASSICA', 'LATA 269', 7.39, 6.19, 7.79, 6.49],

  // --- PREMIUM ---
  ['PREMIUM', 'EISENBAHN PILSEN', 'LATA 350', 4.49, 3.89, 4.69, 4.09],
  ['PREMIUM', 'EISENBAHN PILSEN', 'LATA 269', 3.29, 3.09, 3.49, 3.29],
  ['PREMIUM', 'EISENBAHN PILSEN', 'LATA 473', 4.99, 4.99, 5.29, 5.29],
  ['PREMIUM', 'EISENBAHN PILSEN', 'LONG NECK', 5.09, 4.69, 5.39, 4.99],
  ['PREMIUM', 'EISENBAHN UNFILTERED', 'LATA 350', 4.49, 3.89, 4.69, 4.09],
  ['PREMIUM', 'EISENBAHN UNFILTERED', 'LATA 473', 4.99, 4.99, 5.29, 5.29],
  ['PREMIUM', 'EISENBAHN UNFILTERED', 'LONG NECK', 5.09, 4.69, 5.39, 4.99],
  ['PREMIUM', 'HEINEKEN', '600 ML DESC', 13.49, 13.49, 13.49, 13.49],
  ['PREMIUM', 'HEINEKEN', 'DRAUGHT KEG', 113.99, 113.99, 119.99, 119.99],
  ['PREMIUM', 'HEINEKEN', 'LATA 350', 5.79, 5.49, 6.09, 5.79],
  ['PREMIUM', 'HEINEKEN', 'LATA 269', 4.69, 3.99, 4.99, 4.19],
  ['PREMIUM', 'HEINEKEN', 'LATA 473', 6.59, 6.09, 7.29, 6.79],
  ['PREMIUM', 'HEINEKEN', 'LONG NECK', 7.19, 6.89, 7.19, 6.89],
  ['PREMIUM', 'HEINEKEN', 'SHOT', 5.59, 5.29, 5.89, 5.59],
  ['PREMIUM', 'HEINEKEN 0,0', 'LATA 350', 5.79, 5.49, 6.09, 5.79],
  ['PREMIUM', 'HEINEKEN 0,0', 'LATA 269', 4.69, 3.99, 4.99, 4.19],
  ['PREMIUM', 'HEINEKEN 0,0', 'LONG NECK', 7.19, 6.89, 7.19, 6.89],
  ['PREMIUM', 'HEINEKEN SPRITZ', 'LONG NECK', 7.19, 6.89, 7.19, 6.89],
  ['PREMIUM', 'HEINEKEN ULTIMATE', 'LN 330', 7.29, 7.29, 7.29, 7.29],
  ['PREMIUM', 'HEINEKEN ULTIMATE', 'LATA 350', 6.29, 6.29, 6.29, 6.29],
  ['PREMIUM', 'PRAYA LAGER', 'LN 330', 7.09, 6.29, 7.49, 6.99],
  ['PREMIUM', 'PRAYA LAGER', 'LATA 350', 6.19, 5.89, 6.49, 6.29],
  ['PREMIUM', 'PRAYA LAGER', 'LATA 473', 7.59, 6.89, 7.99, 7.49],
  ['PREMIUM', 'SOL PREMIUM', 'LONG NECK', 5.59, 4.99, 5.89, 5.29],
  ['PREMIUM', 'SOL PREMIUM 0,0%', 'LONG NECK', 5.59, 4.99, 5.89, 5.29],

  // --- MAINSTREAM ---
  ['MAINSTREAM', 'AMSTEL', '600 ML DESC', 10.09, 10.09, 10.09, 10.09],
  ['MAINSTREAM', 'AMSTEL', 'LATA 350', 3.99, 3.79, 4.19, 3.99],
  ['MAINSTREAM', 'AMSTEL', 'LATA 269', 3.29, 3.09, 3.49, 3.29],
  ['MAINSTREAM', 'AMSTEL', 'LATA 473', 4.89, 4.69, 5.49, 5.29],
  ['MAINSTREAM', 'AMSTEL', 'LONG NECK', 4.69, 4.49, 4.99, 4.79],
  ['MAINSTREAM', 'AMSTEL ULTRA', 'LATA 269', 4.39, 3.79, 4.59, 3.99],
  ['MAINSTREAM', 'AMSTEL ULTRA', 'LONG NECK', 5.19, 5.19, 5.49, 5.49],
  ['MAINSTREAM', 'DEVASSA', 'LATA 350', 3.29, 3.09, 3.49, 3.29],
  ['MAINSTREAM', 'DEVASSA', 'LATA 269', 2.89, 2.89, 2.99, 2.99],
  ['MAINSTREAM', 'DEVASSA', 'LATA 473', 4.19, 3.99, 4.49, 4.29],
  ['MAINSTREAM', 'TIGER', 'LATA 350', 3.49, 3.29, 3.69, 3.49],
  ['MAINSTREAM', 'TIGER', 'LATA 473', 4.19, 3.99, 4.49, 4.29],

  // --- ECONOMY ---
  ['ECONOMY', 'BAVARIA', 'LATA 350', 2.69, 2.69, 2.89, 2.89],
  ['ECONOMY', 'BAVARIA', 'LATA 473', 3.49, 3.49, 3.69, 3.69],
  ['ECONOMY', 'GLACIAL', 'LATA 350', 2.69, 2.69, 2.89, 2.89],
  ['ECONOMY', 'GLACIAL', 'LATA 473', 3.49, 3.49, 3.69, 3.69],
  ['ECONOMY', 'KAISER', 'LATA 350', 2.89, 2.89, 3.09, 3.09],
  ['ECONOMY', 'KAISER', 'LATA 473', 3.59, 3.59, 3.79, 3.79],
  ['ECONOMY', 'SCHIN', 'LATA 350', 2.89, 2.89, 3.09, 3.09],
  ['ECONOMY', 'SCHIN', 'LATA 269', 2.49, 2.49, 2.59, 2.59],
  ['ECONOMY', 'SCHIN', 'LATA 473', 3.59, 3.59, 3.79, 3.79],

  // --- RTD & BEBIDA MISTA ---
  ['RTD', 'AMSTEL VIBES', 'LATA 269', 5.69, 4.59, 5.99, 4.79],
  ['BEBIDA MISTA', 'SKINKA', 'PET 450ML', 2.99, 2.99, 3.19, 3.19],

  // --- REFRIGERANTE ---
  ['REFRIGERANTE', 'CLASHD', 'LATA 269', 4.59, 3.99, 4.89, 4.29],
  ['REFRIGERANTE', 'FYS', 'LATA 350', 2.79, 2.59, 3.09, 2.69],
  ['REFRIGERANTE', 'FYS 0,0', 'LATA 350', 2.79, 2.59, 3.09, 2.69],
  ['REFRIGERANTE', 'FYS TONICA', 'LATA 350', 3.09, 2.79, 3.39, 3.09],
  ['REFRIGERANTE', 'ITUBAINA', 'LATA 350', 2.89, 2.79, 3.19, 2.89],
  ['REFRIGERANTE', 'ITUBAINA', 'LONG NECK', 3.59, 3.59, 3.99, 3.99],
  ['REFRIGERANTE', 'ITUBAINA', 'PET 500ML', 3.59, 3.59, 3.99, 3.99],

  // --- NAB & SPIN ---
  ['NAB', 'BAER-MATE', 'LN 350', 9.49, 8.49, 9.99, 8.99],
  ['NAB', 'BAER-MATE', 'LATINHA 269', 8.49, 7.49, 8.99, 7.99],
  ['NAB', 'MATCHA', 'LN 350', 11.39, 11.39, 11.99, 11.99],
  ['NAB', 'MAMBA COM GAS', 'LATA 350', 4.39, 3.89, 4.59, 4.09],
  ['NAB', 'MAMBA SEM GAS', 'LATA 350', 4.09, 3.89, 4.29, 4.09],
  ['NAB', 'MAMBA PROTEIN', 'LATA 350', 11.39, 9.99, 11.99, 10.99],
];

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function entry(
  row: SourceRow,
  channel: Channel,
): PriceRulerEntry {
  const [segment, brand, sku, atacadoRegular, atacadoPromo, varejoRegular, varejoPromo] = row;
  const isAtacado = channel === 'atacado';
  return {
    id: `${channel}-rj-${slug(brand)}-${slug(sku)}`,
    channel,
    uf: 'RJ',
    segment,
    brand,
    sku,
    regular: isAtacado ? atacadoRegular : varejoRegular,
    promotional: isAtacado ? atacadoPromo : varejoPromo,
    validFrom: '2026-08-01',
    validTo: '2026-08-31',
  };
}

export const PRICE_RULER_ENTRIES: PriceRulerEntry[] = sourceRows.flatMap((row) => [
  entry(row, 'atacado'),
  entry(row, 'varejo'),
]);

export function priceEntriesFor(channel: Channel, uf = 'RJ'): PriceRulerEntry[] {
  return PRICE_RULER_ENTRIES.filter((item) => item.channel === channel && item.uf === uf);
}
