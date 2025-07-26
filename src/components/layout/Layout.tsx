import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-0",
        "lg:w-64" // Always show on large screens
      )}>
        <div className={cn(
          "h-full transition-opacity duration-300",
          !isSidebarOpen && "lg:opacity-100 opacity-0"
        )}>
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}