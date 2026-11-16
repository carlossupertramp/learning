"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";

export default function ChineseModule() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 初始化與綁定語音包變更事件
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("已載入語音包:", voices.map(v => `${v.name} (${v.lang})`));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const q = query(collection(db, "Flashcards_Chinese"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  // 極簡版 Apple 語音引擎匹配機制
  const speak = (text: string, type: 'cantonese' | 'mandarin') => {
    if (!window.speechSynthesis) return alert("不支援語音功能");
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (type === 'cantonese') {
      utterance.lang = 'zh-HK';
    } else {
      utterance.lang = 'zh-CN'; 
      // 絕對不要在這裡設定 utterance.voice，讓 iOS 根據 zh-CN 自己決定，這是在 Apple 設備上最穩定的普通話解法。
    }

    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (cards.length === 0) return <div className="p-8 text-center text-xl">無發佈的生字卡。</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-orange-50 p-6 md:p-10 text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 text-center">
        
        <h1 className="text-8xl md:text-9xl font-extrabold mb-8 text-slate-800 drop-shadow-sm">
          {currentCard.word}
        </h1>
        
        <div className="flex justify-center gap-4 mb-10">
          <button onClick={() => speak(currentCard.word, "cantonese")} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-2xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <span>🇭🇰</span> 廣東話
          </button>
          <button onClick={() => speak(currentCard.word, "mandarin")} className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-2xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <span>🇹🇼/🇨🇳</span> 普通話
          </button>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-6 text-left relative group">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <span>📖</span> 廣東話淺白解釋
            </h2>
            <button onClick={() => speak(currentCard.explanation_yue, "cantonese")} className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
              🔊 朗讀
            </button>
          </div>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
            {currentCard.explanation_yue}
          </p>
        </div>

        {/* 圖片解釋區塊 */}
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl mb-6 text-left">
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <span>🖼️</span> 圖片解釋
          </h2>
          <div className={`grid gap-4 ${currentCard.image_urls?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {currentCard.image_urls && currentCard.image_urls.length > 0 ? (
              currentCard.image_urls.map((url: string, idx: number) => (
                <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm border border-orange-200">
                  <Image src={url} alt={`圖片解釋 ${idx + 1}`} fill className="object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-orange-300 font-bold border border-orange-200 border-dashed">
                暫無圖片
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <span className="font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
            進度: {currentIndex + 1} / {cards.length}
          </span>
          <button 
            onClick={() => setCurrentIndex(prev => Math.min(prev + 1, cards.length - 1))}
            disabled={currentIndex === cards.length - 1}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold disabled:bg-slate-300 hover:bg-slate-800 transition-colors shadow-md"
          >
            下一個 ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
