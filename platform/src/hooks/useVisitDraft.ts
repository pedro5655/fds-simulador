import { useEffect, useState } from 'react';
import { createEmptyVisit, parseVisitDraft } from '@/domain/visit';
import type { VisitDraft } from '@/domain/rules/types';

const STORAGE_KEY = 'visita-em-cena:draft:v2';

function loadVisit(): VisitDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseVisitDraft(raw) ?? createEmptyVisit();
  } catch {
    return createEmptyVisit();
  }
}

export function useVisitDraft() {
  const [visit, setVisit] = useState<VisitDraft>(loadVisit);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...visit, updatedAt: new Date().toISOString() }),
    );
  }, [visit]);

  const reset = () => {
    const next = createEmptyVisit();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setVisit(next);
  };

  return { visit, setVisit, reset };
}
