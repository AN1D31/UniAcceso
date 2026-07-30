import { useState, useEffect } from "react";
import { supabase } from "../createClient";
import { MapPin, Calendar, ExternalLink, Edit, Trash2, Plus, Search, Frown } from "lucide-react";
import '../App.css';

const Scholarships = () => {

  const [scholarships, setScholarships] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [scholarship, setScholarship] = useState({
    name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', university_id: '', image_url: ''
  });
  const [scholarship2, setScholarship2] = useState({
    id: '', name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', university_id: '', image_url: ''
  });

  const [typeModal, setTypeModal] = useState(null);
  const [file, setFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Convierte cadenas vacías a null: columnas numéricas, FK y con UNIQUE
  // no deben recibir '' — Postgres las trata como un valor real, no como ausencia.
  const nullIfEmpty = (value) => (value === undefined || value === null || String(value).trim() === '') ? null : value;

  useEffect(() => {
    checkAdminRole();
    fetchScholarships();
    fetchUniversitiesList();
  }, []);

  async function checkAdminRole() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      }
    }
  }

  async function fetchScholarships() {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*');

    if (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
    } else {
      setScholarships(data);
    }
  }

  async function fetchUniversitiesList() {
    const { data, error } = await supabase.from('universities').select('id, name').order('name');
    if (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
    } else {
      setUniversities(data || []);
    }
  }

  function handleChange(event) {
    setScholarship(prevFormData => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  function handleChange2(event) {
    setScholarship2(prevFormData => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  async function createScholarship(event) {
    event.preventDefault();

    try {
      let imageUrl = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('scholarships')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('scholarships')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Payload alineado a las columnas reales de `scholarships`.
      // university_id/sponsor_id: la BD exige al menos uno no nulo (constraint
      // at_least_one_sponsor); este formulario solo permite elegir universidad.
      const { error } = await supabase
        .from('scholarships')
        .insert({
          name: scholarship.name,
          url: nullIfEmpty(scholarship.url),
          description: nullIfEmpty(scholarship.description),
          requirements: nullIfEmpty(scholarship.requirements),
          start_date: nullIfEmpty(scholarship.start_date),
          finish_date: nullIfEmpty(scholarship.finish_date),
          university_id: parseInt(scholarship.university_id, 10),
          program_id: null,
          country_id: null,
          city_id: null,
          sponsor_id: null,
          category_id: null,
          amount: null,
          currency: 'USD',
          coverage: null,
          is_active: true,
          image_url: nullIfEmpty(imageUrl)
        });

      if (error) throw error;

      fetchScholarships();
      setScholarship({ name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', university_id: '', image_url: '' });
      setTypeModal(null);
      setFile(null);
    } catch (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
      alert("No se pudo publicar la beca. Revisa la consola para más detalles.");
    }
  }

  async function deleteScholarship(id, imageUrl) {
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage.from('scholarships').remove([fileName]);
    }

    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchScholarships();
    }
  }

  async function displayScholarship(scholarshipId) {
    scholarships.forEach((sch) => {
      if (sch.id === scholarshipId) {
        setScholarship2({
          id: sch.id, name: sch.name, url: sch.url || '',
          description: sch.description || '', requirements: sch.requirements || '',
          start_date: sch.start_date || '', finish_date: sch.finish_date || '',
          university_id: sch.university_id || '', image_url: sch.image_url || ''
        });
        setTypeModal('editar');
      }
    });
  }

  async function updateScholarship(scholarshipId) {
    try {
      let imageUrl = scholarship2.image_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('scholarships')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('scholarships')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('scholarships')
        .update({
          name: scholarship2.name,
          url: nullIfEmpty(scholarship2.url),
          description: nullIfEmpty(scholarship2.description),
          requirements: nullIfEmpty(scholarship2.requirements),
          start_date: nullIfEmpty(scholarship2.start_date),
          finish_date: nullIfEmpty(scholarship2.finish_date),
          university_id: parseInt(scholarship2.university_id, 10),
          image_url: nullIfEmpty(imageUrl)
        })
        .eq('id', scholarshipId);

      if (error) throw error;

      fetchScholarships();
      setFile(null);
      setTypeModal(null);
    } catch (error) {
      console.error('Error de Supabase:', error.message, error.details, error.hint);
      alert("No se pudo actualizar la beca. Revisa la consola para más detalles.");
    }
  }

  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch = 
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = 
      s.location && s.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="pt-8 pb-6 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Directorio de Becas
        </h1>
        <p className="text-gray-600 mt-3 font-medium">
          Gestiona, descubre y comparte las mejores oportunidades de financiamiento académico.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 border border-gray-200">

          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-sm border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors font-medium text-gray-700"
            />
          </div>

          <div className="relative w-full md:w-1/2">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filtrar por ubicación o país..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-sm border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors font-medium text-gray-700"
            />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
        
        {isAdmin && (
          <div
            onClick={() => setTypeModal('crear')}
            className="bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex flex-col items-center justify-center cursor-pointer min-h-100"
          >
            <div className="bg-purple-50 text-purple-700 rounded-sm w-12 h-12 flex items-center justify-center mb-3 border border-purple-200">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-gray-900 font-semibold text-base">
              Publicar Nueva Beca
            </span>
            <p className="text-gray-500 text-sm mt-2 px-8 text-center">
              Añade una nueva oportunidad al directorio para los estudiantes.
            </p>
          </div>
        )}

        {!isAdmin && filteredScholarships.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <Frown className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-xl font-semibold text-gray-900">No encontramos becas</p>
            <p className="text-md mt-2">Intenta ajustar tu búsqueda o limpiar los filtros.</p>
          </div>
        )}

        {filteredScholarships.map((scholarship) =>
          <div key={scholarship.id} className="bg-white border border-gray-200 flex flex-col overflow-hidden">

            <div className="h-40 w-full bg-gray-50 flex items-center justify-center p-4 border-b border-gray-200">
              {scholarship.image_url ? (
                <img
                  src={scholarship.image_url}
                  className="max-h-full object-contain"
                  alt={scholarship.name}
                />
              ) : (
                <div className="text-gray-400 font-medium">Sin imagen disponible</div>
              )}
            </div>

            <div className="p-6 flex flex-col grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                {scholarship.name}
              </h3>

              <div className="flex flex-row items-center justify-between gap-2 mb-4">
                <div className="flex items-center text-sm font-medium text-gray-600 gap-1.5 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate" title={scholarship.location}>{scholarship.location}</span>
                </div>

                <div className="flex items-center text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1.5 border border-gray-200 shrink-0 gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{scholarship.start_date?.substring(5)} / {scholarship.finish_date?.substring(5)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-3 grow">
                {scholarship.description}
              </p>

              <a
                href={scholarship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center w-full py-3 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors mb-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Sitio Oficial
              </a>

              {isAdmin && (
                <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
                  <button onClick={() => deleteScholarship(scholarship.id, scholarship.image_url)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                  </button>
                  <button onClick={() => displayScholarship(scholarship.id)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors">
                    <Edit className="w-4 h-4 mr-1.5" /> Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {typeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto border border-gray-200">
              <button
                onClick={() => setTypeModal(null)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-sm bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 font-bold transition-colors"
              >
                &times;
              </button>

              <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">
                {typeModal === 'crear' ? 'Registrar Beca' : 'Editar Beca'}
              </h2>

              <form
                onSubmit={(e) => {
                  if (typeModal === 'crear') {
                    createScholarship(e);
                  } else {
                    e.preventDefault();
                    updateScholarship(scholarship2.id);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <input type="text" placeholder="Nombre de la beca" name="name" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.name : scholarship.name} className="border border-gray-300 bg-white focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none p-3 rounded-sm w-full font-medium text-gray-900" required />

                <div className="border border-gray-300 p-3 rounded-sm bg-gray-50">
                  <label className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-2 block">Imagen / Banner</label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} name="image" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer transition-colors" />
                </div>

                <input type="url" placeholder="URL oficial" name="url" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.url : scholarship.url} className="border border-gray-300 bg-white focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none p-3 rounded-sm w-full font-medium" />
                <textarea placeholder="Descripción detallada" name="description" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.description : scholarship.description} rows="3" className="border border-gray-300 bg-white focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none p-3 rounded-sm w-full resize-none font-medium text-gray-700" />

                <div>
                  <label className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-1 block">Universidad asociada</label>
                  <select name="university_id" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.university_id : scholarship.university_id} className="border border-gray-300 bg-white focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none p-3 rounded-sm w-full font-medium text-gray-700" required>
                    <option value="" disabled>Selecciona una universidad</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-1 block">Apertura</label>
                    <input type="date" name="start_date" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.start_date : scholarship.start_date} className="border border-gray-300 bg-white p-3 rounded-sm w-full text-gray-700 font-medium outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-1 block">Cierre</label>
                    <input type="date" name="finish_date" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.finish_date : scholarship.finish_date} className="border border-gray-300 bg-white p-3 rounded-sm w-full text-gray-700 font-medium outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" />
                  </div>
                </div>
                <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-sm font-semibold mt-2 transition-colors">
                  {typeModal === 'crear' ? 'Publicar Beca' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scholarships;