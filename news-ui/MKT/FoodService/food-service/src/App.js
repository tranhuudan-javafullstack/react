import React from 'react';
import { BrowserRouter as Router, Route, Routes, HashRouter } from 'react-router-dom';
import Sidebar from './component/Sidebar/Sidebar';
import CategoryList from './component/CategoryList/CategoryList';
import MenuOrder from './component/OrderManagement/MenuOrder/MenuOrder';
import ReceiptTable from './component/RecieptManagement/ReceiptTable';
import Chef from './component/Chef/Chef';
import InvoiceGenerator from './component/Bill/InvoiceGenerator';
import LabelDesigner from './component/Bill/LabelDesigner';
import ExternalbillConfig from './component/Bill/ExternalBillsConfig';
import EditFood from './component/FoodManagement/EditFood/EditFood';

const LayoutWithSidebar = ({ children }) => (
  <div className="App">
    <Sidebar className="sidebar" />
    <div id='content'>
      {children}
    </div>
  </div>
);

const LayoutWithoutSidebar = ({ children }) => (
  <div className="App" style={{ minHeight: '100vh', backgroundColor: '#383854' }}>
    <div className='p-5'>
      {children}
    </div>
  </div>
);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<LayoutWithSidebar>
          <Routes>
            <Route path="/" element={<CategoryList />} />
            <Route path="edit/:foodID" element={<EditFood />} />
            <Route path="order" element={<MenuOrder />} />
            <Route path="recipe-management" element={<ReceiptTable />} />
            <Route path="chef" element={<Chef />} />
            <Route path="bill" element={<InvoiceGenerator />} />
            <Route path="externalbills" element={<ExternalbillConfig />} />
            <Route path="LabelDesigner" element={<LabelDesigner />} />
          </Routes>
        </LayoutWithSidebar>} />
        <Route path="order/:receiptID" element={<LayoutWithoutSidebar><MenuOrder /></LayoutWithoutSidebar>} />
      </Routes>
    </HashRouter>
  );
}

export default App;