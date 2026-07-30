import React from "react";
import { MapPin, GraduationCap, Target, Landmark, ExternalLink, Edit, Trash2 } from "lucide-react";

const UniversityCard = ({ university, isAdmin, onEdit, onDelete, onViewDetails }) => {
  const getValidUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url.trim()}`;
  };

  return (
    <article className="relative h-full bg-white border border-gray-200 flex flex-col">
      <div className="h-32 w-full bg-white flex items-center justify-center p-4 border-b border-gray-200 shrink-0">
        <img
          src={university.imagen || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Sin+Logo"}
          alt={`Logo ${university.nombre}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h2 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 leading-tight">
          {university.nombre}
        </h2>

        <ul className="space-y-3 mb-5 grow">
          <li className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{university.departamento}</span>
          </li>

          {university.carreras > 0 && (
            <li className="flex items-start gap-3">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">
                {university.carreras} {university.carreras === 1 ? 'programa ofertado' : 'programas ofertados'}
              </span>
            </li>
          )}

          <li className="flex items-center gap-3">
            <Target className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">{university.nivel || 'Pregrado'}</span>
          </li>

          <li className="flex items-center gap-3">
            <Landmark className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">{university.tipo || 'Pública'}</span>
          </li>
        </ul>

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => onViewDetails(university)}
            className="flex items-center justify-center w-full py-2.5 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors"
          >
            Ver oferta y detalles
          </button>

          <a
            href={getValidUrl(university.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-2.5 bg-white text-gray-700 hover:bg-gray-50 font-semibold rounded-sm border border-gray-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Visitar sitio web oficial
          </a>
        </div>

        {isAdmin && (
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 mt-4">
            <button onClick={() => onDelete(university.id, university.imagen)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors">
              <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
            </button>
            <button onClick={() => onEdit(university)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors">
              <Edit className="w-4 h-4 mr-1.5" /> Editar
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default UniversityCard;