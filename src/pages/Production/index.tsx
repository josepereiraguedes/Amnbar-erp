import React, { useState } from 'react';
import RawMaterials from './RawMaterials';
import ProductionOrders from './ProductionOrders';
import { Factory, Component } from 'lucide-react';

export default function ProductionIndex() {
  const [activeTab, setActiveTab] = useState<'raw' | 'orders'>('raw');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'raw' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Component size={16} /> Matérias-Primas
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'orders' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Factory size={16} /> Ordens de Produção
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[500px]">
        {activeTab === 'raw' && <RawMaterials />}
        {activeTab === 'orders' && <ProductionOrders />}
      </div>
    </div>
  );
}
