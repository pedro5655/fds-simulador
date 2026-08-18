import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'green' | 'amber' | 'red' | 'dark';
}) {
  return <section className={`card card--${tone} ${className}`}>{children}</section>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="section-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function BooleanChoice({
  value,
  onChange,
  yes = 'Sim',
  no = 'Não',
}: {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  yes?: string;
  no?: string;
}) {
  return (
    <div className="choice" role="group">
      <button
        type="button"
        className={value === true ? 'choice__button is-positive' : 'choice__button'}
        aria-pressed={value === true}
        onClick={() => onChange(true)}
      >
        {yes}
      </button>
      <button
        type="button"
        className={value === false ? 'choice__button is-negative' : 'choice__button'}
        aria-pressed={value === false}
        onClick={() => onChange(false)}
      >
        {no}
      </button>
      <button
        type="button"
        className={value === null ? 'choice__button is-unknown' : 'choice__button'}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        Não informado
      </button>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  suffix = '',
  caption,
  tone,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  caption: string;
  tone: 'green' | 'amber' | 'blue';
}) {
  return (
    <article className={`metric metric--${tone}`}>
      <span>{label}</span>
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
      <p>{caption}</p>
    </article>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`${Math.round(value)}% concluído`}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
