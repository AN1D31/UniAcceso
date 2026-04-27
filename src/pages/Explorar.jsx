import React, { useState, useEffect } from "react";
import { supabase } from "../createClient";
import { GraduationCap, Star, Trophy, Sparkles, Search, Edit, Trash2 } from "lucide-react";
import FilterSection from "../components/FilterSection";
import Results from "../components/Results";
import AdminAddButton from "../components/AdminAddButton";
import UniversityDetailModal from "../components/UniversityDetailModal";

const ExplorarPage = () => {
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({ nombre: "", departamento: "", nivel: "", tipo: "" });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeModal, setTypeModal] = useState(null); 
  const [file, setFile] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '', name: '', description: '', department: '', careers: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', url: '', is_top: false, image_url: ''
  });

  const itemsPerPage = 6;

  useEffect(() => {
    checkAdminRole();
    fetchUniversities();
  }, []);

  async function checkAdminRole() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data && data.role === 'admin') setIsAdmin(true);
    }
  }

  async function fetchUniversities() {
    const { data, error } = await supabase.from('universities').select('*');
    if (!error && data) {
      const mapped = data.map(uni => ({
        id: uni.id, nombre: uni.name, descripcion: uni.description, departamento: uni.department,
        carreras: uni.careers || 0,
        nivel: uni.level, tipo: uni.type, ranking: uni.ranking,
        tags: uni.tags || '', imagen: uni.image_url, url: uni.url, is_top: uni.is_top
      }));
      setUniversities(mapped);
      setFilteredData(mapped);
    }
  }

  const handleCreateOrUpdateUniversity = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;
    
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `uni_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('universities').upload(fileName, file);
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('universities').getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }
    }

    const universityData = {
      name: formData.name,
      description: formData.description,
      department: formData.department,
      careers: parseInt(formData.careers) || 0,
      level: formData.level,
      type: formData.type,
      ranking: formData.ranking,
      tags: typeof formData.tags === 'string' 
            ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") 
            : formData.tags,
      url: formData.url,
      is_top: formData.is_top,
      image_url: imageUrl
    };

    let error;
    if (typeModal === 'crear') {
      const { error: insertError } = await supabase.from('universities').insert(universityData);
      error = insertError;
    } else if (typeModal === 'editar') {
      const { error: updateError } = await supabase.from('universities').update(universityData).eq('id', Number(formData.id));
      error = updateError;
    }

    if (error) {
      console.error("Error al guardar:", error.message);
      alert("No se pudo actualizar: " + error.message);
    } else {
      fetchUniversities();
      setTypeModal(null);
      setFile(null);
      setFormData({ id: '', name: '', description: '', department: '', careers: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', url: '', is_top: false, image_url: '' });
    }
  };

  const deleteUniversity = async (id, imageUrl) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar esta universidad?");
    if (!confirm) return;

    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage.from('universities').remove([fileName]);
    }
    await supabase.from('universities').delete().eq('id', id);
    fetchUniversities();
  };

  const displayUniversityForEdit = (uni) => {
    let validUrl = uni.url || "";
    if (validUrl && !validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl.trim()}`;
    }

    setFormData({
      id: uni.id,
      name: uni.nombre,
      description: uni.descripcion,
      department: uni.departamento,
      careers: uni.carreras,
      level: uni.nivel,
      type: uni.tipo,
      ranking: uni.ranking || '',
      tags: Array.isArray(uni.tags) ? uni.tags.join(', ') : (uni.tags || ''),
      url: validUrl,
      is_top: uni.is_top,
      image_url: uni.imagen
    });
    setTypeModal('editar');
  };

  const handleResetFilters = () => {
    setFilters({ nombre: "", departamento: "", nivel: "", tipo: "" });
  };

  useEffect(() => {
    const isAnyFilterFilled = Object.values(filters).some((value) => value.trim() !== "");
    if (!isAnyFilterFilled) {
      setFilteredData(universities);
      setHasSearched(false);
    } else {
      const results = universities.filter((uni) => {
        const nombreMatch = uni.nombre.toLowerCase().includes(filters.nombre.toLowerCase());
        const deptoMatch = uni.departamento.toLowerCase().includes(filters.departamento.toLowerCase());
        const nivelMatch = filters.nivel === "" || (uni.nivel && uni.nivel.toLowerCase() === filters.nivel.toLowerCase());
        const tipoMatch = filters.tipo === "" || (uni.tipo && uni.tipo.toLowerCase() === filters.tipo.toLowerCase());
        return nombreMatch && deptoMatch && nivelMatch && tipoMatch;
      });
      setFilteredData(results);
      setHasSearched(true);
    }
    setCurrentPage(1);
  }, [filters, universities]);

  const topUniversities = universities.filter(u => u.is_top);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="min-h-screen bg-white pt-10 pb-20 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto text-center mb-14 mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-sm mb-4 shadow-sm border border-purple-200">
          <Sparkles className="w-4 h-4" /> <span>Top Universidades</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-500 mb-6">
          Explora la Excelencia
        </h1>
      </div>

      <section className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-24">
        {isAdmin && (
          <div className="h-full">
            <AdminAddButton 
              onClick={() => {
                setFormData({ id: '', name: '', description: '', department: '', careers: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', url: '', is_top: false, image_url: '' });
                setTypeModal('crear');
              }} 
              label="Registrar Universidad" 
              description="Añade nuevas instituciones al directorio global." 
            />
          </div>
        )}

        {topUniversities.map((uni) => (
          <div key={uni.id} className="relative h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden border border-purple-100 transform transition-all duration-300 hover:-translate-y-2 flex flex-col group outline-none">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-purple-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>
            <div className="h-48 w-full bg-white flex items-center justify-center p-8 border-b border-gray-50 relative overflow-hidden">
              <img src={uni.imagen || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Sin+Logo"} alt={`Logo ${uni.nombre}`} className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-8 flex flex-col grow bg-linear-to-b from-white to-purple-50/30">
              <div className="flex items-start mb-4">
                <div className="bg-emerald-100 p-2.5 rounded-xl mr-4 shrink-0 shadow-sm border border-emerald-200">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-purple-900 leading-tight">{uni.nombre}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed grow line-clamp-3">{uni.descripcion}</p>
              <div className="flex items-center justify-between mb-6 bg-white px-4 py-3 rounded-2xl border border-purple-100 shadow-sm">
                <div className="flex items-center text-emerald-700">
                  <Trophy className="w-5 h-5 mr-2" /> <span className="font-extrabold text-lg">{uni.ranking || 'N/A'}</span>
                </div>
                <Star className="w-6 h-6 text-gray-200 group-hover:text-yellow-400 transition-colors drop-shadow-sm" />
              </div>
              
              <div className="mt-auto flex flex-col gap-2 w-full mb-4">
                <button
                  onClick={() => setSelectedUniversity(uni)}
                  className="flex items-center justify-center w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white font-bold rounded-xl transition-all duration-300 shadow-sm border border-emerald-100"
                >
                  Ver oferta y detalles
                </button>
              </div>

              {isAdmin && (
                <div className="flex justify-between gap-3 pt-4 border-t border-purple-100 mt-auto">
                  <button onClick={() => deleteUniversity(uni.id, uni.imagen)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                  </button>
                  <button onClick={() => displayUniversityForEdit(uni)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 mr-1.5" /> Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="max-w-4xl mx-auto border-t border-purple-200/60 mb-20 relative">
         <div className="absolute left-1/2 -translate-x-1/2 -top-5 bg-white px-4">
            <div className="bg-white p-2 rounded-full shadow-sm border border-purple-100"><Search className="w-6 h-6 text-purple-400" /></div>
         </div>
      </div>

      <section className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden relative">
          <div className="relative z-10 p-8 md:p-14">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 mb-4">Directorio Completo</h2>
            </div>
            <div className="bg-purple-50/50 p-4 md:p-8 rounded-3xl border border-purple-100/50 shadow-inner">
              <FilterSection filters={filters} setFilters={setFilters} handleResetFilters={handleResetFilters} />
            </div>
            <div className="mt-10">
              <Results 
                paginatedData={paginatedData} 
                filteredData={filteredData} 
                hasSearched={hasSearched} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                totalPages={totalPages} 
                isAdmin={isAdmin}
                onEdit={displayUniversityForEdit}
                onDelete={deleteUniversity}
                onViewDetails={(uni) => setSelectedUniversity(uni)}
              />
            </div>
          </div>
        </div>
      </section>

      {typeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setTypeModal(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 font-bold">&times;</button>
            <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-linear-to-r from-purple-700 to-emerald-500 text-center">
              {typeModal === 'crear' ? 'Registrar Universidad' : 'Editar Universidad'}
            </h2>
            
            <form onSubmit={handleCreateOrUpdateUniversity} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre Institución" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="col-span-2 p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
              
              <div className="col-span-2 border border-purple-200 p-3 rounded-xl bg-purple-50/30">
                <label className="text-xs text-purple-700 font-bold uppercase mb-2 block">Logo / Escudo</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-100 file:text-purple-700 cursor-pointer" />
              </div>

              <input type="text" placeholder="Departamento (Ej. Antioquia)" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
              <input type="text" placeholder="Ranking (Ej. #1 QS)" value={formData.ranking} onChange={e=>setFormData({...formData, ranking: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" />
              
              <select value={formData.level} onChange={e=>setFormData({...formData, level: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                <option value="Pregrado">Pregrado</option>
                <option value="Posgrado">Posgrado</option>
              </select>
              <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                <option value="Pública">Pública</option>
                <option value="Privada">Privada</option>
              </select>

              <textarea placeholder="Descripción general" rows="2" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="col-span-2 p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 resize-none" required />
              
              <label className="col-span-2 text-sm font-bold text-purple-800">Cantidad de Programas Ofertados</label>
              <input type="number" placeholder="Ej. 45" value={formData.careers} onChange={e=>setFormData({...formData, careers: e.target.value})} className="col-span-2 p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
              
              <input type="text" placeholder="Etiquetas Destacadas (Ej. Pública, Ciencias)" value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} className="col-span-2 p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-sm" />
              <input type="url" placeholder="Sitio Web Oficial" value={formData.url} onChange={e=>setFormData({...formData, url: e.target.value})} className="col-span-2 p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
              
              <label className="col-span-2 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
                <input type="checkbox" checked={formData.is_top} onChange={e=>setFormData({...formData, is_top: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span className="font-bold text-emerald-800">¿Es Universidad Destacada?</span>
              </label>

              <button type="submit" className="col-span-2 bg-linear-to-r from-purple-600 to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all mt-2">
                {typeModal === 'crear' ? 'Guardar Universidad' : 'Actualizar Universidad'}
              </button>
            </form>
          </div>
        </div>
      )}

      <UniversityDetailModal 
        isOpen={selectedUniversity !== null} 
        onClose={() => setSelectedUniversity(null)} 
        university={selectedUniversity} 
      />
    </main>
  );
};

export default ExplorarPage;