/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockIndex from './pages/Stock';
import PurchasingIndex from './pages/Purchasing';
import ProductionIndex from './pages/Production';
import SalesIndex from './pages/Sales';
import SettingsIndex from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="compras" element={<PurchasingIndex />} />
          <Route path="estoque" element={<StockIndex />} />
          <Route path="producao" element={<ProductionIndex />} />
          <Route path="vendas" element={<SalesIndex />} />
          <Route path="configuracoes" element={<SettingsIndex />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
