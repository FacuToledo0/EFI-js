import { Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";

const Modelos = () => {
  const [modelos, setModelos] = useState([]);
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

  // Función para obtener los modelos
  const fetchModelos = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/modelo_list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al obtener los modelos");
      }

      const data = await response.json();
      setModelos(data.modelos);
    } catch (error) {
      console.error("Error al obtener los modelos:", error);
      setMessage("Error al obtener modelos: " + error.message);
    }
  };

  useEffect(() => {
    fetchModelos();
  }, []);

  // Función para guardar o editar un modelo
  const handleGuardar = async (values, { resetForm }) => {
    try {
      const url = editing
        ? `http://127.0.0.1:5000/modelo/${editing}/editar`  // Edición
        : "http://127.0.0.1:5000/modelo";  // Creación

      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: values.nombre }),  // Usamos 'nombre' para coincidir con el backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al guardar el modelo");
      }

      setEditing(null);
      fetchModelos();
      resetForm();
      setMessage("Modelo guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el modelo:", error);
      setMessage("Error al guardar el modelo: " + error.message);
    }
  };

  // Función para editar un modelo
  const handleEditar = (id) => {
    setEditing(id);
  };

  // Función para eliminar un modelo
  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/modelo/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error al eliminar modelo");
      }

      fetchModelos();
      setMessage("Modelo eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar el modelo:", error);
      setMessage("Error al eliminar el modelo: " + error.message);
    }
  };

  return (
    <div className="container">
      {isAdmin ? (
        <div className="row">
          {/* Sección para crear/editar modelos */}
          <div className="col-md-6">
            <h4>{editing ? "Editar modelo" : "Crear un nuevo modelo"}</h4>
            <Formik
              enableReinitialize
              initialValues={{
                nombre: editing ? modelos.find((m) => m.id === editing).nombre : "",
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
                      placeholder="Ingrese el nombre del modelo"
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

          {/* Listado de Modelos */}
          <div className="col-md-6">
            <h4>Listado de Modelos</h4>
            <ul className="list-group">
              {modelos.length === 0 ? (
                <li className="list-group-item">No hay modelos disponibles.</li>
              ) : (
                modelos.map((modelo) => (
                  <li key={modelo.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{modelo.nombre}</span>
                    <div>
                      <Button
                        label="Editar"
                        icon="pi pi-pencil"
                        className="custom-navy-blue-button"
                        onClick={() => handleEditar(modelo.id)}
                      />
                      <Button
                        label="Eliminar"
                        icon="pi pi-trash"
                        className="custom-red-button"
                        onClick={() => handleEliminar(modelo.id)}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>No estás autorizado para gestionar modelos.</p>
      )}
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default Modelos;
