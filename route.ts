'use client';

import type { ProductInfo, Condition } from '@/types';
import { CONDITION_LABELS } from '@/types';

interface Props {
  value: ProductInfo;
  onChange: (value: ProductInfo) => void;
}

const CONDITIONS = (Object.entries(CONDITION_LABELS) as [Condition, string][]).map(
  ([value, label]) => ({ value, label })
);

export default function ProductForm({ value, onChange }: Props) {
  const update = <K extends keyof ProductInfo>(field: K, val: ProductInfo[K]) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-3">
      {/* ブランド + 型番 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            ブランド
          </label>
          <input
            type="text"
            value={value.brand}
            onChange={(e) => update('brand', e.target.value)}
            placeholder="例: Apple, Sony, SEIKO"
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            型番
          </label>
          <input
            type="text"
            value={value.modelNumber}
            onChange={(e) => update('modelNumber', e.target.value)}
            placeholder="例: MGTF3J/A"
            className="input-base"
          />
        </div>
      </div>

      {/* 商品名 */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          商品名 <span className="text-red-500 normal-case font-normal">（必須）</span>
        </label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="例: iPhone 13 Pro 256GB グラファイト"
          className="input-base"
        />
      </div>

      {/* 状態 */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          状態
        </label>
        <select
          value={value.condition}
          onChange={(e) => update('condition', e.target.value as Condition)}
          className="input-base bg-white"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* 付属品 */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          付属品
        </label>
        <input
          type="text"
          value={value.accessories}
          onChange={(e) => update('accessories', e.target.value)}
          placeholder="例: 充電ケーブル, ACアダプター, 説明書"
          className="input-base"
        />
      </div>

      {/* 元箱 + メモ */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.hasBox}
            onChange={(e) => update('hasBox', e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <span className="text-sm text-gray-700">元箱あり</span>
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          メモ・特記事項
        </label>
        <textarea
          value={value.memo}
          onChange={(e) => update('memo', e.target.value)}
          placeholder="傷・汚れの状態、注意点など"
          rows={2}
          className="input-base resize-none"
        />
      </div>
    </div>
  );
}
