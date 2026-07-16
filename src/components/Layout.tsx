import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { 
  LayoutDashboard, 
  Package, 
  Factory, 
  ShoppingCart,
  ShoppingBag,
  Settings, 
  LogOut,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { user, token, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Produção', path: '/producao', icon: Factory },
    { name: 'Compras', path: '/compras', icon: ShoppingBag },
    { name: 'Vendas', path: '/vendas', icon: ShoppingCart },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-lg">A</div>
              <span className="text-white font-bold text-xl tracking-tight uppercase">Ambar <span className="text-amber-500">ERP</span></span>
            </div>
          )}
          {collapsed && (
             <div className="w-8 h-8 mx-auto bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-lg">A</div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-amber-500/10 text-amber-500" 
                    : "text-slate-400 hover:text-white"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className={cn("flex items-center justify-between", collapsed ? "px-0 justify-center" : "px-2")}>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold tracking-wider">
                 {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
               </div>
               {!collapsed && (
                 <div className="flex flex-col overflow-hidden">
                   <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                   <span className="text-xs text-slate-500 truncate">{user?.role}</span>
                 </div>
               )}
            </div>
            {!collapsed && (
              <button onClick={logout} className="p-2 text-slate-500 hover:text-amber-500 rounded-md hover:bg-slate-800 transition-colors" title="Sair">
                <LogOut size={20} />
              </button>
            )}
          </div>
          {collapsed && (
            <button onClick={logout} className="mt-4 w-full flex justify-center p-2 text-slate-500 hover:text-amber-500 rounded-md hover:bg-slate-800 transition-colors" title="Sair">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
             <button onClick={() => setCollapsed(!collapsed)} className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
               <Menu size={20} />
             </button>
             <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
               {navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'Visão Geral da Fábrica'}
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
               Sistema Online (Local)
             </div>
             <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
