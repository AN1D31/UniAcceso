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
      <h2 class="in">Ingresar Beca</h2>
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
      <h2 class="edit">Editar Beca</h2>
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

      <table>
        <thead>
          <tr>
            <th>Id beca</th>
            <th>Nombre beca</th>
            <th>URL</th>
            <th>Descripción</th>
            <th>Requisitos</th>
            <th>Fecha Inicio</th>
            <th>Fecha Finalización</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {scholarships.map((scholarship)=>
            <tr key={scholarship.id}>
              <td>{scholarship.id}</td>
              <td>{scholarship.name}</td>
              <td>{scholarship.url}</td>
              <td>{scholarship.description}</td>
              <td>{scholarship.requirements}</td>
              <td>{scholarship.start_date}</td>
              <td>{scholarship.finish_date}</td>
              <td><button onClick={()=> deleteScholarship(scholarship.id)}>Borrar</button>
                  <button onClick={()=> displayScholarship(scholarship.id)}>Modificar</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App