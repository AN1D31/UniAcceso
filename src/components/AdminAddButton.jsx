import React from 'react';
import { Plus } from 'lucide-react';

const AdminAddButton = ({ onClick, label, description }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex flex-col items-center justify-center cursor-pointer h-full min-h-75 w-full"
    >
      <div className="bg-purple-50 text-purple-700 rounded-sm w-12 h-12 flex items-center justify-center mb-3 border border-purple-200">
        <Plus className="w-6 h-6" />
      </div>
      <span className="text-gray-900 font-semibold text-base">
        {label}
      </span>
      {description && (
        <p className="text-gray-500 text-sm mt-2 px-8 text-center">
          {description}
        </p>
      )}
    </div>
  );
};

export default AdminAddButton;