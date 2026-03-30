import type { ProfitCalculation, JudgmentResult } from '@/types';
import { formatJPY, formatPercent } from '@/lib/profit-calculator';
import JudgmentBadge from './JudgmentBadge';

interface Props {
  calc: ProfitCalculation;
  judgment: JudgmentResult;
}

const BREAKDOWN_ROWS: {
  key: keyof ProfitCalculation['breakdown'];
  label: string;
  type: 'fixed' | 'variable';
}[] = [
  { key: 'purchasePrice', label: '仕入れ価格', type: 'fixed' },
  { key: 'domesticShipping', label: '国内送料', type: 'fixed' },
  { key: 'packagingCost', label: '梱包費', type: 'fixed' },
  { key: 'internationalShipping', label: '国際送料', type: 'fixed' },
  { key: 'riskDeduction', label: 'リスク控除', type: 'fixed' },
  { key: 'ebayFee', label: 'eBay手数料', type: 'variable' },
  { key: 'paymentFee', label: '決済手数料', type: 'variable' },
  { key: 'fxBufferAmount', label: '為替バッファ', type: 'variable' },
];

export default function ProfitResultPanel({ calc, judgment }: Props) {
  const isProfitable = calc.profit >= 0;

  return (
    <div className="space-y-4">
      {/* 判定バッジ */}
      <JudgmentBadge judgment={judgment.judgment} />

      {/* サマリー指標 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 利益額 */}
        <div
          className={`rounded-xl p-3 text-center border
            ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          <p className="text-xs text-gray-500 mb-0.5">利益額</p>
          <p
            className={`text-xl font-black ${isProfitable ? 'text-green-700' : 'text-red-700'}`}
          >
            {formatJPY(calc.profit)}
          </p>
        </div>

        {/* 利益率 */}
        <div
          className={`rounded-xl p-3 text-center border
            ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          <p className="text-xs text-gray-500 mb-0.5">利益率</p>
          <p
            className={`text-xl font-black ${isProfitable ? 'text-green-700' : 'text-red-700'}`}
          >
            {formatPercent(calc.profitRate)}
          </p>
        </div>

        {/* 総コスト */}
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
          <p className="text-xs text-gray-500 mb-0.5">総コスト</p>
          <p className="text-xl font-black text-gray-700">{formatJPY(calc.totalCost)}</p>
        </div>
      </div>

      {/* 判定理由 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          判定理由
        </p>
        {judgment.reasons.map((reason, i) => (
          <div key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="text-gray-400 shrink-0">•</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* 警告 */}
      {judgment.warnings.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
            ⚠️ 注意事項
          </p>
          {judgment.warnings.map((w, i) => (
            <div key={i} className="flex gap-2 text-sm text-amber-800">
              <span className="shrink-0">•</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* コスト内訳テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            コスト内訳
          </p>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {/* 固定費 */}
            <tr className="bg-gray-50/50">
              <td colSpan={3} className="px-4 py-1.5 text-xs text-gray-400 font-medium">
                固定費
              </td>
            </tr>
            {BREAKDOWN_ROWS.filter((r) => r.type === 'fixed').map((row) => (
              <tr key={row.key} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="pl-6 pr-2 py-2 text-gray-600">{row.label}</td>
                <td className="px-2 py-2 text-right font-medium text-gray-800 w-28">
                  {formatJPY(calc.breakdown[row.key])}
                </td>
                <td className="pl-2 pr-4 py-2 text-right text-xs text-gray-400 w-16">
                  {calc.sellingPrice > 0
                    ? formatPercent((calc.breakdown[row.key] / calc.sellingPrice) * 100)
                    : '-'}
                </td>
              </tr>
            ))}

            {/* 小計：固定費 */}
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-4 py-1.5 text-xs text-gray-500 font-medium">
                固定費 合計
              </td>
              <td className="px-2 py-1.5 text-right text-sm font-semibold text-gray-700 w-28">
                {formatJPY(calc.totalFixedCost)}
              </td>
              <td className="pl-2 pr-4 py-1.5 text-right text-xs text-gray-400 w-16">
                {calc.sellingPrice > 0
                  ? formatPercent((calc.totalFixedCost / calc.sellingPrice) * 100)
                  : '-'}
              </td>
            </tr>

            {/* 変動費 */}
            <tr className="bg-blue-50/30">
              <td colSpan={3} className="px-4 py-1.5 text-xs text-gray-400 font-medium">
                変動費（販売価格連動）
              </td>
            </tr>
            {BREAKDOWN_ROWS.filter((r) => r.type === 'variable').map((row) => (
              <tr key={row.key} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="pl-6 pr-2 py-2 text-gray-600">{row.label}</td>
                <td className="px-2 py-2 text-right font-medium text-gray-800 w-28">
                  {formatJPY(calc.breakdown[row.key])}
                </td>
                <td className="pl-2 pr-4 py-2 text-right text-xs text-gray-400 w-16">
                  {calc.sellingPrice > 0
                    ? formatPercent((calc.breakdown[row.key] / calc.sellingPrice) * 100)
                    : '-'}
                </td>
              </tr>
            ))}

            {/* 小計：変動費 */}
            <tr className="border-t border-gray-200 bg-blue-50/40">
              <td className="px-4 py-1.5 text-xs text-gray-500 font-medium">
                変動費 合計
              </td>
              <td className="px-2 py-1.5 text-right text-sm font-semibold text-gray-700 w-28">
                {formatJPY(calc.totalVariableCost)}
              </td>
              <td className="pl-2 pr-4 py-1.5 text-right text-xs text-gray-400 w-16">
                {calc.sellingPrice > 0
                  ? formatPercent((calc.totalVariableCost / calc.sellingPrice) * 100)
                  : '-'}
              </td>
            </tr>

            {/* 総コスト */}
            <tr className="border-t-2 border-gray-300 bg-gray-100">
              <td className="px-4 py-2.5 text-sm font-bold text-gray-700">総コスト</td>
              <td className="px-2 py-2.5 text-right text-sm font-bold text-gray-800 w-28">
                {formatJPY(calc.totalCost)}
              </td>
              <td className="pl-2 pr-4 py-2.5 text-right text-xs font-medium text-gray-500 w-16">
                {calc.sellingPrice > 0
                  ? formatPercent((calc.totalCost / calc.sellingPrice) * 100)
                  : '-'}
              </td>
            </tr>

            {/* 販売価格 */}
            <tr className="border-t border-gray-200">
              <td className="px-4 py-2 text-sm text-gray-600">販売想定価格</td>
              <td className="px-2 py-2 text-right text-sm font-medium text-gray-800 w-28">
                {formatJPY(calc.sellingPrice)}
              </td>
              <td className="pl-2 pr-4 py-2 text-right text-xs text-gray-400 w-16">100%</td>
            </tr>

            {/* 利益 */}
            <tr
              className={`border-t-2 ${
                isProfitable ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}
            >
              <td
                className={`px-4 py-3 text-sm font-bold ${
                  isProfitable ? 'text-green-700' : 'text-red-700'
                }`}
              >
                利益（税引前）
              </td>
              <td
                className={`px-2 py-3 text-right text-base font-black w-28 ${
                  isProfitable ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {formatJPY(calc.profit)}
              </td>
              <td
                className={`pl-2 pr-4 py-3 text-right text-sm font-bold w-16 ${
                  isProfitable ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercent(calc.profitRate)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
