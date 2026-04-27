import React, { useState, useEffect } from 'react';
import { X, Info, BookOpen, Target, Search, Clock, Monitor, MapPin } from 'lucide-react';
import { supabase } from '../createClient';

const UniversityDetailModal = ({ isOpen, onClose, university }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');

  useEffect(() => {
    if (isOpen && university) {
      fetchPrograms();
    }
  }, [isOpen, university]);

  const fetchPrograms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('university_id', university.id);
    
    if (!error && data) {
      setPrograms(data);
    }
    setLoading(false);
  };

  if (!isOpen || !university) return null;

  const filteredPrograms = programs.filter(p => {
    const programName = p.name || '';
    const programModality = p.modality || '';
    
    const matchesSearch = programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === '' || programModality.toLowerCase() === modalityFilter.toLowerCase();
    
    return matchesSearch && matchesModality;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden border border-purple-100">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-purple-500 to-emerald-400 z-10"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 flex items-center gap-6 border-b border-purple-50 bg-linear-to-b from-purple-50/30 to-transparent shrink-0">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-purple-100 flex items-center justify-center p-2 shrink-0">
            <img 
              src={university.imagen || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Sin+Logo"} 
              alt={university.nombre} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-purple-900 leading-tight">
              {university.nombre}
            </h2>
            <p className="text-emerald-600 font-bold mt-1 text-sm md:text-base flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {university.departamento}
            </p>
          </div>
        </div>

        <div className="flex px-6 md:px-8 border-b border-gray-200 shrink-0 gap-8 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('resumen')}
            className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resumen' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-400'}`}
          >
            <Info className="w-4 h-4" /> Resumen
          </button>
          <button 
            onClick={() => setActiveTab('programas')}
            className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'programas' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-emerald-500'}`}
          >
            <BookOpen className="w-4 h-4" /> Oferta Académica ({programs.length})
          </button>
          <button 
            onClick={() => setActiveTab('mision')}
            className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mision' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-400'}`}
          >
            <Target className="w-4 h-4" /> Misión y Visión
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto grow bg-gray-50/50">
          
          {activeTab === 'resumen' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-3">Acerca de la Institución</h3>
                <p className="text-gray-700 leading-relaxed">
                  {university.descripcion || "Información general no disponible por el momento."}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-purple-50 shadow-sm text-center">
                  <span className="block text-xs font-bold text-purple-400 uppercase mb-1">Nivel</span>
                  <span className="font-extrabold text-gray-800">{university.nivel || 'N/A'}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-purple-50 shadow-sm text-center">
                  <span className="block text-xs font-bold text-purple-400 uppercase mb-1">Sector</span>
                  <span className="font-extrabold text-gray-800">{university.tipo || 'N/A'}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm text-center col-span-2 md:col-span-2">
                  <span className="block text-xs font-bold text-emerald-500 uppercase mb-1">Sitio Web Oficial</span>
                  <a href={university.url} target="_blank" rel="noreferrer" className="font-extrabold text-emerald-700 hover:underline truncate block">
                    {university.url ? university.url.replace('https://', '') : 'No disponible'}
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programas' && (
            <div className="animate-in fade-in duration-300 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
                <div className="relative grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Buscar programa..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                  />
                </div>
                <select 
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium"
                >
                  <option value="">Todas las modalidades</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="A distancia">A Distancia</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : filteredPrograms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                  {filteredPrograms.map(prog => (
                    <div key={prog.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-emerald-200 group">
                      <h4 className="font-extrabold text-gray-800 text-sm mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2" title={prog.name}>
                        {prog.name}
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Target className="w-3 h-3 text-purple-400" /> {prog.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-blue-400" /> {prog.modality}
                        </span>
                        {prog.duration > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-400" /> {prog.duration} semestres
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No se encontraron programas que coincidan con tu búsqueda.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mision' && (
            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-purple-900 mb-3">Misión Institucional</h3>
              <p className="text-gray-700 leading-relaxed italic border-l-4 border-purple-300 pl-4 bg-purple-50/50 py-3 rounded-r-lg">
                Esta institución no ha proporcionado una misión específica en los registros de datos abiertos actuales.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UniversityDetailModal;