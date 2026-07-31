import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../createClient";
import { GraduationCap, Star, Trophy, Edit, Trash2 } from "lucide-react";
import FilterSection from "../components/FilterSection";
import Results from "../components/Results";
import AdminAddButton from "../components/AdminAddButton";

const ExplorarPage = () => {
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({ nombre: "", departamento: "", nivel: "", tipo: "" });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeModal, setTypeModal] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    id: '', name: '', description: '', department: '', career_count: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', website_url: '', is_top: false, image_url: '', mision_y_vision: '', source_metadata: {}
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
        carreras: uni.career_count || 0,
        nivel: uni.level, tipo: uni.type, ranking: uni.ranking,
        tags: uni.tags || '', imagen: uni.image_url, url: uni.website_url, is_top: uni.is_top,
        source_metadata: uni.source_metadata || {}
      }));
      setUniversities(mapped);
      setFilteredData(mapped);
    } else if (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
    }
  }

  // Convierte cadenas vacías a null: columnas numéricas, FK y con UNIQUE
  // no deben recibir '' — Postgres las trata como un valor real, no como ausencia.
  const nullIfEmpty = (value) => (value === undefined || value === null || String(value).trim() === '') ? null : value;

  const handleCreateOrUpdateUniversity = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `uni_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('universities').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from('universities').getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }

      // Ranking es INTEGER en la BD (CHECK 1-1000): se limpia a solo dígitos.
      const rankingDigits = String(formData.ranking).replace(/[^0-9]/g, '');

      // Payload alineado a las columnas reales de `universities`
      const payloadLimpio = {
        name: formData.name,
        description: nullIfEmpty(formData.description),
        department: nullIfEmpty(formData.department),
        career_count: nullIfEmpty(formData.career_count) === null ? null : parseInt(formData.career_count, 10),
        level: formData.level,
        type: formData.type,
        ranking: rankingDigits === '' ? null : parseInt(rankingDigits, 10),
        // tags es un Array (text[]): '' o vacío se envía como null, no como []
        tags: (() => {
          const arr = typeof formData.tags === 'string'
            ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            : (formData.tags || []);
          return arr.length ? arr : null;
        })(),
        website_url: nullIfEmpty(formData.website_url),
        is_top: formData.is_top,
        image_url: nullIfEmpty(imageUrl),
        // Sin selector de país/ciudad en este formulario todavía: se envían explícitos como null.
        country_id: null,
        city_id: null,
        // No existe columna mision_y_vision en la BD: se guarda dentro del jsonb
        // source_metadata, preservando cualquier otra clave que ya tuviera.
        source_metadata: { ...(formData.source_metadata || {}), mision_y_vision: nullIfEmpty(formData.mision_y_vision) },
      };

      let error;
      if (typeModal === 'crear') {
        const { error: insertError } = await supabase.from('universities').insert(payloadLimpio);
        error = insertError;
      } else if (typeModal === 'editar') {
        const { error: updateError } = await supabase.from('universities').update(payloadLimpio).eq('id', Number(formData.id));
        error = updateError;
      }

      if (error) throw error;

      fetchUniversities();
      setTypeModal(null);
      setFile(null);
      setFormData({ id: '', name: '', description: '', department: '', career_count: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', website_url: '', is_top: false, image_url: '', mision_y_vision: '', source_metadata: {} });
    } catch (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
      alert("No se pudo guardar la universidad. Revisa la consola para más detalles.");
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
      career_count: uni.carreras,
      level: uni.nivel,
      type: uni.tipo,
      ranking: uni.ranking || '',
      tags: Array.isArray(uni.tags) ? uni.tags.join(', ') : (uni.tags || ''),
      website_url: validUrl,
      is_top: uni.is_top,
      image_url: uni.imagen,
      mision_y_vision: uni.source_metadata?.mision_y_vision || '',
      source_metadata: uni.source_metadata || {}
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
    <main className="min-h-screen bg-white pt-8 pb-10 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto text-center mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
          Explora la Excelencia
        </h1>
      </div>

      <section className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {isAdmin && (
          <div className="h-full">
            <AdminAddButton 
              onClick={() => {
                setFormData({ id: '', name: '', description: '', department: '', career_count: 0, level: 'Pregrado', type: 'Pública', ranking: '', tags: '', website_url: '', is_top: false, image_url: '', mision_y_vision: '', source_metadata: {} });
                setTypeModal('crear');
              }}
              label="Registrar Universidad" 
              description="Añade nuevas instituciones al directorio global." 
            />
          </div>
        )}

        {topUniversities.map((uni) => (
          <div key={uni.id} className="relative h-full bg-white border border-gray-200 flex flex-col outline-none">
            <div className="h-48 w-full bg-white flex items-center justify-center p-8 border-b border-gray-200 relative overflow-hidden">
              <img src={uni.imagen || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Sin+Logo"} alt={`Logo ${uni.nombre}`} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-6 flex flex-col grow">
              <div className="flex items-start mb-3">
                <div className="bg-gray-100 p-2 rounded-sm mr-3 shrink-0 border border-gray-200">
                  <GraduationCap className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">{uni.nombre}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed grow line-clamp-3">{uni.descripcion}</p>
              <div className="flex items-center justify-between mb-4 bg-white px-4 py-2.5 rounded-sm border border-gray-200">
                <div className="flex items-center text-gray-700">
                  <Trophy className="w-4 h-4 mr-2" /> <span className="font-semibold">{uni.ranking || 'N/A'}</span>
                </div>
                <Star className="w-5 h-5 text-gray-300" />
              </div>

              <div className="mt-auto flex flex-col gap-2 w-full mb-3">
                <Link
                  to={`/universidades/${uni.id}`}
                  className="flex items-center justify-center w-full py-2.5 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors"
                >
                  Ver oferta y detalles
                </Link>
              </div>

              {isAdmin && (
                <div className="flex justify-between gap-3 pt-3 border-t border-gray-200 mt-auto">
                  <button onClick={() => deleteUniversity(uni.id, uni.imagen)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                  </button>
                  <button onClick={() => displayUniversityForEdit(uni)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors">
                    <Edit className="w-4 h-4 mr-1.5" /> Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200">
          <div className="p-6 md:p-8">
            <div className="text-center mb-6 max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Directorio Completo</h2>
            </div>
            <div className="bg-gray-50 p-4 md:p-6 border border-gray-200">
              <FilterSection filters={filters} setFilters={setFilters} handleResetFilters={handleResetFilters} />
            </div>
            <div className="mt-6">
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
              />
            </div>
          </div>
        </div>
      </section>

      {typeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto border border-gray-200">
            <button onClick={() => setTypeModal(null)} className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 font-bold">&times;</button>
            <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">
              {typeModal === 'crear' ? 'Registrar Universidad' : 'Editar Universidad'}
            </h2>

            <form onSubmit={handleCreateOrUpdateUniversity} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre Institución" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" required />

              <div className="col-span-2 border border-gray-300 p-3 rounded-sm bg-gray-50">
                <label className="text-xs text-gray-700 font-semibold uppercase mb-2 block">Logo / Escudo</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-purple-100 file:text-purple-700 cursor-pointer" />
              </div>

              <input type="text" placeholder="Departamento (Ej. Antioquia)" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" required />
              <input type="number" min="1" max="1000" placeholder="Ranking (Ej. 1)" value={formData.ranking} onChange={e=>setFormData({...formData, ranking: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" />

              <select value={formData.level} onChange={e=>setFormData({...formData, level: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 bg-white">
                <option value="Pregrado">Pregrado</option>
                <option value="Posgrado">Posgrado</option>
              </select>
              <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 bg-white">
                <option value="Pública">Pública</option>
                <option value="Privada">Privada</option>
              </select>

              <textarea placeholder="Descripción general" rows="2" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 resize-none" required />

              <label className="col-span-2 text-sm font-semibold text-gray-700">Misión y Visión</label>
              <textarea placeholder="Misión y visión institucional" rows="3" value={formData.mision_y_vision} onChange={e=>setFormData({...formData, mision_y_vision: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 resize-none" />

              <label className="col-span-2 text-sm font-semibold text-gray-700">Cantidad de Programas Ofertados</label>
              <input type="number" placeholder="Ej. 45" value={formData.career_count} onChange={e=>setFormData({...formData, career_count: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600" required />

              <input type="text" placeholder="Etiquetas Destacadas (Ej. Pública, Ciencias)" value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 text-sm" />
              <input type="url" placeholder="Sitio Web Oficial" value={formData.website_url} onChange={e=>setFormData({...formData, website_url: e.target.value})} className="col-span-2 p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600" required />

              <label className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-sm border border-gray-200 cursor-pointer">
                <input type="checkbox" checked={formData.is_top} onChange={e=>setFormData({...formData, is_top: e.target.checked})} className="w-5 h-5 text-purple-700 rounded-sm focus:ring-purple-600" />
                <span className="font-semibold text-gray-800">¿Es Universidad Destacada?</span>
              </label>

              <button type="submit" className="col-span-2 bg-purple-700 text-white font-semibold py-3.5 rounded-sm hover:bg-purple-800 transition-colors mt-2">
                {typeModal === 'crear' ? 'Guardar Universidad' : 'Actualizar Universidad'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ExplorarPage;