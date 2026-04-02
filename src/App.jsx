import {useState, useEffect} from "react";
import { supabase } from "./createClient";
import './App.css';

const App = () => {

  const [scholarships, setScholarships]=useState([])

  const [scholarship, setScholarship]=useState({
    name: '', url: '', description: '', requirements: '', start_date: '', finish_date: ''
  })

  const [scholarship2, setScholarship2]=useState({
    id: '', name: '',url: '', description: '', requirements: '', start_date: '', finish_date: ''
  })

  const [typeModal, setTypeModal] = useState(null);

  useEffect(() => {
    fetchScholarships()
  }, [])

  async function fetchScholarships(){
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        
      if (error) {
        console.log("Error de Supabase:", error)
      } else {
        console.log("Datos recibidos:", data)
        setScholarships(data)
      }
    }

  function handleChange(event){
    setScholarship(prevFormData=>{
      return{
        ...prevFormData,
        [event.target.name]:event.target.value
      }
    })
  }

    function handleChange2(event){
    setScholarship2(prevFormData=>{
      return{
        ...prevFormData,
        [event.target.name]:event.target.value
      }
    })
  }

  async function createScholarship(event){
    event.preventDefault()
    await supabase
    .from('scholarships')
    .insert({ name : scholarship.name, url : scholarship.url, description : scholarship.description, requirements : scholarship.requirements, start_date : scholarship.start_date, finish_date : scholarship.finish_date})
    fetchScholarships()
    setScholarship({ name: '', url: '', description: '', requirements: '', start_date: '', finish_date: ''})
    setTypeModal(null);
  }

  async function deleteScholarship(scholarshipId) {
    const { data, error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', scholarshipId)

    if (error) {
      console.log("Error trying delete:", error)
    } else {
      console.log("Scholarship has been eliminated:", data)
      fetchScholarships()
    }    
  }

  async function displayScholarship(scholarshipId) {
    scholarships.map((scholarship)=>{

      if(scholarship.id==scholarshipId){
        setScholarship2({ id : scholarship.id, name : scholarship.name, url : scholarship.url, description : scholarship.description, requirements : scholarship.requirements, start_date : scholarship.start_date, finish_date : scholarship.finish_date})
        setTypeModal('editar');
      }

    })
  }

  async function updateScholarship(scholarshipId){
    const { data, error } = await supabase
      .from('scholarships')
      .update({id : scholarship2.id, name : scholarship2.name, url : scholarship2.url, description : scholarship2.description, requirements : scholarship2.requirements, start_date : scholarship2.start_date, finish_date : scholarship2.finish_date})
      .eq('id', scholarshipId)

    if (error) {
      console.log("Error trying update:", error)
    } else {
      console.log("Scholarships has been updated:", data)
      fetchScholarships()
    }        
  }

  return(
    <div>
      <div className="cards">
        <div 
          onClick={() => setTypeModal('crear')} 
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-gray-50 transition-all h-64"
        >
          <span className="text-4xl text-gray-400">+</span>
        </div> 

        {scholarships.map((scholarship)=>
          <div key={scholarship.name} className="card">
            <div className="bg-purple-600 p-4">
              <h3 className="text-xl font-bold text-white truncate">
                {scholarship.name}
              </h3>
            </div>  

            <div className="flex flex-col gap-3 p-4">
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Inicio: {scholarship.start_date}</span>
                <span>Fin: {scholarship.finish_date}</span>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-3">
                {scholarship.description}
              </p>

              <a 
                href={scholarship.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate"
              >
                {scholarship.url}
              </a>
               
              
            </div>
            
            <div className="flex justify-center gap-2 bg-gray-50 p-4 border-t border-gray-100">
              <button onClick={()=> deleteScholarship(scholarship.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Borrar
              </button>
              <button onClick={()=> displayScholarship(scholarship.id)} className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors">
                Modificar
              </button>
            </div>
          </div>
        )}

        {typeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl relative">
              <button 
                onClick={() => setTypeModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
              {typeModal === 'crear' ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Nueva Beca</h2>
                  <form onSubmit={createScholarship} className="flex flex-col gap-3">
                    <input type="text" placeholder="nombre" name="name" onChange={handleChange} value={scholarship.name} className="border p-2 rounded" />
                    <input type="text" placeholder="url" name="url" onChange={handleChange} value={scholarship.url} className="border p-2 rounded" />
                    <textarea placeholder="descripción" name="description" onChange={handleChange} value={scholarship.description} className="border p-2 rounded" />
                    <div className="flex gap-2">
                      <input type="date" name="start_date" onChange={handleChange} value={scholarship.start_date} className="border p-2 rounded w-1/2" />
                      <input type="date" name="finish_date" onChange={handleChange} value={scholarship.finish_date} className="border p-2 rounded w-1/2" />
                    </div>
                    <button type="submit" className="bg-purple-600 text-white py-2 rounded-lg font-bold mt-2">Publicar</button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Editar Beca</h2>
                  <form 
                    onSubmit={(e) => { e.preventDefault(); updateScholarship(scholarship2.id); setTypeModal(null); }} 
                    className="flex flex-col gap-3"
                  >
                    <input type="text" name="name" onChange={handleChange2} defaultValue={scholarship2.name} className="border p-2 rounded" />
                    <input type="text" name="url" onChange={handleChange2} defaultValue={scholarship2.url} className="border p-2 rounded" />
                    <textarea name="description" onChange={handleChange2} defaultValue={scholarship2.description} className="border p-2 rounded" />
                    <input type="date" name="start_date" onChange={handleChange2} defaultValue={scholarship2.start_date} className="border p-2 rounded" />
                    <input type="date" name="finish_date" onChange={handleChange2} defaultValue={scholarship2.finish_date} className="border p-2 rounded" />
                    <button type="submit" className="bg-purple-600 text-white py-2 rounded-lg font-bold mt-2">Guardar Cambios</button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App