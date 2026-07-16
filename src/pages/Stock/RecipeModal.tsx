import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function RecipeModal({ product, onClose }: { product: any, onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/raw-materials');
        setRawMaterials(data.data);
        
        // Initial setup from product.recipeItems
        if (product.recipeItems) {
          setItems(product.recipeItems.map((r: any) => ({
            rawMaterialId: r.rawMaterialId,
            quantity: r.quantity
          })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [product]);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { rawMaterialId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const payload = {
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity)
        })).filter(i => i.rawMaterialId)
      };
      
      await api.put(`/products/${product.id}/recipe`, payload);
      alert('Ficha técnica salva com sucesso!');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar ficha técnica.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ficha Técnica: {product.name}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-500">Carregando...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">Adicione as matérias-primas e a quantidade necessária para produzir 1 unidade deste produto.</p>
              
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Matéria Prima</label>
                    <select
                      value={item.rawMaterialId}
                      onChange={(e) => handleItemChange(index, 'rawMaterialId', e.target.value)}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"
                    >
                      <option value="">Selecione...</option>
                      {rawMaterials.map(rm => (
                        <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Quantidade</label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border"
                    />
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="p-2 mb-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                className="mt-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/80">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors uppercase tracking-wider">
            Salvar Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  );
}
