"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const [word, setWord] = useState("");
  const [targetStudent, setTargetStudent] = useState("both"); // 預設共用
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [wordsList, setWordsList] = useState<any[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  // 讀取現有生字
  const fetchWords = async () => {
    try {
      const q = query(collection(db, "Flashcards_Chinese"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWordsList(data);
    } catch (error) {
      console.error("讀取列表失敗:", error);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  // 核心生圖邏輯 (DeepSeek + SiliconFlow Flux)
  const generateImageFlow = async (targetWord: string) => {
    // 1. DeepSeek 文字轉指令
    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一位專為香港小學生設計視覺記憶卡的插畫指導。
任務：根據提供的「中文生字」，構思 1 個搞笑、荒誕且能精準表達該字義的畫面，並翻譯為直接可用於 Flux 的英文生圖提示詞。
絕對規則：嚴禁出現任何文字或符號。強制使用 "Flat vector illustration, vibrant colors, comic style, humorous, white background, no text" 作為後綴。必須是具體動作或物件。
輸出格式：只輸出一段英文 prompt 字串，不要任何 JSON 標籤或多餘解釋。`
          },
          { role: "user", content: `生字：${targetWord}` }
        ],
        temperature: 0.7
      })
    });
    if (!deepseekRes.ok) throw new Error("DeepSeek 請求失敗");
    const deepseekData = await deepseekRes.json();
    const imagePrompt = deepseekData.choices[0].message.content.trim();

    // 2. SiliconFlow Flux 產生圖片
    const siliconRes = await fetch("https://api.siliconflow.cn/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: imagePrompt,
        image_size: "1024x1024",
        num_images: 1
      })
    });
    if (!siliconRes.ok) throw new Error("SiliconFlow 請求失敗");
    const siliconData = await siliconRes.json();
    return siliconData.images[0].url;
  };

  // 新增生字
  const handleAdd = async () => {
    if (!word) return alert("請輸入生字");
    setLoading(true);
    setStatusText("正在生成圖片並儲存...");
    try {
      const imageUrl = await generateImageFlow(word);
      await addDoc(collection(db, "Flashcards_Chinese"), {
        word: word,
        target_student: targetStudent,
        explanation_yue: `(請手動填寫 ${word} 的廣東話解釋)`,
        image_urls: [imageUrl],
        status: "published",
        createdAt: new Date().toISOString()
      });
      setWord("");
      await fetchWords();
    } catch (error: any) {
      alert(`新增失敗: ${error.message}`);
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // 刪除生字
  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個生字嗎？")) return;
    try {
      await deleteDoc(doc(db, "Flashcards_Chinese", id));
      await fetchWords();
    } catch (error: any) {
      alert(`刪除失敗: ${error.message}`);
    }
  };

  // 重新生成圖片
  const handleRegenerateImage = async (id: string, targetWord: string) => {
    if (!confirm(`確定要為「${targetWord}」重新生成圖片嗎？`)) return;
    setActionId(id);
    try {
      const newImageUrl = await generateImageFlow(targetWord);
      await updateDoc(doc(db, "Flashcards_Chinese", id), {
        image_urls: [newImageUrl]
      });
      await fetchWords();
      alert("圖片已重新生成！");
    } catch (error: any) {
      alert(`重抽失敗: ${error.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">家長控制台 - 中文科管理</h1>
      
      {/* 新增區塊 */}
      <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-xl font-bold mb-4">➕ 新增生字</h2>
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)}
            placeholder="輸入新生字..."
            className="flex-1 p-4 text-xl rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={targetStudent}
            onChange={(e) => setTargetStudent(e.target.value)}
            className="p-4 text-lg rounded-xl border border-slate-300 bg-white"
          >
            <option value="both">👦👧 共用</option>
            <option value="brother">👦 哥哥專用</option>
            <option value="sister">👧 妹妹專用</option>
          </select>
        </div>
        <button 
          onClick={handleAdd}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-400"
        >
          {loading ? statusText : "生成並發佈"}
        </button>
      </div>

      {/* 管理列表 */}
      <h2 className="text-xl font-bold mb-4">📋 已建立生字列表</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-700">生字</th>
              <th className="p-4 font-bold text-slate-700">目標</th>
              <th className="p-4 font-bold text-slate-700">預覽圖片</th>
              <th className="p-4 font-bold text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {wordsList.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-2xl font-bold">{item.word}</td>
                <td className="p-4">
                  {item.target_student === 'brother' ? '👦 哥哥' : item.target_student === 'sister' ? '👧 妹妹' : '👦👧 共用'}
                </td>
                <td className="p-4">
                  {item.image_urls && item.image_urls[0] ? (
                    <img src={item.image_urls[0]} alt={item.word} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  ) : "無圖片"}
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => handleRegenerateImage(item.id, item.word)}
                    disabled={actionId === item.id}
                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold hover:bg-orange-200 disabled:opacity-50"
                  >
                    {actionId === item.id ? "🔄 生成中..." : "🔄 重抽圖片"}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200"
                  >
                    🗑️ 刪除
                  </button>
                </td>
              </tr>
            ))}
            {wordsList.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">暫無數據</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
