'use client';

import { useCallback, useRef, useState } from 'react';

interface Props {
  onUpload: (base64: string, mimeType: string) => void;
  uploadedImage: string | null;
  uploadedMimeType: string;
  isAnalyzing: boolean;
  isMockMode: boolean;
}

export default function ImageUploader({
  onUpload,
  uploadedImage,
  uploadedMimeType,
  isAnalyzing,
  isMockMode,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください（JPEG, PNG, WebP）');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        onUpload(base64, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // 同じファイルを再選択できるようにリセット
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div className="space-y-2">
      {uploadedImage ? (
        <div className="relative">
          <img
            src={`data:${uploadedMimeType};base64,${uploadedImage}`}
            alt="アップロードした商品画像"
            className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-gray-50"
          />
          {/* 解析中オーバーレイ */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center">
              <div className="text-white text-center">
                <div className="text-3xl mb-2 animate-spin">⏳</div>
                <p className="text-sm font-medium">Claude が解析中...</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← 画像を変更する
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
            transition-all duration-150 select-none
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="text-5xl mb-3">📷</div>
          <p className="text-gray-700 font-medium">商品画像をドロップ</p>
          <p className="text-gray-400 text-sm mt-1">または クリックして選択</p>
          <p className="text-gray-300 text-xs mt-2">JPEG / PNG / WebP 対応</p>
        </div>
      )}

      {/* モード表示 */}
      {isMockMode ? (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          ⚠️ <strong>モードモード:</strong> APIキー未設定のため自動解析は無効です。商品情報を手動で入力してください。
        </p>
      ) : (
        <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
          ✅ <strong>Claude Vision 有効:</strong> 画像をアップロードすると商品情報を自動補完します。
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
