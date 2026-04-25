import React from 'react';
import { Plus } from 'lucide-react';

const AdminAddButton = ({ onClick, label, description }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl border-2 border-dashed border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center cursor-pointer group h-full min-h-75 w-full"
    >
      <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shadow-inner">
        <Plus className="w-8 h-8" />
      </div>
      <span className="text-purple-800 font-extrabold text-lg group-hover:text-emerald-700 transition-colors">
        {label}
      </span>
      {description && (
        <p className="text-gray-500 text-sm mt-2 font-medium px-8 text-center">
          {description}
        </p>
      )}
    </div>
  );
};

export default AdminAddButton;