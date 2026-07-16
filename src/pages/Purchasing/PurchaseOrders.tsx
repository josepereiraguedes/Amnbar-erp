import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Search, Edit, Eye, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    orderNumber: '', supplierId: '', expectedDate: '', notes: '',
    items: [{ rawMaterialId: '', quantity: 1, unitPrice: 0 }]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes, materialsRes] = await Promise.all([
        api.get('/purchasing'),
        api.get('/suppliers'),
        api.get('/raw-materials')
      ]);
      setOrders(ordersRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setRawMaterials(materialsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...form.items];
    (newItems[index] as any)[field] = value;
    
    // Auto-fill price if material is selected
    if (field === 'rawMaterialId') {
      const mat = rawMaterials.find(r => r.id === value);
      if (mat) {
        newItems[index].unitPrice = mat.costPerUnit;
      }
    }
    
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { rawMaterialId: '', quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        expectedDate: form.expectedDate || null,
        items: form.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };
      
      await api.post('/purchasing', payload);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar pedido.');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (confirm(`Mudar status para ${status}?`)) {
      try {
        await api.patch(`/purchasing/${id}/status`, { status });
        loadData();
      } catch (error) {
        console.error(error);
        alert('Erro ao atualizar status.');
      }
    }
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Pedidos de Compra</h2>
            <button
              onClick={() => {
                setForm({
                  orderNumber: `PC-${Date.now().toString().slice(-6)}`, supplierId: '', expectedDate: '', notes: '',
                  items: [{ rawMaterialId: '', quantity: 1, unitPrice: 0 }]
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors"
            >
              <Plus size={20} /> Novo Pedido
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data Esperada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{order.orderNumber}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">{order.supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${order.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {order.status === 'RECEIVED' ? 'Recebido' : order.status === 'CANCELLED' ? 'Cancelado' : order.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {order.status === 'PENDING' && (
                         <button onClick={() => updateStatus(order.id, 'APPROVED')} className="text-blue-600 hover:text-blue-900 mr-3" title="Aprovar"><CheckCircle size={18} /></button>
                       )}
                       {order.status === 'APPROVED' && (
                         <button onClick={() => updateStatus(order.id, 'RECEIVED')} className="text-green-600 hover:text-green-900 mr-3" title="Marcar como Recebido"><CheckCircle size={18} /></button>
                       )}
                       {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                         <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="text-red-600 hover:text-red-900" title="Cancelar"><XCircle size={18} /></button>
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Novo Pedido de Compra</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número do Pedido</label>
              <input type="text" name="orderNumber" value={form.orderNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedor</label>
              <select name="supplierId" value={form.supplierId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Esperada</label>
              <input type="date" name="expectedDate" value={form.expectedDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4">Itens do Pedido</h3>
            
            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Matéria Prima</label>
                    <select
                      value={item.rawMaterialId}
                      onChange={(e) => handleItemChange(index, 'rawMaterialId', e.target.value)}
                      required
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"
                    >
                      <option value="">Selecione...</option>
                      {rawMaterials.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Estoque: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Qtd</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      required
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Unit.</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      required
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Total</label>
                    <div className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-medium">
                      R$ {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              <Plus size={16} /> Adicionar Item
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider">
              Salvar Pedido
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
