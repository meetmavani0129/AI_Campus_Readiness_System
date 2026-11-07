import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ModernBackground from './ModernBackground';

const Layout = ({ children }) => {
  return (
    <ModernBackground>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
            {children}
          </main>
        </div>
      </div>
    </ModernBackground>
  );
};

export default Layout;
