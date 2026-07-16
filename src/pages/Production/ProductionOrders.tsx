import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ProductionOrder, Product, RawMaterial } from '../../types';
import { Plus, Play, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function ProductionOrders() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    orderNumber: `OP-${Math.floor(Date.now() / 1000)}`,
    productId: '',
    quantity: 1,
    notes: '',
    items: [] as { rawMaterialId: string; quantity: number }[]
  });

  
  const handleProductChange = (newProductId: string) => {
    const product = products.find(p => p.id === newProductId);
    let newItems = form.items;
    
    if (product && product.recipeItems && product.recipeItems.length > 0) {
      newItems = product.recipeItems.map((r: any) => ({
        rawMaterialId: r.rawMaterialId,
        quantity: r.quantity * form.quantity
      }));
    } else {
       newItems = [];
    }
    
    setForm(prev => ({ ...prev, productId: newProductId, items: newItems }));
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty <= 0) return;
    const ratio = newQty / form.quantity;
    
    const newItems = form.items.map(item => ({
      ...item,
      quantity: Number((item.quantity * ratio).toFixed(3))
    }));
    
    setForm(prev => ({ ...prev, quantity: newQty, items: newItems }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ords, prods, rms] = await Promise.all([
        api.get('/production'),
        api.get('/products?limit=1000'),
        api.get('/raw-materials')
      ]);
      setOrders(ords.data.data);
      setProducts(prods.data.data.products);
      setRawMaterials(rms.data.data);
      
      if (prods.data.data.products.length > 0) {
        setForm(f => ({ ...f, productId: prods.data.data.products[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/production/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleAddItem = () => {
    if (rawMaterials.length > 0) {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, { rawMaterialId: rawMaterials[0].id, quantity: 1 }]
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/production', form);
      setShowForm(false);
      setForm({
        orderNumber: `OP-${Math.floor(Date.now() / 1000)}`,
        productId: products[0]?.id || '',
        quantity: 1,
        notes: '',
        items: []
      });
      fetchData();
    } catch (error: any) {
      alert('Erro ao criar OP: ' + (error.response?.data?.message || 'Erro desconhecido'));
    }
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Ordens de Produção</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md font-bold text-sm transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Plus size={16} /> Nova O.P.
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">O.P.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {order.product?.name} ({order.product?.sku})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 font-mono">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                        ${order.status === 'PENDING' ? 'bg-slate-100 text-slate-700' : 
                          order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.status === 'PENDING' ? 'Pendente' : 
                         order.status === 'IN_PROGRESS' ? 'Em Produção' : 
                         order.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')} title="Iniciar Produção" className="text-blue-600 hover:text-blue-900 mr-3"><Play size={18} /></button>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleStatusChange(order.id, 'COMPLETED')} title="Concluir O.P." className="text-green-600 hover:text-green-900 mr-3"><CheckCircle size={18} /></button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                        <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} title="Cancelar O.P." className="text-red-600 hover:text-red-900"><XCircle size={18} /></button>
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Nova Ordem de Produção</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número da O.P.</label>
              <input type="text" value={form.orderNumber} onChange={e => setForm({...form, orderNumber: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Produto a Fabricar</label>
              <select value={form.productId} onChange={e => handleProductChange(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="">Selecione...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade</label>
              <input type="number" min="1" value={form.quantity} onChange={e => handleQuantityChange(Number(e.target.value))} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Consumo de Matéria-Prima</h3>
              <button type="button" onClick={handleAddItem} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded text-xs font-bold transition-colors uppercase">
                + Adicionar Item
              </button>
            </div>
            
            {form.items.length === 0 && (
              <p className="text-sm text-slate-500 italic mb-4">Nenhuma matéria-prima alocada para esta OP.</p>
            )}

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Matéria-Prima</label>
                    <select value={item.rawMaterialId} onChange={e => handleItemChange(index, 'rawMaterialId', e.target.value)} required className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1.5 border">
                      <option value="">Selecione...</option>
                      {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} (Estoque: {rm.currentStock} {rm.unit})</option>)}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Quantidade</label>
                    <input type="number" step="0.01" min="0.01" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1.5 border" />
                  </div>
                  <div className="pt-5">
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider">
              Criar O.P.
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
