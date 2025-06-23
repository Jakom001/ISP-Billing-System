import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="w-full min-h-screen pt-[80px]">
      {/* Main Content Area */}
      <div className="w-full overflow-y-auto">
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;