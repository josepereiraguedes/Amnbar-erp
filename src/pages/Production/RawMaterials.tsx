import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RawMaterial } from '../../types';
import { Edit, Trash2, Search, Plus } from 'lucide-react';

export default function RawMaterials() {
  const [items, setItems] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', sku: '', type: 'FIOS', supplier: '', unit: 'KG', costPerUnit: 0, currentStock: 0, minStock: 0
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/raw-materials');
      setItems(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setForm({ ...item, sku: item.sku || '', supplier: item.supplier || '' });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/raw-materials/${id}`);
        fetchItems();
      } catch (error) {
        alert('Erro ao excluir.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/raw-materials/${editingId}`, form);
      } else {
        await api.post('/raw-materials', form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', sku: '', type: 'FIOS', supplier: '', unit: 'KG', costPerUnit: 0, currentStock: 0, minStock: 0 });
      fetchItems();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Matérias-Primas</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md font-bold text-sm transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Plus size={16} /> Nova Matéria-Prima
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Custo Un.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{item.sku || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.currentStock <= item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.costPerUnit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item.id)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{editingId ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">SKU / Cód.</label>
              <input type="text" name="sku" value={form.sku} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
              <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="FIOS">Fios</option>
                <option value="ETIQUETAS">Etiquetas</option>
                <option value="EMBALAGENS">Embalagens</option>
                <option value="QUIMICOS">Químicos</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unidade de Medida</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="KG">Quilograma (KG)</option>
                <option value="UN">Unidade (UN)</option>
                <option value="M">Metro (M)</option>
                <option value="L">Litro (L)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedor</label>
              <input type="text" name="supplier" value={form.supplier} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Custo Un. (R$)</label>
              <input type="number" step="0.01" name="costPerUnit" value={form.costPerUnit} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estoque Atual</label>
              <input type="number" step="0.01" name="currentStock" value={form.currentStock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estoque Mínimo</label>
              <input type="number" step="0.01" name="minStock" value={form.minStock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
