import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function Movements() {
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    productId: '',
    type: 'IN',
    quantity: 1,
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: ''
  });

  const fetchMovements = async () => {
    try {
      const { data } = await api.get('/stock/movements');
      setMovements(data.data.movements);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const [refsRes, prodsRes] = await Promise.all([
        api.get('/references'),
        api.get('/products?limit=1000') // get all for dropdown
      ]);
      setWarehouses(refsRes.data.data.warehouses);
      setProducts(prodsRes.data.data.products);
      
      if (prodsRes.data.data.products.length > 0) {
        setForm(f => ({ ...f, productId: prodsRes.data.data.products[0].id }));
      }
      if (refsRes.data.data.warehouses.length > 0) {
        setForm(f => ({ ...f, toWarehouseId: refsRes.data.data.warehouses[0].id }));
      }
    };
    init();
    fetchMovements();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/stock/movement', form);
      fetchMovements();
      alert('Movimentação registrada com sucesso!');
      setForm(f => ({ ...f, quantity: 1, reason: '' }));
    } catch (error: any) {
      alert('Erro: ' + (error.response?.data?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">Nova Movimentação</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Produto</label>
            <select name="productId" value={form.productId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Tipo de Movimento</label>
            <select name="type" value={form.type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
              <option value="IN">Entrada (+)</option>
              <option value="OUT">Saída (-)</option>
              <option value="TRANSFER">Transferência</option>
              <option value="ADJUSTMENT">Ajuste de Inventário</option>
            </select>
          </div>
          
          {['OUT', 'TRANSFER'].includes(form.type) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Origem</label>
              <select name="fromWarehouseId" value={form.fromWarehouseId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="">Selecione...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
          
          {['IN', 'TRANSFER', 'ADJUSTMENT'].includes(form.type) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Destino</label>
              <select name="toWarehouseId" value={form.toWarehouseId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="">Selecione...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Quantidade</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required min="1" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Motivo / Obs</label>
            <input type="text" name="reason" value={form.reason} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider">
            {loading ? 'Processando...' : 'Registrar'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="lg:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">Histórico Recente</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">De -&gt; Para</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {movements.map(m => (
                <tr key={m.id} className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.product.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${m.type === 'IN' ? 'bg-green-100 text-green-700' : m.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{m.quantity}</td>
                  <td className="px-4 py-3 text-xs">
                    {m.fromWarehouse?.name || '-'} <br/> {m.toWarehouse?.name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
