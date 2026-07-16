import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Edit, Trash2, Plus, User, Shield } from 'lucide-react';
import { User as UserType } from '../../types';

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'STOCK', active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (id: string) => {
    const item = users.find(i => i.id === id);
    if (item) {
      setForm({ 
        name: item.name,
        email: item.email,
        password: '', // do not show password on edit
        role: item.role,
        active: item.active
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja inativar este usuário?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Erro ao inativar usuário.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
      } else {
        if (!form.password) {
          alert('Senha é obrigatória para novos usuários.');
          return;
        }
        await api.post('/users', form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', email: '', password: '', role: 'STOCK', active: true });
      fetchUsers();
    } catch (error: any) {
      alert('Erro ao salvar: ' + (error.response?.data?.message || 'Erro desconhecido'));
    }
  };

  const roleLabels: Record<string, string> = {
    'ADMIN': 'Administrador',
    'MANAGER': 'Gerente',
    'PRODUCTION': 'Produção',
    'PURCHASING': 'Compras',
    'SALES': 'Vendas',
    'STOCK': 'Estoque',
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Gestão de Usuários</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md font-bold text-sm transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Plus size={16} /> Novo Usuário
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil (Role)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {users.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                          <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {item.role === 'ADMIN' && <Shield size={14} className="text-amber-500" />}
                        {roleLabels[item.role] || item.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item.id)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                      {item.active && (
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900" title="Inativar usuário"><Trash2 size={18} /></button>
                      )}
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha {editingId && <span className="text-xs text-slate-400 font-normal">(Deixe em branco para manter)</span>}</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required={!editingId} minLength={6} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
              <select name="role" value={form.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="PRODUCTION">Produção</option>
                <option value="PURCHASING">Compras</option>
                <option value="SALES">Vendas</option>
                <option value="STOCK">Estoque</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} id="active-checkbox" className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded" />
              <label htmlFor="active-checkbox" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Usuário Ativo no Sistema
              </label>
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
