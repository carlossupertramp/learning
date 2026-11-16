"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type SpeechLang = "zh-CN" | "zh-HK";

function normalizeLang(code: string) {
  return code.replace(/_/g, "-").toLowerCase();
}

function findVoice(lang: SpeechLang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const target = normalizeLang(lang);

  const exact = voices.find((voice) => normalizeLang(voice.lang) === target);
  if (exact) return exact;

  const prefixed = voices.find((voice) => normalizeLang(voice.lang).startsWith(target));
  if (prefixed) return prefixed;

  if (lang === "zh-CN") {
    return voices.find((voice) => {
      const code = normalizeLang(voice.lang);
      const name = voice.name.toLowerCase();
      return (
        code.startsWith("zh-cn") ||
        code.startsWith("cmn") ||
        name.includes("ting-ting") ||
        name.includes("tingting") ||
        name.includes("mandarin")
      );
    });
  }

  return voices.find((voice) => {
    const code = normalizeLang(voice.lang);
    const name = voice.name.toLowerCase();
    return (
      code.startsWith("zh-hk") ||
      code.startsWith("yue") ||
      name.includes("sin-ji") ||
      name.includes("sinji") ||
      name.includes("cantonese") ||
      name.includes("廣東")
    );
  });
}

export default function ChineseModule() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const q = query(collection(db, "Flashcards_Chinese"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        setCards(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const preloadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    preloadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", preloadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", preloadVoices);
    };
  }, []);

  const speak = (text: string, lang: SpeechLang) => {
    if (!text?.trim()) return;
    if (!window.speechSynthesis) {
      alert("你的瀏覽器不支援語音功能");
      return;
    }

    const speakNow = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findVoice(lang);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang;
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      const onVoicesReady = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        speakNow();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
      window.speechSynthesis.getVoices();
      return;
    }

    speakNow();
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (cards.length === 0) return <div className="p-8 text-center text-xl">無發佈的生字卡。</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 to-orange-50 p-6 text-gray-900 font-sans sm:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl sm:p-10">
        <h1 className="mb-8 text-7xl font-bold tracking-tight sm:text-8xl">{currentCard.word}</h1>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => speak(currentCard.word, "zh-HK")}
            className="rounded-full bg-sky-600 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-sky-700"
          >
            廣東話發音
          </button>
          <button
            type="button"
            onClick={() => speak(currentCard.word, "zh-CN")}
            className="rounded-full bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            普通話發音
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-rose-50/90 p-6 text-left">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-rose-800">廣東話解釋</h2>
            <button
              type="button"
              onClick={() => speak(currentCard.explanation_yue, "zh-HK")}
              className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              🔊 朗讀
            </button>
          </div>
          <p className="text-lg leading-relaxed">{currentCard.explanation_yue}</p>
        </div>

        <div className="mb-5 rounded-2xl bg-amber-50/90 p-6 text-left">
          <h2 className="mb-3 text-xl font-bold text-amber-800">🧩 拆字 (Lego)</h2>
          <ul className="list-disc space-y-1 pl-6 text-lg">
            {currentCard.lego_structure?.map((lego: any, idx: number) => (
              <li key={idx}>
                <strong>{lego.position}</strong>: {lego.part}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-5 rounded-2xl bg-violet-50/90 p-6 text-left">
          <h2 className="mb-3 text-xl font-bold text-violet-800">🔐 記憶密碼</h2>
          <p className="text-lg leading-relaxed">{currentCard.memory_code}</p>
        </div>

        <div className="mb-8 rounded-2xl bg-sky-50/90 p-6 text-left">
          <h2 className="mb-3 text-xl font-bold text-sky-800">✍️ 例句</h2>
          <p className="text-lg leading-relaxed">{currentCard.example_sentence}</p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-gray-500">
            進度: {currentIndex + 1} / {cards.length}
          </span>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1))}
            disabled={currentIndex === cards.length - 1}
            className="rounded-2xl bg-gray-900 px-8 py-3 font-bold text-white transition hover:bg-black disabled:bg-gray-300"
          >
            下一個 ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
