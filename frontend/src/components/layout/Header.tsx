import React from 'react';
import { Bell, Search, Menu, Tractor, PawPrint } from 'lucide-react';
import { useFarmMode } from '../providers/FarmModeProvider';

export function Header() {
    const { mode, toggleMode } = useFarmMode();
    return (
        <header className="h-20 w-full px-4 md:px-8 flex items-center justify-between z-10 sticky top-0 bg-white/60 backdrop-blur-xl border-b border-slate-200">
            <div className="flex items-center w-1/2">
                <button className="md:hidden p-2 rounded-xl mr-4 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Menu className="w-6 h-6" />
                </button>

                {/* SEARCH BAR */}
                <div className="hidden md:flex items-center w-full max-w-md relative group">
                    <Search className="w-5 h-5 absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search farm records..."
                        className="w-full h-[42px] pl-11 pr-4 bg-slate-100/50 border border-slate-200/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 text-slate-800"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end space-x-3 md:space-x-5 w-1/2">

                {/* DUAL MODE TOGGLE */}
                <div className="hidden sm:flex items-center p-1 rounded-full bg-slate-100/50 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => mode !== 'LIVESTOCK' && toggleMode()}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${mode === 'LIVESTOCK' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border border-transparent'}`}
                    >
                        <PawPrint className="w-4 h-4" />
                        <span className="hidden lg:inline">Livestock</span>
                    </button>
                    <button
                        onClick={() => mode !== 'AGRICULTURE' && toggleMode()}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${mode === 'AGRICULTURE' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border border-transparent'}`}
                    >
                        <Tractor className="w-4 h-4" />
                        <span className="hidden lg:inline">Agriculture</span>
                    </button>
                </div>

                {/* NOTIFICATION */}
                <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors relative shadow-sm">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
                </button>

                {/* PROFILE PICTURE */}
                <div className="flex items-center space-x-3.5 pl-2 md:pl-4 border-l border-slate-200">
                    <div className="hidden lg:block text-right">
                        <p className="text-sm font-bold text-slate-800 tracking-tight">Dr. Dhiko</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-full p-0.5 border-2 border-slate-200 cursor-pointer shadow-sm hover:border-blue-300 transition-colors bg-white">
                        <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Dhiko&background=2563eb&color=fff" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
