"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function MathModule() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 熔斷機制與解題狀態
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "Questions_Math"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(data);
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (questions.length === 0) return <div className="p-8 text-center text-xl">暫時沒有數學題目。請叫家長去後台加題目！</div>;

  const currentQ = questions[currentIndex];
  // 假設我們目前只取第一步作為 MVP 測試
  const currentStep = currentQ.steps && currentQ.steps.length > 0 ? currentQ.steps[0] : null;

  const handleSubmit = () => {
    if (!userInput.trim() || !currentStep) return;
    
    // MVP 簡單比對：只要學生輸入的數字/算式出現在 AI 的正確解答字串中，即視為正確
    const isCorrect = currentStep.calculation.replace(/\s+/g, '').includes(userInput.replace(/\s+/g, ''));

    if (isCorrect) {
      alert("✅ 正確！你得了一顆星星⭐");
      setIsResolved(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsResolved(true); // 觸發熔斷，強制顯示正確答案
      } else {
        alert("❌ 唔啱喎，再試下！");
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    } else {
      alert("今日任務完成！");
    }
  };

  const resetState = () => {
    setUserInput("");
    setAttempts(0);
    setIsResolved(false);
  };

  return (
    <div className="min-h-screen bg-green-50 p-8 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border-t-8 border-green-500">
        
        {/* 題目 Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-green-700">Topic: {currentQ.topic}</h1>
          <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* 題目內容 (強制英文) */}
        <div className="text-xl mb-8 font-medium">
          {currentQ.question_en}
        </div>

        {/* Step 解題區 */}
        {currentStep && (
          <div className="bg-gray-50 p-6 rounded-xl border mb-6">
            <h2 className="text-lg font-bold mb-4">Step {currentStep.step_number}: Calculation</h2>
            
            {/* 提示 (Hints) 區塊：錯 1 次彈 Hint 1，錯 2 次彈 Hint 2 */}
            {attempts === 1 && (
              <div className="bg-yellow-100 p-4 rounded mb-4 text-yellow-800">
                💡 <strong>Hint 1:</strong> {currentStep.hint_1}
              </div>
            )}
            {attempts === 2 && (
              <div className="bg-orange-100 p-4 rounded mb-4 text-orange-800">
                💡 <strong>Hint 2:</strong> {currentStep.hint_2}
              </div>
            )}

            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="輸入算式或答案..."
                className="border-2 border-green-300 p-3 rounded-lg flex-1 text-lg disabled:bg-gray-200"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isResolved}
              />
              <button 
                onClick={handleSubmit}
                disabled={isResolved}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                Submit
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              *必須包含單位 (Unit: {currentStep.unit_label})。你還有 {3 - attempts} 次機會。
            </p>
          </div>
        )}

        {/* 熔斷/過關狀態 */}
        {isResolved && (
          <div className={`p-6 rounded-xl border mb-6 ${attempts >= 3 ? "bg-red-100 border-red-300" : "bg-green-100 border-green-300"}`}>
            {attempts >= 3 ? (
              <h3 className="text-red-700 font-bold text-lg mb-2">💥 已達錯誤上限 (Meltdown)</h3>
            ) : (
              <h3 className="text-green-700 font-bold text-lg mb-2">⭐ Correct!</h3>
            )}
            <p className="text-lg mb-1"><strong>Correct Calculation:</strong> {currentStep?.calculation}</p>
            <p className="text-lg"><strong>Unit:</strong> {currentStep?.unit_label}</p>
            
            <button 
              onClick={handleNext}
              className="mt-6 bg-black text-white px-8 py-3 rounded-lg font-bold w-full"
            >
              Next Question ➡️
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
