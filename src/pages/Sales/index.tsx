import React, { useState } from 'react';
import Customers from './Customers';
import SalesOrders from './SalesOrders';
import { Users, ShoppingCart } from 'lucide-react';

export default function SalesIndex() {
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('orders');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'orders' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <ShoppingCart size={16} /> Pedidos de Venda
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'customers' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Users size={16} /> Clientes
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[500px]">
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'orders' && <SalesOrders />}
      </div>
    </div>
  );
}
