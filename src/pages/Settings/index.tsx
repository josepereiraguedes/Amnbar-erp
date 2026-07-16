import React, { useState } from 'react';
import Users from './Users';
import { Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsIndex() {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('users');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'users' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <UsersIcon size={16} /> Usuários
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'general' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <SettingsIcon size={16} /> Configurações Gerais
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[500px]">
        {activeTab === 'users' && <Users />}
        {activeTab === 'general' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <SettingsIcon size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Configurações Gerais do Sistema</p>
            <p className="text-sm">Em breve nesta área você poderá configurar dados da empresa, impostos, entre outros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
