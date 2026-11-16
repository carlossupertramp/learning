"use client";
import Link from "next/link";
import { useStore } from "@/store/store";

export default function StudentDashboard() {
  const userRole = useStore((state) => state.userRole);

  if (userRole === "parent") {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-red-100 max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">這是學生專區</h1>
          <p className="text-slate-500 mb-8 font-medium">家長請返回控制台建立教材，或以學生身分重新登入。</p>
          <Link href="/" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full">
            返回首頁切換身分
          </Link>
        </div>
      </div>
    );
  }

  const roleTheme = userRole === "brother" ? "text-amber-600 bg-amber-50 border-amber-200" : userRole === "sister" ? "text-pink-600 bg-pink-50 border-pink-200" : "text-slate-600 bg-slate-50 border-slate-200";
  const roleIcon = userRole === "brother" ? "👦 哥哥" : userRole === "sister" ? "👧 妹妹" : "未知";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-indigo-50 text-slate-800 font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link href="/" className="group flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-white hover:shadow-md transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">⬅️</span> 登出返回首頁
        </Link>
        <div className={`px-5 py-2.5 rounded-2xl font-bold border flex items-center gap-2 shadow-sm ${roleTheme}`}>
          <span className="text-lg">⭐</span> 當前身分: {roleIcon}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight mb-4">今日學習任務</h1>
          <p className="text-slate-500 font-medium text-lg">揀一個科目開始挑戰啦！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/student/chinese" className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden block">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-red-500 transition-colors">中文生字卡</h2>
            <p className="mt-2 text-slate-400 text-sm font-medium">部件拆解與廣東話發音</p>
          </Link>

          <Link href="/student/math" className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden block">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 -rotate-3 group-hover:rotate-0">
              <span className="text-4xl">🧮</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">新加坡數學</h2>
            <p className="mt-2 text-slate-400 text-sm font-medium">Bar Model 與解題思維</p>
          </Link>

          <Link href="/student/story" className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden block">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0">
              <span className="text-4xl">📖</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-purple-600 transition-colors">英文財商故事</h2>
            <p className="mt-2 text-slate-400 text-sm font-medium">情境閱讀與思維測驗</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
