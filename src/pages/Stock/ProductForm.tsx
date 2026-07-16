import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ProductForm({ productId, onSaved }: { productId: string | null, onSaved: () => void }) {
  const [formData, setFormData] = useState<any>({
    sku: '', internalCode: '', barcode: '', name: '', description: '',
    categoryId: '', brand: '', collectionId: '', model: '', typeId: '',
    color: '', size: '', supplier: '', costPrice: 0, salePrice: 0,
    weight: 0, minStock: 0, maxStock: 0, location: '', status: 'ACTIVE', observations: ''
  });
  const [image, setImage] = useState<File | null>(null);
  
  const [refs, setRefs] = useState<{categories: any[], collections: any[], sockTypes: any[]}>({
    categories: [], collections: [], sockTypes: []
  });

  useEffect(() => {
    const fetchRefs = async () => {
      const { data } = await api.get('/references');
      setRefs({
        categories: data.data.categories,
        collections: data.data.collections,
        sockTypes: data.data.sockTypes
      });
      
      // select first by default if empty
      setFormData(prev => ({
        ...prev,
        categoryId: prev.categoryId || (data.data.categories[0]?.id || ''),
        typeId: prev.typeId || (data.data.sockTypes[0]?.id || '')
      }));
    };
    fetchRefs();
  }, []);

  useEffect(() => {
    if (productId) {
      api.get(`/products?search=`).then(({ data }) => {
        const prod = data.data.products.find((p: any) => p.id === productId);
        if (prod) {
          // Keep only non-null values for form fields
          const cleanProd = Object.keys(prod).reduce((acc: any, key) => {
            acc[key] = prod[key] !== null ? prod[key] : '';
            return acc;
          }, {});
          setFormData(cleanProd);
        }
      });
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if(key !== 'image' && key !== 'imageUrl' && key !== 'stockItems' && key !== 'category' && key !== 'collection' && key !== 'sockType' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'id' && key !== 'margin' && key !== 'currentStock') {
        payload.append(key, formData[key] === '' ? '' : String(formData[key]));
      }
    });
    if (image) {
      payload.append('image', image);
    }

    try {
      if (productId) {
        await api.put(`/products/${productId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSaved();
    } catch (error: any) {
      alert('Erro ao salvar: ' + (error.response?.data?.message || 'Erro desconhecido'));
      console.error(error.response?.data?.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{productId ? 'Editar Produto' : 'Novo Produto'}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1 lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">SKU</label>
          <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cód. Interno</label>
          <input type="text" name="internalCode" value={formData.internalCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
            {refs.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo (Modelo)</label>
          <select name="typeId" value={formData.typeId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
            {refs.sockTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Coleção</label>
          <select name="collectionId" value={formData.collectionId} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border">
            <option value="">Nenhuma</option>
            {refs.collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cód. Barras</label>
          <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preço de Custo</label>
          <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preço de Venda</label>
          <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estoque Mínimo</label>
          <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estoque Máximo</label>
          <input type="number" name="maxStock" value={formData.maxStock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tamanho</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedor</label>
          <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Foto</label>
          <input type="file" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 border" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={onSaved} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors uppercase tracking-wider">
          Salvar Produto
        </button>
      </div>
    </form>
  );
}
