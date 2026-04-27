import React from "react";
import UniversityCard from "./UniversityCard";
import { Frown, ChevronLeft, ChevronRight } from "lucide-react";

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
  onDelete,
  onViewDetails
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
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
                  onViewDetails={onViewDetails}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-white border border-purple-200 text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400 font-bold">...</span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full font-bold transition-all duration-300 flex items-center justify-center ${
                          currentPage === page
                            ? "bg-linear-to-r from-purple-600 to-emerald-500 text-white shadow-md transform scale-110"
                            : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-white border border-purple-200 text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Results;