import { useState } from 'react'
import { Route } from '../types'
import { Trash2, Search, Hexagon } from 'lucide-react'

interface RouteTableProps {
  routes: Route[]
  type: 'bus' | 'tram'
  onDelete: (id: string) => void
}

export default function RouteTable({ routes, type, onDelete }: RouteTableProps) {
  const [search, setSearch] = useState('')

  const filteredRoutes = routes.filter(
    (r) =>
      r.type === type &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.text.toLowerCase().includes(search.toLowerCase()))
  )

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
                <th className="px-6 py-4">Command 1</th>
                <th className="px-6 py-4">Command 2</th>
                <th className="px-6 py-4">Text</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{route.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hexagon className="w-3 h-3 text-purple-400" />
                        0x{route.command1.toString(16).toUpperCase().padStart(2, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hexagon className="w-3 h-3 text-blue-400" />
                        0x{route.command2.toString(16).toUpperCase().padStart(2, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={route.text}>
                      {route.text}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDelete(route.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No routes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
