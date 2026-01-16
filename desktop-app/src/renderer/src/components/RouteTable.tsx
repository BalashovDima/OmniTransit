import { useState } from 'react';
import { Route } from '../types';
import { Trash2, Search, Hexagon, Pencil } from 'lucide-react';

interface RouteTableProps {
  routes: Route[];
  type: 'bus' | 'tram';
  onDelete: (id: string) => void;
  onEdit: (route: Route) => void;
}

export default function RouteTable({
  routes,
  type,
  onDelete,
  onEdit,
}: RouteTableProps) {
  const [search, setSearch] = useState('');

  const filteredRoutes = routes.filter(
    (r) =>
      r.type === type && r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header & Search */}
      <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type} routes...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg outline-none transition-all placeholder-gray-500"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filteredRoutes.length} routes found
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Line Cmd</th>
                <th className="px-6 py-4">Dest Cmd</th>
                <th className="px-6 py-4">Sign Text</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr
                    key={route.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {route.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <div className="flex items-center">
                        <span className="text-purple-600 font-bold">l</span>
                        {route.ibisLineCmd.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <div className="flex items-center">
                        <span className="text-blue-600 font-bold">z</span>
                        {route.ibisDestinationCmd.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-gray-700 max-w-xs truncate"
                      title="Sign Text"
                    >
                      {route.alfaSignText}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(route)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Route"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(route.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No routes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
