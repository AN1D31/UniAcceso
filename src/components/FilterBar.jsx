import React from "react";
import { Search, MapPin, GraduationCap, Target, Landmark, Frown } from "lucide-react";

const FilterBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-1 gap-4 p-4 bg-white shadow-md rounded-2xl w-full"
    >
      <div className="relative">
        <label htmlFor="nombre" className="sr-only">Universidad</label>
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          id="nombre"
          name="nombre"
          placeholder="Universidad..."
          autoComplete="off"
          className="pl-8 border border-gray-300 rounded-lg p-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filters.nombre}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <label htmlFor="departamento" className="sr-only">Departamento</label>
        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          id="departamento"
          name="departamento"
          placeholder="Departamento"
          autoComplete="off"
          className="pl-8 border border-gray-300 rounded-lg p-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filters.departamento}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <label htmlFor="carrera" className="sr-only">Carrera</label>
        <GraduationCap className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          id="carrera"
          name="carrera"
          placeholder="Carrera"
          autoComplete="off"
          className="pl-8 border border-gray-300 rounded-lg p-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filters.carrera}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <label htmlFor="nivel" className="sr-only">Nivel</label>
        <Target className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
        <select
          id="nivel"
          name="nivel"
          className="pl-8 border border-gray-300 rounded-lg p-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filters.nivel}
          onChange={handleChange}
        >
          <option value="">Nivel</option>
          <option value="Pregrado">Pregrado</option>
          <option value="Posgrado">Posgrado</option>
        </select>
      </div>

      <div className="relative">
        <label htmlFor="tipo" className="sr-only">Tipo</label>
        <Landmark className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" aria-hidden="true" />
        <select
          id="tipo"
          name="tipo"
          className="pl-8 border border-gray-300 rounded-lg p-2 w-full
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filters.tipo}
          onChange={handleChange}
        >
          <option value="">Tipo</option>
          <option value="Pública">Pública</option>
          <option value="Privada">Privada</option>
        </select>
      </div>
    </form>
  );
};

export const NoResults = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
    <Frown className="w-10 h-10 mb-4" aria-hidden="true" />
    <p className="text-lg font-medium">No se encontraron universidades con esos filtros.</p>
    <p className="text-sm">Prueba ajustando los campos o usando menos filtros.</p>
  </div>
);

export default FilterBar;