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
      <h2 className="in">Ingresar Beca</h2>
      <form onSubmit={createScholarship}>
        <input 
          type="text"
          placeholder="nombre"
          name="name"
          onChange={handleChange}
          value={scholarship.name}
         />
        <input 
          type="link"
          placeholder="URL"
          name="url"
          onChange={handleChange}
          value={scholarship.url}
         />
        <input 
          type="text"
          placeholder="descripción"
          name="description"
          onChange={handleChange}
          value={scholarship.description} 
        />
        <input 
          type="text"
          placeholder="requisitos"
          name="requirements"
          onChange={handleChange}
          value={scholarship.requirements} 
        />
        <input 
          type="date"
          name="start_date"
          onChange={handleChange}
          value={scholarship.start_date} 
        />
        <input 
          type="date"
          name="finish_date"
          onChange={handleChange}
          value={scholarship.finish_date} 
        />
        <button type='Submit'>Publicar</button>
      </form>
      <h2 className="edit">Editar Beca</h2>
      <form onSubmit={()=>updateScholarship(scholarship2.id)}>
        <input 
          type="text"
          name="name"
          onChange={handleChange2}
          defaultValue={scholarship2.name}
         />
        <input 
          type="link"
          name="url"
          onChange={handleChange2}
          defaultValue={scholarship2.url}
         />
        <input 
          type="text"
          name="description"
          onChange={handleChange2}
          defaultValue={scholarship2.description} 
        />
        <input 
          type="text"
          name="requirements"
          onChange={handleChange2}
          defaultValue={scholarship2.requirements} 
        />
        <input 
          type="date"
          name="start_date"
          onChange={handleChange2}
          defaultValue={scholarship2.start_date} 
        />
        <input 
          type="date"
          name="finish_date"
          onChange={handleChange2}
          defaultValue={scholarship2.finish_date} 
        />
        <button type='Submit'>Actualizar</button>
      </form>      
      
      <div className="cards">
        {scholarships.map((scholarship)=>
          <div key={scholarship.name} className="card">
            <div className="bg-blue-600 p-4">
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

              <p>
                {scholarship.url}
              </p>
            </div>
            
            <div className="flex justify-end gap-2 bg-gray-50 p-4 border-t border-gray-100">
              <button onClick={()=> deleteScholarship(scholarship.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Borrar
              </button>
              <button onClick={()=> displayScholarship(scholarship.id)} className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors">
                Modificar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App