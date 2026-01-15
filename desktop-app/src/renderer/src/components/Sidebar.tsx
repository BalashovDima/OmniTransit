import { Bus, TramFront, FileUp } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  currentView: 'bus' | 'tram';
  onChangeView: (view: 'bus' | 'tram') => void;
  onExport: () => void;
}

export default function Sidebar({
  currentView,
  onChangeView,
  onExport,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          OmniTransit
        </h1>
        <p className="text-xs text-gray-400 mt-1">Route Manager</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => onChangeView('bus')}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
            currentView === 'bus'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50 shadow-lg shadow-blue-900/20'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <Bus className="w-5 h-5" />
          <span className="font-medium">Bus Routes</span>
        </button>

        <button
          onClick={() => onChangeView('tram')}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
            currentView === 'tram'
              ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50 shadow-lg shadow-purple-900/20'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <TramFront className="w-5 h-5" />
          <span className="font-medium">Tram Routes</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-900/20"
        >
          <FileUp className="w-4 h-4" />
          Export to ESP32
        </button>
      </div>
    </div>
  );
}
