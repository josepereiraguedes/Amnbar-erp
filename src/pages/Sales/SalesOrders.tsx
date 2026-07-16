import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SalesOrder, Customer, Product } from '../../types';
import { Plus, CheckCircle, Truck, Package, XCircle, FileText, Trash2 } from 'lucide-react';

export default function SalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    orderNumber: `PED-${Math.floor(Date.now() / 1000)}`,
    customerId: '',
    discount: 0,
    paymentMethod: 'PIX',
    notes: '',
    items: [] as { productId: string; quantity: number; unitPrice: number }[]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ords, custs, prods] = await Promise.all([
        api.get('/sales'),
        api.get('/customers?search='),
        api.get('/products?limit=1000')
      ]);
      setOrders(ords.data.data);
      setCustomers(custs.data.data);
      setProducts(prods.data.data.products);
      
      if (custs.data.data.length > 0) {
        setForm(f => ({ ...f, customerId: custs.data.data[0].id }));
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
      await api.patch(`/sales/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, { productId: products[0].id, quantity: 1, unitPrice: products[0].salePrice || 0 }]
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...form.items];
    
    // Auto-update price when product changes
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = product.salePrice || 0;
      }
    }
    
    newItems[index] = { ...newItems[index], [field]: value };
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const calculateSubtotal = () => {
    return form.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }
    
    try {
      await api.post('/sales', form);
      setShowForm(false);
      setForm({
        orderNumber: `PED-${Math.floor(Date.now() / 1000)}`,
        customerId: customers.length > 0 ? customers[0].id : '',
        discount: 0,
        paymentMethod: 'PIX',
        notes: '',
        items: []
      });
      fetchData();
    } catch (error: any) {
      alert('Erro ao criar Pedido: ' + (error.response?.data?.message || 'Erro desconhecido'));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div>
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Pedidos de Venda</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md font-bold text-sm transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Plus size={16} /> Novo Pedido
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Liq.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{order.orderNumber}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {order.customer?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.netAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                        ${order.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-700' : 
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.status === 'DRAFT' ? 'Rascunho' : 
                         order.status === 'CONFIRMED' ? 'Confirmado' : 
                         order.status === 'SHIPPED' ? 'Enviado' : 
                         order.status === 'DELIVERED' ? 'Entregue' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(order.status === 'DRAFT' || order.status === 'CONFIRMED') && (
                        <button onClick={() => handleStatusChange(order.id, 'SHIPPED')} title="Marcar como Enviado" className="text-indigo-600 hover:text-indigo-900 mr-3"><Truck size={18} /></button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} title="Marcar como Entregue" className="text-green-600 hover:text-green-900 mr-3"><Package size={18} /></button>
                      )}
                      {(order.status === 'DRAFT' || order.status === 'CONFIRMED') && (
                        <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} title="Cancelar Pedido" className="text-red-600 hover:text-red-900"><XCircle size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum pedido encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Novo Pedido de Venda</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número do Pedido</label>
              <input type="text" value={form.orderNumber} onChange={e => setForm({...form, orderNumber: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border font-mono" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
              <select value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type === 'WHOLESALE' ? 'Atacado' : 'Varejo'})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
                <option value="PIX">PIX</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="BOLETO">Boleto</option>
                <option value="CASH">Dinheiro</option>
              </select>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Itens do Pedido</h3>
              <button type="button" onClick={handleAddItem} className="px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded text-xs font-bold transition-colors uppercase flex items-center gap-1">
                <Plus size={14} /> Adicionar Produto
              </button>
            </div>
            
            {form.items.length === 0 && (
              <p className="text-sm text-slate-500 italic mb-4">Nenhum produto adicionado ao pedido.</p>
            )}

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 md:items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Produto</label>
                    <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} required className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1.5 border">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Estoque: {p.currentStock}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Quantidade</label>
                    <input type="number" step="1" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1.5 border" />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Preço Un. (R$)</label>
                    <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} required className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1.5 border" />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Total</label>
                    <div className="mt-1 px-2 py-1.5 text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 rounded border border-transparent">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                  <div className="pt-0 md:pt-5">
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações do Pedido</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
            </div>
            
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500 dark:text-slate-400">Desconto:</span>
                <input type="number" step="0.01" min="0" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="w-24 text-right rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-2 py-1 border" />
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="font-bold text-slate-900 dark:text-white">TOTAL:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatCurrency(calculateSubtotal() - form.discount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={18} /> Confirmar Pedido
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
