import { NextRequest, NextResponse } from 'next/server';

/**
 * eBay販売相場取得API
 *
 * 現在: モック実装（常に固定値を返す）
 * 将来: EBAY_APP_ID 設定時に eBay Browse API を呼び出す
 *
 * eBay Browse API 参考:
 * https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
 */
export async function POST(request: NextRequest) {
  try {
    const { productName, brand, modelNumber } = await request.json();

    // ── 将来: eBay APIキーが設定されていれば実API呼び出し ──
    // const ebayAppId = process.env.EBAY_APP_ID;
    // if (ebayAppId) {
    //   const query = [brand, productName, modelNumber].filter(Boolean).join(' ');
    //   const ebayRes = await fetch(
    //     `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&filter=buyingOptions:{AUCTION|FIXED_PRICE},soldItems:true`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${ebayAppId}`,
    //         'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    //       },
    //     }
    //   );
    //   // ... parse and return
    // }

    // ── モック応答 ─────────────────────────────────
    console.log('[ebay-price] Mock mode. Product:', { productName, brand, modelNumber });

    return NextResponse.json({
      suggestedPrice: 0,
      priceRange: { min: 0, max: 0 },
      source: 'mock',
      note: 'eBay APIは未接続です。eBay Sold Itemsで実際の落札相場を確認し、手動で入力してください。',
    });
  } catch (error) {
    console.error('[ebay-price] Error:', error);
    return NextResponse.json(
      { error: 'eBay相場の取得に失敗しました' },
      { status: 500 }
    );
  }
}
