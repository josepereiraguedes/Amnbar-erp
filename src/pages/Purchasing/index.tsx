import React, { useState } from 'react';
import Suppliers from './Suppliers';
import PurchaseOrders from './PurchaseOrders';
import { Truck, ShoppingBag } from 'lucide-react';

export default function PurchasingIndex() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'orders' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <ShoppingBag size={16} /> Pedidos de Compra
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'suppliers' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Truck size={16} /> Fornecedores
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[500px]">
        {activeTab === 'suppliers' && <Suppliers />}
        {activeTab === 'orders' && <PurchaseOrders />}
      </div>
    </div>
  );
}
