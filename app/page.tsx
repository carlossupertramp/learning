"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";

export default function Home() {
  const router = useRouter();
  const setUserRole = useStore((state) => state.setUserRole);

  const handleRoleSelect = (role: "parent" | "brother" | "sister", path: string) => {
    setUserRole(role);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center font-sans p-6 selection:bg-blue-200">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
          ⭐ 星星學習系統
        </h1>
        <p className="text-slate-500 font-medium text-lg tracking-wide">請選擇登入身分</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        {/* 家長端入口 */}
        <button
          onClick={() => handleRoleSelect("parent", "/admin")}
          className="group relative bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="text-5xl">👨‍🏫</span>
          </div>
          <span className="block text-2xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors">家長 (Admin)</span>
          <span className="block mt-2 text-sm text-slate-400 font-medium">系統管理與教材建置</span>
        </button>

        {/* 哥哥入口 */}
        <button
          onClick={() => handleRoleSelect("brother", "/student")}
          className="group relative bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-24 h-24 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="text-5xl">👦</span>
          </div>
          <span className="block text-2xl font-bold text-slate-700 group-hover:text-amber-500 transition-colors">哥哥</span>
          <span className="block mt-2 text-sm text-slate-400 font-medium">進入專屬學習區</span>
        </button>

        {/* 妹妹入口 */}
        <button
          onClick={() => handleRoleSelect("sister", "/student")}
          className="group relative bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-24 h-24 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="text-5xl">👧</span>
          </div>
          <span className="block text-2xl font-bold text-slate-700 group-hover:text-pink-500 transition-colors">妹妹</span>
          <span className="block mt-2 text-sm text-slate-400 font-medium">進入專屬學習區</span>
        </button>
      </div>
    </div>
  );
}
