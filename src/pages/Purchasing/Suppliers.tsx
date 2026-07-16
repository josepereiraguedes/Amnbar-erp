import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Truck } from 'lucide-react';
import { api } from '../../lib/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', document: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', contact: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers', { params: { search } });
      setSuppliers(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post('/suppliers', form);
      }
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar fornecedor.');
    }
  };

  const handleEdit = (id: string) => {
    const item = suppliers.find(c => c.id === id);
    if (item) {
      setForm({ 
        name: item.name, document: item.document || '', email: item.email || '', phone: item.phone || '', 
        address: item.address || '', city: item.city || '', state: item.state || '', zipCode: item.zipCode || '', contact: item.contact || ''
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        loadData();
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir. Verifique se o fornecedor está vinculado a algum produto ou pedido.');
      }
    }
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <button
              onClick={() => { setForm({ name: '', document: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', contact: '' }); setEditingId(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors"
            >
              <Plus size={20} /> Novo Fornecedor
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Local</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {suppliers.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3">
                          <Truck size={16} className="text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{item.document || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">{item.contact || '-'}</div>
                      <div className="text-xs text-slate-500">{item.email || '-'} / {item.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">{item.city || '-'} {item.state ? `/ ${item.state}` : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item.id)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum fornecedor encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Razão Social / Nome</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CNPJ / CPF</label>
              <input type="text" name="document" value={form.document} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa de Contato</label>
              <input type="text" name="contact" value={form.contact} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Endereço (Rua, Número, Bairro)</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado (UF)</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
              <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
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
