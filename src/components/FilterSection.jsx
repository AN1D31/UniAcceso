import React from "react";
import { Search, MapPin, GraduationCap, Target, Landmark, XCircle } from "lucide-react";

const FilterSection = ({ filters, setFilters, handleResetFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const inputClasses = "w-full pl-10 p-3 bg-white border border-purple-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-gray-700 font-medium";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
          <input
            type="text"
            name="nombre"
            placeholder="Universidad..."
            value={filters.nombre}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
          <input
            type="text"
            name="departamento"
            placeholder="Departamento"
            value={filters.departamento}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
          <input
            type="text"
            name="carrera"
            placeholder="Carrera"
            value={filters.carrera}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5 z-10" />
          <select
            name="nivel"
            value={filters.nivel}
            onChange={handleChange}
            className={`${inputClasses} appearance-none`}
          >
            <option value="">Cualquier Nivel</option>
            <option value="Pregrado">Pregrado</option>
            <option value="Posgrado">Posgrado</option>
          </select>
        </div>

        <div className="relative">
          <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5 z-10" />
          <select
            name="tipo"
            value={filters.tipo}
            onChange={handleChange}
            className={`${inputClasses} appearance-none`}
          >
            <option value="">Cualquier Tipo</option>
            <option value="Pública">Pública</option>
            <option value="Privada">Privada</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-500 font-bold rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
        >
          <XCircle className="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FilterSection;