import React from 'react';
import { Bell, Search, Menu, Tractor, PawPrint } from 'lucide-react';
import { useFarmMode } from '../providers/FarmModeProvider';

export function Header() {
    const { mode, toggleMode } = useFarmMode();
    return (
        <header className="h-24 w-full px-8 py-4 flex items-center justify-between z-10 bg-[#ecf0f3]">
            <div className="flex items-center w-1/2">
                <button className="md:hidden neu-button p-3 rounded-xl mr-4 text-gray-500">
                    <Menu className="w-5 h-5" />
                </button>

                {/* SEARCH BAR */}
                <div className="hidden md:flex items-center w-full max-w-md relative">
                    <Search className="w-5 h-5 absolute left-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search farm records..."
                        className="neu-input w-full h-12 pl-12 pr-4 rounded-2xl text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">

                {/* DUAL MODE TOGGLE */}
                <div className="flex items-center space-x-2 neu-pressed p-1 rounded-2xl bg-[#ecf0f3]">
                    <button
                        onClick={() => mode !== 'LIVESTOCK' && toggleMode()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'LIVESTOCK' ? 'neu-flat text-[#00bfa5]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <PawPrint className="w-4 h-4" />
                        <span className="hidden md:inline">Livestock</span>
                    </button>
                    <button
                        onClick={() => mode !== 'AGRICULTURE' && toggleMode()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'AGRICULTURE' ? 'neu-flat text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Tractor className="w-4 h-4" />
                        <span className="hidden md:inline">Agriculture</span>
                    </button>
                </div>

                {/* NOTIFICATION */}
                <button className="w-12 h-12 neu-button rounded-full flex items-center justify-center text-gray-500 hover:text-[#00bfa5] transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#ecf0f3]"></span>
                </button>

                {/* PROFILE PICTURE */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-gray-700">Dr. Dhiko</p>
                        <p className="text-xs text-gray-500">PediaVet Admin</p>
                    </div>
                    <div className="w-12 h-12 neu-flat rounded-full p-1 cursor-pointer">
                        <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Dhiko&background=00bfa5&color=fff" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
