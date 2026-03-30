'use client';

import { useState, useCallback } from 'react';
import type { ProductInfo, PurchaseCondition, ProfitCalculation, JudgmentResult } from '@/types';
import { calculateProfit } from '@/lib/profit-calculator';
import { judge } from '@/lib/judgment';
import { analyzeProductImage } from '@/lib/claude-vision';

import ImageUploader from '@/components/ImageUploader';
import ProductForm from '@/components/ProductForm';
import PurchaseConditionForm from '@/components/PurchaseConditionForm';
import SellingPriceInput from '@/components/SellingPriceInput';
import ProfitResultPanel from '@/components/ProfitResultPanel';
import JudgmentBadge from '@/components/JudgmentBadge';

// ── デフォルト値 ────────────────────────────────────
const DEFAULT_PRODUCT: ProductInfo = {
  brand: '',
  name: '',
  modelNumber: '',
  condition: 'good',
  accessories: '',
  hasBox: false,
  memo: '',
};

const DEFAULT_PURCHASE: PurchaseCondition = {
  purchasePrice: 0,
  domesticShipping: 500,
  packagingCost: 200,
  ebayFeeRate: 13,
  paymentFeeRate: 3,
  internationalShipping: 2000,
  fxBuffer: 3,
  riskDeduction: 0,
};

// ── 初期計算結果（未入力時）─────────────────────────
function getInitialResult(): { calc: ProfitCalculation; judgment: JudgmentResult } {
  const calc = calculateProfit(0, DEFAULT_PURCHASE);
  const judgment = judge(calc, DEFAULT_PRODUCT);
  return { calc, judgment };
}

export default function HomePage() {
  // ── 状態 ──────────────────────────────────────────
  const [product, setProduct] = useState<ProductInfo>(DEFAULT_PRODUCT);
  const [purchase, setPurchase] = useState<PurchaseCondition>(DEFAULT_PURCHASE);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  // 画像
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // APIキーが未設定かどうか（初回画像解析後に実際のレスポンスで確定する）
  const [isMockMode, setIsMockMode] = useState(true);

  // 結果
  const [result, setResult] = useState<{ calc: ProfitCalculation; judgment: JudgmentResult }>(
    getInitialResult()
  );
  const [hasCalculated, setHasCalculated] = useState(false);

  // ── 画像アップロード & 自動解析 ───────────────────
  const handleImageUpload = useCallback(
    async (base64: string, mimeType: string) => {
      setUploadedImage(base64);
      setUploadedMimeType(mimeType);
      setIsAnalyzing(true);

      try {
        const analyzed = await analyzeProductImage(base64, mimeType);
        // APIキー有無を実際のレスポンスから判定
        setIsMockMode(analyzed.isMock);
        // 解析結果をフォームに反映（空文字は上書きしない）
        setProduct((prev) => ({
          brand: analyzed.brand || prev.brand,
          name: analyzed.name || prev.name,
          modelNumber: analyzed.modelNumber || prev.modelNumber,
          condition: analyzed.condition || prev.condition,
          accessories: analyzed.accessories || prev.accessories,
          hasBox: analyzed.hasBox ?? prev.hasBox,
          memo: analyzed.memo || prev.memo,
        }));
      } catch (e) {
        console.error('画像解析エラー:', e);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // ── 利益計算 ──────────────────────────────────────
  const handleCalculate = useCallback(() => {
    const calc = calculateProfit(sellingPrice, purchase);
    const judgment = judge(calc, product);
    setResult({ calc, judgment });
    setHasCalculated(true);
    // スクロール（モバイル対応）
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, [sellingPrice, purchase, product]);

  // ── リセット ──────────────────────────────────────
  const handleReset = useCallback(() => {
    setProduct(DEFAULT_PRODUCT);
    setPurchase(DEFAULT_PURCHASE);
    setSellingPrice(0);
    setUploadedImage(null);
    setResult(getInitialResult());
    setHasCalculated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── リアルタイム計算（入力と同時に更新） ─────────
  const handlePurchaseChange = useCallback(
    (next: PurchaseCondition) => {
      setPurchase(next);
      if (hasCalculated) {
        const calc = calculateProfit(sellingPrice, next);
        const judgment = judge(calc, product);
        setResult({ calc, judgment });
      }
    },
    [hasCalculated, sellingPrice, product]
  );

  const handleSellingPriceChange = useCallback(
    (price: number) => {
      setSellingPrice(price);
      if (hasCalculated) {
        const calc = calculateProfit(price, purchase);
        const judgment = judge(calc, product);
        setResult({ calc, judgment });
      }
    },
    [hasCalculated, purchase, product]
  );

  // ── レンダリング ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h1 className="text-base font-bold text-gray-800">eBay 利益判定ツール</h1>
            <span className="hidden sm:inline text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              MVP v0.1
            </span>
          </div>
          {hasCalculated && (
            <div className="flex items-center gap-3">
              <JudgmentBadge judgment={result.judgment.judgment} size="sm" />
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                リセット
              </button>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── 左カラム: 入力 ─────────────────────── */}
          <div className="space-y-4">
            {/* 商品画像 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <SectionTitle icon="📷" title="商品画像" />
              <ImageUploader
                onUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                uploadedMimeType={uploadedMimeType}
                isAnalyzing={isAnalyzing}
                isMockMode={isMockMode}
              />
            </section>

            {/* 商品情報 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <SectionTitle icon="🏷️" title="商品情報" />
              <ProductForm value={product} onChange={setProduct} />
            </section>

            {/* eBay販売想定価格 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <SectionTitle icon="💰" title="eBay 販売想定価格" />
              <SellingPriceInput
                sellingPrice={sellingPrice}
                onSellingPriceChange={handleSellingPriceChange}
                product={product}
              />
            </section>
          </div>

          {/* ── 右カラム: 仕入れ条件 + 結果 ────────── */}
          <div className="space-y-4">
            {/* 仕入れ条件 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <SectionTitle icon="📦" title="仕入れ条件" />
              <PurchaseConditionForm
                value={purchase}
                onChange={handlePurchaseChange}
              />
            </section>

            {/* 判定ボタン */}
            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                         text-white font-bold text-lg rounded-2xl shadow
                         transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              🔍 利益を計算して判定する
            </button>

            {/* 結果パネル */}
            {hasCalculated && (
              <section
                id="result-section"
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
              >
                <SectionTitle icon="📊" title="判定結果" />
                <ProfitResultPanel
                  calc={result.calc}
                  judgment={result.judgment}
                />
              </section>
            )}

            {/* 未計算時のプレースホルダー */}
            {!hasCalculated && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-gray-500 font-medium">判定結果がここに表示されます</p>
                <p className="text-gray-400 text-sm mt-1">
                  商品情報・仕入れ条件・販売価格を入力して
                  <br />「判定する」ボタンを押してください
                </p>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-10 text-center text-xs text-gray-400 space-y-1">
          <p>eBay 利益判定ツール — MVP v0.1</p>
          <p>
            このツールは参考値です。最終的な仕入れ判断はご自身の責任でお願いします。
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── ユーティリティコンポーネント ────────────────────
function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
      <span>{icon}</span>
      <span>{title}</span>
    </h2>
  );
}
