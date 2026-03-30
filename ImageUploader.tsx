'use client';

import { useState } from 'react';
import type { ProductInfo, EbayPriceResult } from '@/types';

interface Props {
  sellingPrice: number;
  onSellingPriceChange: (price: number) => void;
  product: ProductInfo;
}

export default function SellingPriceInput({
  sellingPrice,
  onSellingPriceChange,
  product,
}: Props) {
  const [isFetching, setIsFetching] = useState(false);
  const [ebayResult, setEbayResult] = useState<EbayPriceResult | null>(null);
  const [fetchError, setFetchError] = useState('');

  const handleFetchEbayPrice = async () => {
    if (!product.name && !product.brand) {
      setFetchError('商品名またはブランドを入力してからeBay相場を取得してください');
      return;
    }
    setIsFetching(true);
    setFetchError('');
    setEbayResult(null);

    try {
      const res = await fetch('/api/ebay-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          brand: product.brand,
          modelNumber: product.modelNumber,
        }),
      });

      if (!res.ok) throw new Error('APIエラー');
      const data: EbayPriceResult = await res.json();
      setEbayResult(data);

      // 相場価格が取得できた場合は自動セット
      if (data.suggestedPrice > 0) {
        onSellingPriceChange(data.suggestedPrice);
      }
    } catch {
      setFetchError('eBay相場の取得に失敗しました');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* メイン入力 */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          eBay 販売想定価格（円） <span className="text-red-500 normal-case font-normal">（必須）</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ¥
            </span>
            <input
              type="number"
              value={sellingPrice === 0 ? '' : sellingPrice}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onSellingPriceChange(isNaN(v) ? 0 : v);
              }}
              min={0}
              step={100}
              placeholder="例: 15000"
              className="input-base pl-7 text-lg font-bold"
            />
          </div>
          <button
            type="button"
            onClick={handleFetchEbayPrice}
            disabled={isFetching}
            className="shrink-0 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? '取得中...' : 'eBay相場'}
          </button>
        </div>
      </div>

      {/* eBay相場取得結果 */}
      {ebayResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          {ebayResult.suggestedPrice > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">参考相場</span>
                <span className="font-bold text-blue-700">
                  ¥{ebayResult.suggestedPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>レンジ</span>
                <span>
                  ¥{ebayResult.priceRange.min.toLocaleString()} 〜 ¥{ebayResult.priceRange.max.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-amber-700 text-xs">{ebayResult.note}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            ソース: {ebayResult.source === 'mock' ? 'モック（参考値なし）' : 'eBay API'}
          </p>
        </div>
      )}

      {fetchError && (
        <p className="text-xs text-red-500">{fetchError}</p>
      )}

      {/* ガイド */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">💡 eBay Sold Items で相場を確認する方法</p>
        <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
          <li>
            <a
              href="https://www.ebay.com/sch/i.html?_nkw=&LH_Complete=1&LH_Sold=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              eBay Sold Items を開く ↗
            </a>
          </li>
          <li>商品名・型番で検索</li>
          <li>直近30日の落札価格の中央値を入力</li>
        </ol>
      </div>
    </div>
  );
}
