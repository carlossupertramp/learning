"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function StoryModule() {
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(collection(db, "Stories_English_Finance"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (stories.length === 0) return <div className="p-8 text-center text-xl">無發佈的故事。</div>;

  const currentStory = stories[currentIndex];
  const quiz = currentStory.critical_quiz;

  const handleQuizSubmit = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      alert("今日閱讀任務完成！");
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 p-8 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border-t-8 border-purple-500">
        <h1 className="text-3xl font-bold mb-4 text-purple-900">{currentStory.title_en}</h1>
        <span className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-bold mb-6">
          Topic: {currentStory.concept_topic}
        </span>

        <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-purple-400 mb-8">
          <p className="text-xl leading-relaxed">{currentStory.story_en}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Vocabulary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStory.vocab_list?.map((v: any, idx: number) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-lg border">
                <p className="font-bold text-lg">{v.word} <span className="text-sm text-gray-500 italic">{v.pos}</span></p>
                <p className="text-gray-700 mb-2">{v.meaning_zh}</p>
                <p className="text-sm text-gray-600 border-t pt-2 mt-2">Example: {v.example_en}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
          <h2 className="text-xl font-bold mb-2">💡 Key Takeaway</h2>
          <p className="text-lg font-medium">{currentStory.takeaway_en}</p>
        </div>

        {quiz && (
          <div className="bg-white border-2 border-gray-200 p-6 rounded-xl mb-6">
            <h2 className="text-xl font-bold mb-4">Quiz Time!</h2>
            <p className="text-lg mb-4">{quiz.question_en}</p>
            <div className="flex flex-col gap-3">
              {quiz.options.map((opt: string, idx: number) => (
                <button 
                  key={idx}
                  disabled={showResult}
                  onClick={() => handleQuizSubmit(idx)}
                  className={`text-left p-4 rounded-lg border-2 transition ${
                    showResult && idx === quiz.answer_index ? "bg-green-100 border-green-500 font-bold" :
                    showResult && idx === selectedOption && idx !== quiz.answer_index ? "bg-red-100 border-red-500" :
                    "hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            
            {showResult && (
              <div className={`mt-6 p-4 rounded-lg ${selectedOption === quiz.answer_index ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                <p className="font-bold mb-2">{selectedOption === quiz.answer_index ? "⭐ Correct!" : "❌ Incorrect."}</p>
                <p>{quiz.explanation_en}</p>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <button 
            onClick={handleNext}
            className="w-full bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800"
          >
            Next Story ➡️
          </button>
        )}
      </div>
    </div>
  );
}
