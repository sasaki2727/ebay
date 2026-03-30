import type { JudgmentType } from '@/types';

interface Props {
  judgment: JudgmentType;
  size?: 'sm' | 'lg';
}

const CONFIG: Record<
  JudgmentType,
  { label: string; subLabel: string; bg: string; border: string; text: string; icon: string }
> = {
  GO: {
    label: 'GO',
    subLabel: '仕入れ推奨',
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
    icon: '✅',
  },
  CAUTION: {
    label: 'CAUTION',
    subLabel: '慎重に検討',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    icon: '⚠️',
  },
  NO_GO: {
    label: 'NO GO',
    subLabel: '仕入れ非推奨',
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
    icon: '🚫',
  },
  NEED_MORE_INFO: {
    label: 'NEED MORE INFO',
    subLabel: '情報不足',
    bg: 'bg-gray-50',
    border: 'border-gray-400',
    text: 'text-gray-600',
    icon: '❓',
  },
};

export default function JudgmentBadge({ judgment, size = 'lg' }: Props) {
  const c = CONFIG[judgment];

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold
          ${c.bg} ${c.border} ${c.text}`}
      >
        {c.icon} {c.label}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-5
        ${c.bg} ${c.border}`}
    >
      <span className="text-4xl">{c.icon}</span>
      <div>
        <p className={`text-3xl font-black tracking-wide ${c.text}`}>{c.label}</p>
        <p className={`text-sm font-medium ${c.text} opacity-80`}>{c.subLabel}</p>
      </div>
    </div>
  );
}
