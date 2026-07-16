import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Factory,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-medium">
        <Activity className="animate-spin mr-2" size={20} /> Carregando visão geral...
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Valor em Estoque</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(data?.totalStockValue || 0)}</h3>
             </div>
             <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
               <DollarSign size={20} />
             </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <TrendingUp size={14} />
            <span>+2.4% vs mês ant.</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Produtos Prontos</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                 {data?.finishedProducts?.toLocaleString('pt-BR') || 0} <span className="text-sm font-normal text-slate-400">pares</span>
               </h3>
             </div>
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
               <Package size={20} />
             </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-5 overflow-hidden">
            <div className="bg-amber-500 h-full w-[78%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Matéria-prima Baixa</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                 {data?.lowStockItems || 0} <span className="text-sm font-normal text-slate-400">itens</span>
               </h3>
             </div>
             <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
               <AlertTriangle size={20} />
             </div>
          </div>
          <p className="text-red-500 text-xs font-semibold mt-4 uppercase tracking-wider">Ação Necessária</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Vendas do Mês</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(data?.monthlySales || 0)}</h3>
             </div>
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg">
               <ShoppingCart size={20} />
             </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Meta: {formatCurrency(120000)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest">Fluxo de Produção vs Vendas</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span> Produção
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></span> Vendas
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 mt-4">
            {/* Mock Chart Bars */}
            {[40, 65, 35, 80, 55, 90, 45, 75, 60, 85].map((h, i) => (
              <div key={i} className={`w-full max-w-[2rem] rounded-t-lg transition-all duration-500 ${i % 2 === 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-amber-500'}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-4">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
          </div>
        </div>

        {/* Alerts / Order Queue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col min-h-[420px]">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest mb-6">
            Ordens Ativas & Notificações
          </h4>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Real Data Alerts */}
            {data?.recentAlerts?.map((alert: any, i: number) => (
              <div key={alert.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400">SYS-{1000 + i}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    alert.type === 'warning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    alert.type === 'error' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{alert.message}</p>
              </div>
            ))}
            
            {/* Adding some mock orders to match the design request aesthetics */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400">OP-4291</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-bold uppercase tracking-wider">Em Curso</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Meia Cano Alto Emoji</p>
              <p className="text-xs text-slate-500 mt-1">Máquina 04 • 500 un</p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400">OP-4290</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-bold uppercase tracking-wider">Pendente</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Meia Social Premium</p>
              <p className="text-xs text-slate-500 mt-1">Máquina 02 • 1200 un</p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400">OP-4288</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full font-bold uppercase tracking-wider">Revisão</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Meia Esportiva Branca</p>
              <p className="text-xs text-slate-500 mt-1">Expedição • 2000 un</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Utility Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4">
        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-slate-400 font-medium italic">
          <span>Último backup: Hoje 08:32</span>
          <span>Banco de Dados: SQLite local ativo</span>
          <span>Instância ERP Conectada</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-all text-center">
            Nova OP
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg shadow-md hover:bg-amber-400 transition-all text-center">
            Lançar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
