import React from "react";
import { MapPin, GraduationCap, Target, Landmark, ExternalLink, Edit, Trash2 } from "lucide-react";

const UniversityCard = ({ university, isAdmin, onEdit, onDelete }) => {
  return (
    <article className="relative h-full bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden border border-purple-100 transform transition-all duration-300 hover:-translate-y-2 flex flex-col group">
      
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-purple-500 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity z-20"></div>

      {university.imagen && (
        <div className="h-32 w-full bg-white flex items-center justify-center p-4 border-b border-purple-50 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-purple-50/80 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img 
            src={university.imagen} 
            alt={`Logo ${university.nombre}`} 
            className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}

      <div className="p-6 flex flex-col grow bg-white">
        <h2 className="text-xl font-extrabold text-purple-900 mb-5 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
          {university.nombre}
        </h2>

        <ul className="space-y-3 mb-6 grow">
          <li className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600 font-medium">{university.departamento}</span>
          </li>
          
          {university.carreras && university.carreras.length > 0 && (
            <li className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 font-medium line-clamp-2">{university.carreras.join(", ")}</span>
            </li>
          )}

          <li className="flex items-center gap-3">
            <Target className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-sm text-gray-600 font-medium">{university.nivel}</span>
          </li>

          <li className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-blue-500 shrink-0" />
            <span className="text-sm text-gray-600 font-medium">{university.tipo}</span>
          </li>
        </ul>

        <a
          href={university.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center w-full py-3 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold rounded-xl transition-all duration-300 shadow-sm border border-purple-100 hover:border-purple-600"
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Visitar sitio web
        </a>

        {isAdmin && (
          <div className="flex justify-between gap-3 pt-4 border-t border-purple-100 mt-4">
            <button onClick={() => onDelete(university.id, university.imagen)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
            </button>
            <button onClick={() => onEdit(university)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">
              <Edit className="w-4 h-4 mr-1.5" /> Editar
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default UniversityCard;