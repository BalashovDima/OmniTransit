import React, { useState } from 'react';
import { Route } from '../types';
import { X, Save } from 'lucide-react';

interface NewRouteModalProps {
  currentType: 'bus' | 'tram';
  isOpen: boolean;
  onClose: () => void;
  onSave: (route: Route) => void;
}

export default function NewRouteModal({
  currentType,
  isOpen,
  onClose,
  onSave,
}: NewRouteModalProps) {
  const [name, setName] = useState('');
  const [cmd1, setCmd1] = useState('');
  const [cmd2, setCmd2] = useState('');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple ID generation, better usage would be UUID
    const id = Date.now().toString();

    // Parse int (decimal)
    const parseCmd = (val: string) => parseInt(val, 10);

    const newRoute: Route = {
      id,
      type: currentType,
      name,
      ibisLineCmd: parseCmd(cmd1) || 0,
      ibisDestinationCmd: parseCmd(cmd2) || 0,
      alfaSignBytes: new TextEncoder().encode(text),
    };

    onSave(newRoute);
    // Reset
    setName('');
    setCmd1('');
    setCmd2('');
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New {currentType === 'bus' ? 'Bus' : 'Tram'} Route
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Route 101"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Line Cmd
              </label>
              <input
                required
                type="text"
                value={cmd1}
                onChange={(e) => setCmd1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dest Cmd
              </label>
              <input
                required
                type="text"
                value={cmd2}
                onChange={(e) => setCmd2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sign Text
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Destination text..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              Save Route
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
