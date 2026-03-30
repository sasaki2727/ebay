'use client';

import type { PurchaseCondition } from '@/types';

interface Props {
  value: PurchaseCondition;
  onChange: (value: PurchaseCondition) => void;
}

interface FieldConfig {
  key: keyof PurchaseCondition;
  label: string;
  unit: '円' | '%';
  step: number;
  placeholder: string;
  hint?: string;
  highlight?: boolean; // 重要フィールドのハイライト
}

const FIELDS: FieldConfig[] = [
  {
    key: 'purchasePrice',
    label: '仕入れ価格',
    unit: '円',
    step: 100,
    placeholder: '0',
    highlight: true,
  },
  {
    key: 'domesticShipping',
    label: '国内送料',
    unit: '円',
    step: 10,
    placeholder: '500',
    hint: '店舗 → 自宅',
  },
  {
    key: 'packagingCost',
    label: '梱包費',
    unit: '円',
    step: 10,
    placeholder: '200',
    hint: '資材・テープ等',
  },
  {
    key: 'internationalShipping',
    label: '国際送料',
    unit: '円',
    step: 100,
    placeholder: '2000',
    hint: '日本 → 海外',
    highlight: true,
  },
  {
    key: 'ebayFeeRate',
    label: 'eBay手数料率',
    unit: '%',
    step: 0.5,
    placeholder: '13',
    hint: '通常 13%前後',
  },
  {
    key: 'paymentFeeRate',
    label: '決済手数料率',
    unit: '%',
    step: 0.5,
    placeholder: '3',
    hint: 'Payoneer等',
  },
  {
    key: 'fxBuffer',
    label: '為替バッファ',
    unit: '%',
    step: 0.5,
    placeholder: '3',
    hint: '為替変動リスク',
  },
  {
    key: 'riskDeduction',
    label: 'リスク控除',
    unit: '円',
    step: 100,
    placeholder: '0',
    hint: '返品・クレーム',
  },
];

export default function PurchaseConditionForm({ value, onChange }: Props) {
  const update = (key: keyof PurchaseCondition, raw: string) => {
    const num = parseFloat(raw);
    onChange({ ...value, [key]: isNaN(num) ? 0 : num });
  };

  return (
    <div className="space-y-2">
      {FIELDS.map((field) => (
        <div key={field.key} className="flex items-center gap-2">
          {/* ラベル */}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${field.highlight ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
            >
              {field.label}
            </span>
            {field.hint && (
              <span className="text-xs text-gray-400 ml-1">({field.hint})</span>
            )}
          </div>

          {/* 入力 */}
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              value={value[field.key] === 0 ? '' : value[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              min={0}
              step={field.step}
              placeholder={field.placeholder}
              className={`w-24 border rounded-lg px-2 py-1.5 text-sm text-right
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${field.highlight ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}
            />
            <span className="text-xs text-gray-500 w-4 text-left">{field.unit}</span>
          </div>
        </div>
      ))}

      {/* デフォルト値に戻すボタン */}
      <button
        type="button"
        onClick={() =>
          onChange({
            purchasePrice: value.purchasePrice, // 仕入れ価格はそのまま
            domesticShipping: 500,
            packagingCost: 200,
            ebayFeeRate: 13,
            paymentFeeRate: 3,
            internationalShipping: 2000,
            fxBuffer: 3,
            riskDeduction: 0,
          })
        }
        className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
      >
        手数料・送料をデフォルト値に戻す
      </button>
    </div>
  );
}
