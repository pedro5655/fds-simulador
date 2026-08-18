import type {
  ExtraPointBand,
  PlacementScore,
  PlanogramRule,
  PresenceAlternative,
  PresenceRequirement,
  RuleVersion,
  SoviRule,
  StoreFormat,
} from './types';

export const RULESET_VERSION: RuleVersion = {
  id: 'fds-rj-2026.08-provisional.1',
  label: 'FDS RJ Agosto/2026 - provisória',
  status: 'provisional',
  effectiveFrom: '2026-08-01',
  notes: [
    'Aguardando homologação final da matriz oficial.',
    'Presença usa a matriz legada que fecha 40 pontos por formato.',
    'Planograma, SOVI e pontos extras usam cálculo binário provisório.',
    'A faixa superior de pontos extras começa em 21, por continuidade configurável.',
    'Preço FDS não é derivado da conformidade da régua.',
  ],
};

const alt = (id: string, label: string): PresenceAlternative => ({ id, label });

const scores = (
  hiperShelf: number,
  hiperCold: number,
  superShelf: number,
  superCold: number,
  miniShelf: number,
  miniCold: number,
  atacadoShelf: number,
  atacadoCold: number,
): Record<StoreFormat, PlacementScore> => ({
  hiper: { shelf: hiperShelf, cold: hiperCold },
  super: { shelf: superShelf, cold: superCold },
  mini: { shelf: miniShelf, cold: miniCold },
  atacado: { shelf: atacadoShelf, cold: atacadoCold },
});

const A = {
  badenIpaCan: alt('baden-ipa-can-350', 'Baden Baden IPA lata 350 ml'),
  badenIpaBottle: alt('baden-ipa-bottle-600', 'Baden Baden IPA vidro 600 ml'),
  badenWitCan: alt('baden-wit-can-350', 'Baden Baden Witbier lata 350 ml'),
  badenWitBottle: alt('baden-wit-bottle-600', 'Baden Baden Witbier vidro 600 ml'),
  badenCrystalCan: alt('baden-crystal-can-350', 'Baden Baden Cristal lata 350 ml'),
  badenCrystalBottle: alt('baden-crystal-bottle-600', 'Baden Baden Cristal vidro 600 ml'),
  blueMoonCan: alt('blue-moon-can-350', 'Blue Moon lata 350 ml'),
  blueMoonBottle: alt('blue-moon-bottle-355', 'Blue Moon vidro 355 ml'),
  eisenIpaCan: alt('eisen-ipa-can-350', 'Eisenbahn IPA lata 350 ml'),
  eisenIpaBottle: alt('eisen-ipa-bottle-355', 'Eisenbahn IPA vidro 355 ml'),
  eisenPaleCan: alt('eisen-pale-can-350', 'Eisenbahn Pale Ale lata 350 ml'),
  eisenPaleBottle: alt('eisen-pale-bottle-355', 'Eisenbahn Pale Ale vidro 355 ml'),
  eisenWeizen: alt('eisen-weizen-bottle-355', 'Eisenbahn Weizenbier vidro 355 ml'),
  lagunitasCan: alt('lagunitas-ipa-can-350', 'Lagunitas IPA lata 350 ml'),
  lagunitasBottle: alt('lagunitas-ipa-bottle-355', 'Lagunitas IPA vidro 355 ml'),
  prayaClassic355: alt('praya-classic-bottle-355', 'Praya Clássica vidro 355 ml'),
  prayaClassic600: alt('praya-classic-bottle-600', 'Praya Clássica vidro 600 ml'),
  eisenPilsen355: alt('eisen-pilsen-bottle-355', 'Eisenbahn Pilsen vidro 355 ml'),
  eisenUnfiltered355: alt('eisen-unfiltered-bottle-355', 'Eisenbahn Unfiltered vidro 355 ml'),
  hnk350: alt('hnk-can-350', 'Heineken lata 350 ml'),
  hnk250: alt('hnk-bottle-250', 'Heineken vidro 250 ml'),
  hnk269: alt('hnk-can-269', 'Heineken lata 269 ml'),
  hnk330: alt('hnk-bottle-330', 'Heineken vidro 330 ml'),
  hnk473: alt('hnk-can-473', 'Heineken lata 473 ml'),
  hnkZero350: alt('hnk-zero-can-350', 'Heineken 0.0 lata 350 ml'),
  hnkZero269: alt('hnk-zero-can-269', 'Heineken 0.0 lata 269 ml'),
  hnkZero330: alt('hnk-zero-bottle-330', 'Heineken 0.0 vidro 330 ml'),
  prayaLagerBottle: alt('praya-lager-bottle-330', 'Praya Lager long neck 330 ml'),
  prayaLagerCan: alt('praya-lager-can-350', 'Praya Lager lata 350 ml'),
  sol: alt('sol-bottle-330', 'Sol Premium vidro 330 ml'),
  solZero: alt('sol-zero-bottle-330', 'Sol 0.0 vidro 330 ml'),
  amstelUltraCan: alt('amstel-ultra-can-269', 'Amstel Ultra lata 269 ml'),
  amstelUltraBottle: alt('amstel-ultra-bottle-275', 'Amstel Ultra vidro 275 ml'),
  eisenPilsen473: alt('eisen-pilsen-can-473', 'Eisenbahn Pilsen lata 473 ml'),
  eisenUnfiltered350: alt('eisen-unfiltered-can-350', 'Eisenbahn Unfiltered lata 350 ml'),
  eisenPilsen350: alt('eisen-pilsen-can-350', 'Eisenbahn Pilsen lata 350 ml'),
  amstel269: alt('amstel-can-269', 'Amstel lata 269 ml'),
  amstel350: alt('amstel-can-350', 'Amstel lata 350 ml'),
  amstel473: alt('amstel-can-473', 'Amstel lata 473 ml'),
  amstelBottle: alt('amstel-bottle-355', 'Amstel vidro 355 ml'),
  fys: alt('fys-flavours-can-350', 'FYS sabores regular/zero lata 350 ml'),
  fysTonic: alt('fys-tonic-can-350', 'FYS Tônica regular/zero lata 350 ml'),
};

export const PRESENCE_REQUIREMENTS: PresenceRequirement[] = [
  { id: 'craft-baden-ipa', label: 'Baden Baden IPA lata 350 OU vidro 600', segment: 'craft', alternatives: [A.badenIpaCan, A.badenIpaBottle], scores: scores(1, .5, .5, .5, 0, 0, 0, 0) },
  { id: 'craft-baden-styles', label: 'Baden Baden estilos IPA/Witbier', segment: 'craft', alternatives: [A.badenIpaCan, A.badenIpaBottle, A.badenWitCan, A.badenWitBottle], scores: scores(0, 0, 0, 0, 3, .5, 3, 0) },
  { id: 'craft-baden-crystal', label: 'Baden Baden Cristal lata 350 OU vidro 600', segment: 'craft', alternatives: [A.badenCrystalCan, A.badenCrystalBottle], scores: scores(1, .5, .5, .5, 3, 1, 3, 0) },
  { id: 'craft-baden-witbier', label: 'Baden Baden Witbier lata 350 OU vidro 600', segment: 'craft', alternatives: [A.badenWitCan, A.badenWitBottle], scores: scores(1, .5, .5, .5, 0, 0, 0, 0) },
  { id: 'craft-blue-moon', label: 'Blue Moon lata 350 OU vidro 355', segment: 'craft', alternatives: [A.blueMoonCan, A.blueMoonBottle], scores: scores(.5, .5, .5, .5, 1.5, .5, 1, 0) },
  { id: 'craft-eisen-ipa', label: 'Eisenbahn IPA lata 350 OU vidro 355', segment: 'craft', alternatives: [A.eisenIpaCan, A.eisenIpaBottle], scores: scores(1, .5, .5, .5, 0, 0, 0, 0) },
  { id: 'craft-eisen-styles', label: 'Eisenbahn estilos IPA/Pale Ale/Weizen', segment: 'craft', alternatives: [A.eisenIpaCan, A.eisenIpaBottle, A.eisenPaleCan, A.eisenPaleBottle, A.eisenWeizen], scores: scores(0, 0, 0, 0, 2, 1, 2.5, 0) },
  { id: 'craft-eisen-pale', label: 'Eisenbahn Pale Ale lata 350 OU vidro 355', segment: 'craft', alternatives: [A.eisenPaleCan, A.eisenPaleBottle], scores: scores(1, 1, .5, 1, 0, 0, 0, 0) },
  { id: 'craft-eisen-weizen', label: 'Eisenbahn Weizenbier vidro 355', segment: 'craft', alternatives: [A.eisenWeizen], scores: scores(1, .5, 1, .5, 0, 0, 0, 0) },
  { id: 'craft-lagunitas', label: 'Lagunitas IPA lata 350 OU vidro 355', segment: 'craft', alternatives: [A.lagunitasCan, A.lagunitasBottle], scores: scores(.5, .5, .5, .5, 1.5, .5, 1, 0) },
  { id: 'craft-praya-classic', label: 'Praya Clássica 355 OU 600', segment: 'craft', alternatives: [A.prayaClassic355, A.prayaClassic600], scores: scores(.5, .5, .5, 0, 0, 0, 0, 0) },
  { id: 'premium-eisen-bottle', label: 'Eisenbahn Pilsen OU Unfiltered vidro 355', segment: 'premium', alternatives: [A.eisenPilsen355, A.eisenUnfiltered355], scores: scores(1.5, .5, 1.5, .5, 1.5, .5, 2.5, 0) },
  { id: 'premium-hnk-350', label: 'Heineken lata 350', segment: 'premium', alternatives: [A.hnk350], scores: scores(1.5, 1, 2, 1, 0, 0, 3, 0) },
  { id: 'premium-hnk-small', label: 'Heineken vidro 250 OU lata 269', segment: 'premium', alternatives: [A.hnk250, A.hnk269], scores: scores(1.5, 1, 2, 1, 0, 0, 3, 0) },
  { id: 'premium-hnk-330', label: 'Heineken vidro 330', segment: 'premium', alternatives: [A.hnk330], scores: scores(1.5, 1, 2, 1, 3, 1, 3, 0) },
  { id: 'premium-hnk-zero-can', label: 'Heineken 0.0 lata 350 OU 269', segment: 'premium', alternatives: [A.hnkZero350, A.hnkZero269], scores: scores(1.5, .5, 1.5, .5, 2.5, 1, 2.5, 0) },
  { id: 'premium-hnk-zero-330', label: 'Heineken 0.0 vidro 330', segment: 'premium', alternatives: [A.hnkZero330], scores: scores(1.5, .5, 1.5, 1, 2.5, 1, 2.5, 0) },
  { id: 'premium-praya-lager', label: 'Praya Lager long neck 330 OU lata 350', segment: 'premium', alternatives: [A.prayaLagerBottle, A.prayaLagerCan], scores: scores(.5, .5, .5, .5, .5, .5, 1, 0) },
  { id: 'premium-sol', label: 'Sol Premium OU Sol 0.0 long neck', segment: 'premium', alternatives: [A.sol, A.solZero], scores: scores(.5, .5, .5, .5, .5, .5, .5, 0) },
  { id: 'premium-amstel-ultra', label: 'Amstel Ultra lata 269 OU vidro 275', segment: 'premium', alternatives: [A.amstelUltraCan, A.amstelUltraBottle], scores: scores(.5, .5, .5, .5, 0, 0, .5, 0) },
  { id: 'premium-eisen-large-can', label: 'Eisenbahn Pilsen 473 OU Unfiltered 350', segment: 'premium', alternatives: [A.eisenPilsen473, A.eisenUnfiltered350], scores: scores(1.5, .5, 1.5, .5, 1.5, .5, 2.5, 0) },
  { id: 'premium-eisen-350', label: 'Eisenbahn Pilsen 350 OU Unfiltered 350', segment: 'premium', alternatives: [A.eisenPilsen350, A.eisenUnfiltered350], scores: scores(0, 0, 1.5, 0, 0, 0, 0, 0) },
  { id: 'premium-hnk-473', label: 'Heineken lata 473', segment: 'premium', alternatives: [A.hnk473], scores: scores(1.5, 1, 2, 1, 3, 1, 3, 0) },
  { id: 'main-amstel-269', label: 'Amstel lata 269', segment: 'mainstream', alternatives: [A.amstel269], scores: scores(0, 0, 0, 0, 0, 0, 0, 0) },
  { id: 'main-amstel-350', label: 'Amstel lata 350', segment: 'mainstream', alternatives: [A.amstel350], scores: scores(1, .5, 1, .5, 0, 0, 0, 0) },
  { id: 'main-amstel-473', label: 'Amstel lata 473', segment: 'mainstream', alternatives: [A.amstel473], scores: scores(.5, .5, .5, .5, 0, 0, 0, 0) },
  { id: 'main-amstel-any-can', label: 'Amstel lata 269 OU 350 OU 473', segment: 'mainstream', alternatives: [A.amstel269, A.amstel350, A.amstel473], scores: scores(.5, .5, 0, 0, 1.5, 1, 4.5, 0) },
  { id: 'main-amstel-bottle', label: 'Amstel vidro 355', segment: 'mainstream', alternatives: [A.amstelBottle], scores: scores(.5, .5, .5, .5, 0, 0, 0, 0) },
  { id: 'nab-fys-flavours', label: 'FYS sabores/variações, exceto Tônica', segment: 'nab', alternatives: [A.fys], scores: scores(.5, .5, .5, .5, .5, .5, .5, 0) },
  { id: 'nab-fys-tonic', label: 'FYS Tônica regular OU zero lata 350', segment: 'nab', alternatives: [A.fysTonic], scores: scores(.5, .5, .5, .5, .5, .5, .5, 0) },
];

export const SOVI_RULES: SoviRule[] = [
  { segment: 'craft', label: 'Craft', target: 53, points: 8 },
  { segment: 'premium', label: 'Premium', target: 57, points: 9 },
  { segment: 'mainstream', label: 'Mainstream', target: 25, points: 8 },
];

export const PLANOGRAM_RULES: PlanogramRule[] = [
  { id: 'craft-dark-to-light', segment: 'craft', label: 'Estilos do mais escuro para o mais claro', points: 1 },
  { id: 'craft-praya-first', segment: 'craft', label: 'Praya Clássica abre Craft ou vem antes de Baden Baden', points: 1 },
  { id: 'craft-lagunitas-blue', segment: 'craft', label: 'Lagunitas e Blue Moon após Baden Baden', points: .5 },
  { id: 'craft-eisen-last', segment: 'craft', label: 'Eisenbahn Estilos fecha o segmento Craft', points: .5 },
  { id: 'premium-praya-sol', segment: 'premium', label: 'Praya Lager ou Sol ao lado de Corona', points: 1 },
  { id: 'premium-hnk-spaten', segment: 'premium', label: 'Nenhuma marca separa Heineken e Spaten', points: 1 },
  { id: 'premium-order', segment: 'premium', label: 'Portfólio Premium segue o planograma', points: 1 },
  { id: 'premium-70-30', segment: 'premium', label: 'Premium respeita 70% packs / 30% unidades', points: .5 },
  { id: 'lono-amstel-ultra', segment: 'premium', label: 'Amstel Ultra ao lado de Michelob ou Stella Pure Gold', points: .5 },
  { id: 'lono-hnk-zero', segment: 'premium', label: 'Heineken 0.0 abre zero álcool ou duplica com regular', points: .5 },
  { id: 'lono-applied', segment: 'premium', label: 'LONO aplicado conforme planograma (informativo)', points: 0 },
  { id: 'main-order', segment: 'mainstream', label: 'Amstel segue a ordem do planograma', points: 1 },
  { id: 'main-70-30', segment: 'mainstream', label: 'Mainstream respeita 70% packs / 30% unidades', points: .5 },
  { id: 'nab-tonic', segment: 'nab', label: 'FYS Tônica próxima às tônicas concorrentes', points: .5 },
  { id: 'nab-flavours', segment: 'nab', label: 'FYS sabores próximo a refrigerantes equivalentes', points: .5 },
];

export const EXTRA_POINT_BANDS: ExtraPointBand[] = [
  { id: 'pe-0-5', min: 0, max: 5, targets: { craft: 0, premium: 1, mainstream: 1 } },
  { id: 'pe-6-10', min: 6, max: 10, targets: { craft: 1, premium: 2, mainstream: 1 } },
  { id: 'pe-11-15', min: 11, max: 15, targets: { craft: 1, premium: 3, mainstream: 2 } },
  { id: 'pe-16-20', min: 16, max: 20, targets: { craft: 1, premium: 5, mainstream: 2 } },
  { id: 'pe-21-plus', min: 21, max: null, targets: { craft: 1, premium: 6, mainstream: 3 } },
];

export const EXTRA_POINT_WEIGHTS: Record<'craft' | 'premium' | 'mainstream', number> = {
  craft: 6,
  premium: 8,
  mainstream: 6,
};

export const EXTRA_POINT_MIN_PACKS = { craft: 5, premium: 20, mainstream: 20 } as const;

export function applicablePresenceRequirements(format: StoreFormat): PresenceRequirement[] {
  return PRESENCE_REQUIREMENTS.filter((requirement) => {
    const score = requirement.scores[format];
    return score.shelf > 0 || score.cold > 0;
  });
}
