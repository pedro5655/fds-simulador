import { QuizItem, SoviTarget, BrandSovi } from './types';
import { Shield, ClipboardList, Target, Eye, AlertTriangle } from 'lucide-react';
import React from 'react';

// --- Company Data ---
export const COMPANY_DATA = {
  values: ["Respeito e Cuidado", "Paixão", "Diversão", "Coragem"],
  behaviors: ["Moldar", "Conectar", "Desenvolver", "Entregar"],
  purpose: "Criar momentos de verdadeira união para inspirar um mundo melhor.",
  mission: "Nossa estrela em cada coração e em cada copo brasileiro."
};

// --- Safety Data ---
export const SAFETY_ATTITUDES = [
  { id: 1, title: "Organize sua Rotina", desc: "Planejamento evita pressa e riscos." },
  { id: 2, title: "Use 100% dos EPIs", desc: "Bota, luvas e óculos. Sem adornos (anéis, colares)." },
  { id: 3, title: "Identifique Riscos", desc: "Comunique responsáveis. Prateleiras seguras, elétrica ok." },
  { id: 4, title: "Equipamentos da Loja", desc: "Escadas em dia. Paleteiras conservadas." },
  { id: 5, title: "Avarias de Produtos", desc: "Cuidado com cortes e piso molhado." },
  { id: 6, title: "Empilhadeiras", desc: "Distância mínima de 5m. Nunca subir nos garfos." },
  { id: 7, title: "Sem Celular na Loja", desc: "Use apenas o corporativo parado em local seguro." },
  { id: 8, title: "Nunca Improvise", desc: "Não use caixas/mesas como escada." },
  { id: 9, title: "Saídas de Emergência", desc: "Conheça a rota de fuga." },
  { id: 10, title: "Segurança no Trânsito", desc: "Respeite sinalizações dentro e fora da loja." },
];

// --- Routine Data ---
export const ROUTINE_STEPS = [
  "Registre sua entrada (Check-in)",
  "Faça-se Presente (Cumprimente a equipe)",
  "Organize a Gôndola (Espaço primário)",
  "Verifique as demais áreas da loja",
  "Prepare o abastecimento (Estoque organizado)",
  "Faça o abastecimento (PEPS)",
  "Confira Preços (Tudo precificado)",
  "Aplique o Merchandising",
  "Conquiste Novos Espaços",
  "Realize atividades no App Execução",
  "Fechamento da Visita e Valorização"
];

export const VISIT_SCRIPT_STEPS = [
  { step: "01", title: "Apresentação", desc: "Bom dia/tarde. Meu nome é Fulano, tenho X anos de companhia e atendo esta loja há Y anos." },
  { step: "02", title: "Segurança", desc: "Sinalize as saídas de emergência e mostre os EPIs (bota, luvas, etc)." },
  { step: "03", title: "Setor CRAFT", desc: "Fale o % de SOVI da categoria e dados das marcas individualmente." },
  { step: "04", title: "Premium/Main/NAB", desc: "Mostre o SOVI total em loja e a evolução no último mês. Valorize seu progresso." },
  { step: "05", title: "Pontos Extras", desc: "Mostre o total de P.E. e metas: 3 Premium, 2 Mainstream, 1 Craft." },
  { step: "06", title: "Reporte de Risco", desc: "Mostre como reportar no app. Se não resolver, continue reportando." },
  { step: "07", title: "Rotina (11 Passos)", desc: "Explique sua rotina. Mostre o Book da FDS na Biblioteca do Involves." },
  { step: "08", title: "Packs para P.E.", desc: "Regra: 20 packs para Premium/Mainstream e 5 packs para Craft." },
  { step: "09", title: "Fechamento", desc: "Mostre as geladeiras, o SOVI dentro delas e agradeça a visita." }
];

// --- Scoring Data ---
export const PILLARS_SCORE = [
  { name: 'Presença', points: 40, icon: <ClipboardList />, color: 'bg-green-600', desc: "Produtos Obrigatórios" },
  { name: 'Posicionamento', points: 35, icon: <Target />, color: 'bg-green-500', desc: "Onde e como expor" },
  { name: 'Visibilidade', points: 20, icon: <Eye />, color: 'bg-lime-500', desc: "Promoção e Pontos Extras" },
  { name: 'Precificação', points: 5, icon: <AlertTriangle />, color: 'bg-yellow-500', desc: "Sinalização de preço" },
];

// --- SOVI Data ---
export const SOVI_CRAFT_DATA: SoviTarget[] = [
  { name: 'Nossas Marcas', value: 53, fill: '#008200' },
  { name: 'Concorrência', value: 47, fill: '#C3C3C3' },
];

export const SOVI_PREMIUM_DATA: SoviTarget[] = [
  { name: 'Nossas Marcas', value: 57, fill: '#008200' },
  { name: 'Concorrência', value: 43, fill: '#C3C3C3' },
];

export const SOVI_MAINSTREAM_DATA: SoviTarget[] = [
  { name: 'Nossas Marcas', value: 25, fill: '#008200' },
  { name: 'Concorrência', value: 75, fill: '#C3C3C3' },
];

export const BRAND_TARGETS: BrandSovi[] = [
  { brand: 'Baden Baden', target: '30% (Craft)' },
  { brand: 'Heineken', target: '30% (Premium)' },
  { brand: 'Heineken 0.0', target: '5% (Premium)' },
  { brand: 'Amstel', target: '25% (Mainstream)' },
  { brand: 'Eisenbahn Estilos', target: '13% (Craft)' },
  { brand: 'Eisenbahn Pilsen', target: '7% (Premium)' },
];

// --- Quiz/Audit Data ---
export const AUDIT_QUESTIONS: QuizItem[] = [
  {
    category: 'Institucional',
    question: "Quais são os valores da companhia?",
    answer: "Respeito e cuidado, Paixão, Diversão e Coragem."
  },
  {
    category: 'Institucional',
    question: "Quais são os 4 pilares de comportamento?",
    answer: "Moldar, Conectar, Desenvolver e Entregar."
  },
  {
    category: 'Institucional',
    question: "Qual o propósito da Heineken?",
    answer: "Criar momentos de verdadeira união para inspirar um mundo melhor."
  },
  {
    category: 'Institucional',
    question: "Qual a missão da Heineken?",
    answer: "Nossa estrela em cada coração e em cada copo brasileiro."
  },
  {
    category: 'SOVI',
    question: "O que a CIA pede de cabeça sobre SOVI?",
    answer: "Saber o SOVI de cada categoria atual da loja (Craft 53%, Premium 57%, Mainstream 25%) e ter anotado o SOVI de cada marca."
  },
  {
    category: 'Rotina',
    question: "Como funciona a dinâmica com supervisor e coaching?",
    answer: "Visita semanal do supervisor, Reunião Mensal e Coaching 1x ao mês (treinamento na rotina com feedback)."
  },
  {
    category: 'Rotina',
    question: "Você sabe como alterar o roteiro de lojas?",
    answer: "Sim, é possível alterar através do Involves."
  },
  {
    category: 'Segurança',
    question: "O que fazer se o risco reportado não for resolvido?",
    answer: "Continue fazendo o reporte no app enquanto o risco existir e comunique os gestores."
  },
  {
    category: 'Visibilidade',
    question: "Quantos packs para considerar Ponto Extra?",
    answer: "20 packs para Premium e Mainstream, e 5 packs para Craft."
  },
  {
    category: 'Visibilidade',
    question: "Quais as metas de Pontos Extras?",
    answer: "3 pontos de Premium, 2 de Mainstream e 1 de Craft."
  },
  {
    category: 'Geral',
    question: "Onde consultar o Book da FDS?",
    answer: "Na Biblioteca do App Involves."
  },
  {
    category: 'Geral',
    question: "Sobre as LIVES do canal OFF?",
    answer: "Link enviado pelo supervisor ou na biblioteca. Liberado mais cedo para assistir em local tranquilo."
  }
];