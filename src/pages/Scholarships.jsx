import { useState, useEffect } from "react";
import { supabase } from "../createClient";
import { MapPin, Calendar, ExternalLink, Edit, Trash2, Plus, Search, Frown } from "lucide-react";
import '../App.css';

const Scholarships = () => {

  const [scholarships, setScholarships] = useState([]);
  const [scholarship, setScholarship] = useState({
    name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', location: '', image_url: ''
  });
  const [scholarship2, setScholarship2] = useState({
    id: '', name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', location: '', image_url: ''
  });

  const [typeModal, setTypeModal] = useState(null);
  const [file, setFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    checkAdminRole();
    fetchScholarships();
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
      console.log("Error de Supabase:", error);
    } else {
      setScholarships(data);
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
    let imageUrl = '';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('scholarships')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('scholarships')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    await supabase
      .from('scholarships')
      .insert({
        name: scholarship.name,
        url: scholarship.url,
        description: scholarship.description,
        requirements: scholarship.requirements,
        start_date: scholarship.start_date,
        finish_date: scholarship.finish_date,
        location: scholarship.location,
        image_url: imageUrl
      });

    fetchScholarships();
    setScholarship({ name: '', url: '', description: '', requirements: '', start_date: '', finish_date: '', location: '', image_url: '' });
    setTypeModal(null);
    setFile(null);
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
          id: sch.id, name: sch.name, url: sch.url,
          description: sch.description, requirements: sch.requirements,
          start_date: sch.start_date, finish_date: sch.finish_date,
          location: sch.location, image_url: sch.image_url
        });
        setTypeModal('editar');
      }
    });
  }

  async function updateScholarship(scholarshipId) {
    let imageUrl = scholarship2.image_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('scholarships')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('scholarships')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from('scholarships')
      .update({
        name: scholarship2.name, url: scholarship2.url, description: scholarship2.description,
        requirements: scholarship2.requirements, start_date: scholarship2.start_date,
        finish_date: scholarship2.finish_date, location: scholarship2.location,
        image_url: imageUrl
      })
      .eq('id', scholarshipId);

    if (!error) {
      fetchScholarships();
      setFile(null);
      setTypeModal(null);
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
    <div className="min-h-screen bg-white pb-20">
      <div className="pt-16 pb-12 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-sm border border-purple-100 mb-4">
          <BookOpenIcon className="w-8 h-8 text-purple-600" /> 
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-600">
          Directorio de Becas
        </h1>
        <p className="text-gray-600 mt-4 font-medium text-lg">
          Gestiona, descubre y comparte las mejores oportunidades de financiamiento académico.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-purple-100">
          
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-inner font-medium text-gray-700"
            />
          </div>

          <div className="relative w-full md:w-1/2">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filtrar por ubicación o país..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-inner font-medium text-gray-700"
            />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
        
        {isAdmin && (
          <div
            onClick={() => setTypeModal('crear')}
            className="bg-white rounded-3xl border-2 border-dashed border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center cursor-pointer group min-h-100"
          >
            <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shadow-inner">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-purple-800 font-extrabold text-lg group-hover:text-emerald-700 transition-colors">
              Publicar Nueva Beca
            </span>
            <p className="text-gray-500 text-sm mt-2 font-medium px-8 text-center">
              Añade una nueva oportunidad al directorio para los estudiantes.
            </p>
          </div>
        )}

        {!isAdmin && filteredScholarships.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <Frown className="w-16 h-16 mb-4 text-purple-200" />
            <p className="text-2xl font-bold text-purple-800">No encontramos becas</p>
            <p className="text-md font-medium mt-2">Intenta ajustar tu búsqueda o limpiar los filtros.</p>
          </div>
        )}

        {filteredScholarships.map((scholarship) =>
          <div key={scholarship.id} className="bg-white rounded-3xl border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden group">
            
            <div className="h-2 w-full bg-linear-to-r from-purple-500 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="h-40 w-full bg-purple-50/40 flex items-center justify-center p-4 border-b border-purple-50/50">
              {scholarship.image_url ? (
                <img
                  src={scholarship.image_url}
                  className="max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                  alt={scholarship.name}
                />
              ) : (
                <div className="text-purple-200 font-medium">Sin imagen disponible</div>
              )}
            </div>

            <div className="p-6 flex flex-col grow">
              <h3 className="text-xl font-extrabold text-purple-900 mb-4 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                {scholarship.name}
              </h3>

              <div className="flex flex-row items-center justify-between gap-2 mb-4">
                <div className="flex items-center text-sm font-medium text-gray-600 gap-1.5 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate" title={scholarship.location}>{scholarship.location}</span>
                </div>

                <div className="flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 shrink-0 gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
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
                className="mt-auto flex items-center justify-center w-full py-3 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold rounded-xl transition-all duration-300 shadow-sm border border-purple-100 hover:border-purple-600 mb-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Sitio Oficial
              </a>

              {isAdmin && (
                <div className="flex justify-between gap-3 pt-4 border-t border-purple-100">
                  <button onClick={() => deleteScholarship(scholarship.id, scholarship.image_url)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                  </button>
                  <button onClick={() => displayScholarship(scholarship.id)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 mr-1.5" /> Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {typeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-purple-100">
              <button
                onClick={() => setTypeModal(null)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 font-bold transition-colors"
              >
                &times;
              </button>
              
              <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-linear-to-r from-purple-700 to-emerald-500 text-center">
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
                <input type="text" placeholder="Nombre de la beca" name="name" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.name : scholarship.name} className="border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none p-3 rounded-xl w-full font-medium text-purple-900" required />
                
                <div className="border border-purple-200 p-3 rounded-xl bg-purple-50/30">
                  <label className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-2 block">Imagen / Banner</label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} name="image" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer transition-colors" />
                </div>

                <input type="url" placeholder="URL oficial" name="url" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.url : scholarship.url} className="border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none p-3 rounded-xl w-full font-medium" />
                <textarea placeholder="Descripción detallada" name="description" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.description : scholarship.description} rows="3" className="border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none p-3 rounded-xl w-full resize-none font-medium text-gray-700" />
                <input type="text" placeholder="Institución o País" name="location" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.location : scholarship.location} className="border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none p-3 rounded-xl w-full font-medium" />
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1 block">Apertura</label>
                    <input type="date" name="start_date" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.start_date : scholarship.start_date} className="border border-purple-200 bg-white p-3 rounded-xl w-full text-gray-700 font-medium outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1 block">Cierre</label>
                    <input type="date" name="finish_date" onChange={typeModal === 'crear' ? handleChange : handleChange2} defaultValue={typeModal === 'editar' ? scholarship2.finish_date : scholarship.finish_date} className="border border-purple-200 bg-white p-3 rounded-xl w-full text-gray-700 font-medium outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                </div>
                <button type="submit" className="bg-linear-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white py-3.5 rounded-xl font-extrabold mt-2 shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 transition-all text-lg">
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

const BookOpenIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export default Scholarships;