import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import RouteTable from './components/RouteTable';
import NewRouteModal from './components/NewRouteModal';
import { Route } from './types';
import { Plus } from 'lucide-react';

function App() {
  const [view, setView] = useState<'bus' | 'tram'>('bus');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const loadRoutes = async () => {
    try {
      const data = await window.api.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error('Failed to load routes:', err);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleAddRoute = async (route: Route) => {
    try {
      if (route.id && routes.find((r) => r.id === route.id)) {
        await window.api.updateRoute(route);
      } else {
        await window.api.addRoute(route);
      }
      await loadRoutes();
    } catch (err) {
      console.error('Failed to save route:', err);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await window.api.deleteRoute(id);
        await loadRoutes();
      } catch (err) {
        console.error('Failed to delete route:', err);
      }
    }
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const result = await window.api.exportData();
      if (result.success) {
        alert(`Export successful to: ${result.path}`);
      } else if (result.message !== 'Cancelled') {
        alert(`Export failed: ${result.message}`);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar
        currentView={view}
        onChangeView={setView}
        onExport={handleExport}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Content Area */}
        <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {view === 'bus' ? 'Bus Routes' : 'Tram Routes'}
          </h2>
          <button
            onClick={() => {
              setEditingRoute(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
        </div>

        <RouteTable
          routes={routes}
          type={view}
          onDelete={handleDeleteRoute}
          onEdit={handleEditRoute}
        />
      </main>

      <NewRouteModal
        isOpen={isModalOpen}
        currentType={view}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoute(null);
        }}
        onSave={handleAddRoute}
        routeToEdit={editingRoute}
      />
    </div>
  );
}

export default App;
