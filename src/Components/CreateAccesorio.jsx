import { Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";

const Accesorios = () => {
  const [accesorios, setAccesorios] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));

  // Validación del formulario
  const ValidationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required("Este campo es requerido")
      .min(3, "Debe tener mínimo 3 caracteres")
      .max(50, "No debe ser mayor a 50 caracteres"),
  });

  // Función para obtener los accesorios
  const fetchAccesorios = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/accesorio_list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }, // Token de autorización
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al obtener los accesorios");
      }

      const data = await response.json();
      setAccesorios(data.accesorios);
    } catch (error) {
      console.error("Error al obtener los accesorios:", error);
      setMessage("Error al obtener accesorios: " + error.message); // Mostrar error
    }
  };

  useEffect(() => {
    fetchAccesorios();
  }, []);

  // Función para guardar o editar un accesorio
  const handleGuardar = async (values, { resetForm }) => {
    try {
      const url = editing
        ? `http://127.0.0.1:5000/accesorio/${editing}/editar`  // Edición
        : "http://127.0.0.1:5000/accesorio";  // Creación

      const method = editing ? "PUT" : "POST";

      // Enviamos el nombre del accesorio como tipo_accesorio
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // Asegúrate de pasar el token correctamente
        },
        body: JSON.stringify({ tipo_accesorio: values.nombre }),  // Usamos 'tipo_accesorio' para coincidir con el backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al guardar el accesorio");
      }

      // Limpiar el formulario y actualizar la lista de accesorios
      setEditing(null);
      fetchAccesorios();  // Refresca la lista
      resetForm();
      setMessage("Accesorio guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el accesorio:", error);
      setMessage("Error al guardar el accesorio: " + error.message);  // Mostrar mensaje de error
    }
  };

  // Función para editar un accesorio
  const handleEditar = (id) => {
    setEditing(id);
  };

  // Función para eliminar un accesorio
  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/accesorio/${id}/borrar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },  // Token de autorización
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error al eliminar accesorio");
      }

      fetchAccesorios();  // Refresca la lista de accesorios
      setMessage("Accesorio eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar el accesorio:", error);
      setMessage("Error al eliminar el accesorio: " + error.message);
    }
  };

  return (
    <div className="container">
      {isAdmin ? (
        <div className="row">
          {/* Sección para crear/editar accesorios */}
          <div className="col-md-6">
            <h4>{editing ? "Editar accesorio" : "Crear un nuevo accesorio"}</h4>
            <Formik
              enableReinitialize
              initialValues={{
                nombre: editing ? accesorios.find((a) => a.id === editing).tipo_accesorio : "",
              }}
              validationSchema={ValidationSchema}
              onSubmit={handleGuardar}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.nombre}
                      placeholder="Ingrese el nombre del accesorio"
                    />
                    {errors.nombre && touched.nombre && (
                      <div className="text-danger">{errors.nombre}</div>
                    )}
                  </div>
                  <Button
                    label={editing ? "Actualizar" : "Guardar"}
                    icon="pi pi-check"
                    className="custom-green-button"
                    disabled={!isValid}
                    type="submit"
                  />
                </form>
              )}
            </Formik>
          </div>

          {/* Listado de Accesorios */}
          <div className="col-md-6">
            <h4>Listado de Accesorios</h4>
            <ul className="list-group">
              {accesorios.length === 0 ? (
                <li className="list-group-item">No hay accesorios disponibles.</li>
              ) : (
                accesorios.map((accesorio) => (
                  <li key={accesorio.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{accesorio.tipo_accesorio}</span>
                    <div>
                      <Button
                        label="Editar"
                        icon="pi pi-pencil"
                        className="custom-navy-blue-button"
                        onClick={() => handleEditar(accesorio.id)}
                      />
                      <Button
                        label="Eliminar"
                        icon="pi pi-trash"
                        className="custom-red-button"
                        onClick={() => handleEliminar(accesorio.id)}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>No estás autorizado para gestionar accesorios.</p>
      )}
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default Accesorios;
