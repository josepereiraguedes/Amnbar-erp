import React, { useState } from 'react';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import Movements from './Movements';
import { Package, Plus, ArrowRightLeft } from 'lucide-react';

export default function StockIndex() {
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'movements'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingProductId(id);
    setActiveTab('new');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('list'); setEditingProductId(null); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'list' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Package size={16} /> Produtos
        </button>
        <button
          onClick={() => { setActiveTab('new'); if(editingProductId) setEditingProductId(null); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'new' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Plus size={16} /> {editingProductId ? 'Editar Produto' : 'Novo Produto'}
        </button>
        <button
          onClick={() => { setActiveTab('movements'); setEditingProductId(null); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'movements' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <ArrowRightLeft size={16} /> Movimentações
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[500px]">
        {activeTab === 'list' && <ProductsList onEdit={handleEdit} />}
        {activeTab === 'new' && <ProductForm productId={editingProductId} onSaved={() => setActiveTab('list')} />}
        {activeTab === 'movements' && <Movements />}
      </div>
    </div>
  );
}
