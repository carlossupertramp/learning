"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import Link from "next/link";
import { useStore } from "@/store/store";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"chinese" | "math" | "story">("chinese");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  
  const userRole = useStore((state) => state.userRole);

  const handleGenerate = async () => {
    if (!inputValue) return alert("請輸入生字或知識點");
    setLoading(true);
    setDraftData(null);

    try {
      const endpoint = `/api/generate/${activeTab}`;
      const payload = 
        activeTab === "chinese" ? { word: inputValue } : 
        activeTab === "math" ? { topic: inputValue } : 
        { concept: inputValue };
                   
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setDraftData({ ...data, status: "draft" });
    } catch (error: any) {
      alert("生成失敗: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setDraftData(JSON.parse(e.target.value));
    } catch (err) {}
  };

  const handlePublish = async () => {
    if (!draftData) return;
    try {
      const collectionName = 
        activeTab === "chinese" ? "Flashcards_Chinese" :
        activeTab === "math" ? "Questions_Math" :
        "Stories_English_Finance";
                             
      const finalData = { ...draftData, status: "published", createdAt: new Date() };
      
      await addDoc(collection(db, collectionName), finalData);
      
      alert(`發佈成功！已寫入 Firestore [${collectionName}] 資料表。`);
      setDraftData(null);
      setInputValue("");
    } catch (error: any) {
      alert("寫入失敗: " + error.message);
    }
  };

  if (userRole === "brother" || userRole === "sister") {
    return <div className="p-8 text-center text-red-600 font-bold text-2xl">禁止存取：學生帳號無法進入家長控制台</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300">
          ⬅️ 返回首頁
        </Link>
        <span className="text-gray-500 font-bold">當前身分: 家長 (Admin)</span>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">家長控制台 (Admin Dashboard)</h1>
        
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button 
            className={`px-4 py-2 rounded ${activeTab === "chinese" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => { setActiveTab("chinese"); setDraftData(null); setInputValue(""); }}
          >
            中文生字卡
          </button>
          <button 
            className={`px-4 py-2 rounded ${activeTab === "math" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            onClick={() => { setActiveTab("math"); setDraftData(null); setInputValue(""); }}
          >
            新加坡數學
          </button>
          <button 
            className={`px-4 py-2 rounded ${activeTab === "story" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            onClick={() => { setActiveTab("story"); setDraftData(null); setInputValue(""); }}
          >
            英文財商故事
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <input 
            type="text" 
            placeholder={
              activeTab === "chinese" ? "請輸入繁體生字 (例: 努)" : 
              activeTab === "math" ? "請輸入數學知識點 (例: Fractions adding)" : 
              "請輸入財商/心理學概念 (例: Tulip Mania)"
            }
            className="border p-2 rounded flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "AI 生成中..." : "生成初稿"}
          </button>
        </div>

        {draftData && (
          <div className="border rounded-xl p-4 bg-gray-50">
            <h2 className="font-bold mb-2 text-red-600">⚠️ Draft 草稿預覽 (請核實無誤後發佈)</h2>
            <p className="text-sm text-gray-500 mb-2">你可以在下方直接修改 JSON 內容來修正 AI 的錯誤。</p>
            <textarea 
              className="w-full h-64 p-4 font-mono text-sm border rounded bg-white mb-4"
              defaultValue={JSON.stringify(draftData, null, 2)}
              onChange={handleDraftChange}
            />
            <div className="flex justify-end">
              <button 
                onClick={handlePublish}
                className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700"
              >
                確認並發佈 (Publish)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
