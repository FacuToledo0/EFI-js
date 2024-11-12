import { Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);
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

  // Función para obtener las marcas
  const fetchMarcas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/marca_list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }, // Token de autorización
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al obtener las marcas");
      }

      const data = await response.json();
      setMarcas(data.marcas);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
      setMessage("Error al obtener marcas: " + error.message); // Mostrar error
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  // Función para guardar o editar una marca
  const handleGuardar = async (values, { resetForm }) => {
    try {
      const url = editing
        ? `http://127.0.0.1:5000/marca/${editing}/editar`  // Edición
        : "http://127.0.0.1:5000/marca";  // Creación

      const method = editing ? "PUT" : "POST";

      // Enviamos el nombre de la marca
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // Asegúrate de pasar el token correctamente
        },
        body: JSON.stringify({ nombre: values.nombre }),  // Usamos 'nombre' para coincidir con el backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error desconocido al guardar la marca");
      }

      // Limpiar el formulario y actualizar la lista de marcas
      setEditing(null);
      fetchMarcas();  // Refresca la lista
      resetForm();
      setMessage("Marca guardada exitosamente.");
    } catch (error) {
      console.error("Error al guardar la marca:", error);
      setMessage("Error al guardar la marca: " + error.message);  // Mostrar mensaje de error
    }
  };

  // Función para editar una marca
  const handleEditar = (id) => {
    setEditing(id);
  };

  // Función para eliminar una marca
  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/marca/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },  // Token de autorización
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || "Error al eliminar marca");
      }

      fetchMarcas();  // Refresca la lista de marcas
      setMessage("Marca eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar la marca:", error);
      setMessage("Error al eliminar la marca: " + error.message);
    }
  };

  return (
    <div className="container">
      {isAdmin ? (
        <div className="row">
          {/* Sección para crear/editar marcas */}
          <div className="col-md-6">
            <h4>{editing ? "Editar marca" : "Crear una nueva marca"}</h4>
            <Formik
              enableReinitialize
              initialValues={{
                nombre: editing ? marcas.find((m) => m.id === editing).nombre : "",
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
                      placeholder="Ingrese el nombre de la marca"
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

          {/* Listado de Marcas */}
          <div className="col-md-6">
            <h4>Listado de Marcas</h4>
            <ul className="list-group">
              {marcas.length === 0 ? (
                <li className="list-group-item">No hay marcas disponibles.</li>
              ) : (
                marcas.map((marca) => (
                  <li key={marca.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{marca.nombre}</span>
                    <div>
                      <Button
                        label="Editar"
                        icon="pi pi-pencil"
                        className="custom-soft-yellow-button"
                        onClick={() => handleEditar(marca.id)}
                      />
                      <Button
                        label="Eliminar"
                        icon="pi pi-trash"
                        className="custom-red-button"
                        onClick={() => handleEliminar(marca.id)}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>No estás autorizado para gestionar marcas.</p>
      )}
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default Marcas;

