import React from "react";
import UniversityCard from "./UniversityCard";
import { Frown } from "lucide-react";

export const NoResults = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
    <Frown className="w-12 h-12 mb-4 text-purple-300" aria-hidden="true" />
    <p className="text-xl font-bold text-purple-800">No se encontraron universidades</p>
    <p className="text-sm font-medium mt-2">Prueba ajustando los campos o usando menos filtros.</p>
  </div>
);

const Results = ({
  paginatedData,
  filteredData,
  hasSearched,
  currentPage,
  setCurrentPage,
  totalPages,
  isAdmin,
  onEdit,
  onDelete
}) => (
  <section aria-live="polite" className="mt-8">
    
    {hasSearched && (
      <div className="flex items-center justify-center mb-8">
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
          Resultados encontrados: {filteredData.length}
        </span>
      </div>
    )}

    {hasSearched && filteredData.length === 0 ? (
      <NoResults />
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {paginatedData.map((uni, idx) => (
            <div key={idx} className="h-full">
              <UniversityCard 
                university={uni} 
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="flex justify-center mt-12 gap-2" role="navigation">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm text-sm font-bold transition-all focus:outline-none ${
                    isActive
                      ? "bg-linear-to-r from-purple-600 to-emerald-500 text-white transform scale-110"
                      : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </nav>
        )}
      </>
    )}
  </section>
);

export default Results;