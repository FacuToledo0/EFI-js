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

    const ValidationSchema = Yup.object().shape({
        tipo_accesorio: Yup.string()
            .required("Este campo es requerido")
            .min(3, "Debe tener mínimo 3 caracteres")
            .max(50, "No debe ser mayor a 50 caracteres"),
    });

    // Cargar accesorios desde el backend
    const fetchAccesorios = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/accesorio_list", {
                headers: { Authorization: token },
            });
            if (!response.ok) {
                throw new Error("Error al cargar los accesorios");
            }
            const data = await response.json();
            console.log(data);
            setAccesorios(data.accesorios);
        } catch (error) {
            console.error(error);
            setMessage("No se pudieron cargar los accesorios.");
        }
    };

    useEffect(() => {
        fetchAccesorios();
    }, []);

    // Función para guardar o editar un accesorio
    const handleGuardar = async (values, { resetForm }) => {
        try {
            const url = editing
                ? `http://127.0.0.1:5000/accesorio/${editing}/editar`
                : "http://127.0.0.1:5000/accesorio"; // Esta es la URL para crear un nuevo accesorio

            const method = editing ? "PUT" : "POST"; // Usar PUT si estamos editando, POST si es nuevo

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    tipo_accesorio: values.tipo_accesorio, // Mandamos 'tipo_accesorio' en lugar de 'nombre'
                }),
            });

            if (!response.ok) throw new Error("Error al guardar el accesorio");

            setEditing(null);
            fetchAccesorios(); // Recargar los accesorios después de guardar
            resetForm();
            setMessage("Accesorio guardado exitosamente.");
        } catch (error) {
            console.error(error);
            setMessage("Error al guardar el accesorio.");
        }
    };

    // Función para seleccionar un accesorio a editar
    const handleEditar = (id) => setEditing(id);

    // Función para eliminar un accesorio
    const handleEliminar = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/accesorio/${id}/borrar`, {
                method: "DELETE",
                headers: { Authorization: token },
            });

            if (!response.ok) throw new Error("Error al eliminar accesorio");

            fetchAccesorios(); // Recargar los accesorios después de eliminar
            setMessage("Accesorio eliminado exitosamente.");
        } catch (error) {
            console.error(error);
            setMessage("Error al eliminar el accesorio.");
        }
    };

    return (
        <div className="container">
            {isAdmin ? (
                <div className="row">
                    <div className="col-md-6">
                        <h4>{editing ? "Editar accesorio" : "Crear un nuevo accesorio"}</h4>
                        <Formik
                            enableReinitialize
                            initialValues={{
                                tipo_accesorio: editing
                                    ? accesorios.find((a) => a.id === editing).tipo_accesorio
                                    : "",
                            }}
                            validationSchema={ValidationSchema}
                            onSubmit={handleGuardar}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            name="tipo_accesorio" // Cambié el nombre del campo a 'tipo_accesorio'
                                            className="form-control"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.tipo_accesorio}
                                            placeholder="Ingrese el tipo de accesorio"
                                        />
                                        {errors.tipo_accesorio && touched.tipo_accesorio && (
                                            <div className="text-danger">{errors.tipo_accesorio}</div>
                                        )}
                                    </div>
                                    <Button
                                        label={editing ? "Actualizar" : "Guardar"}
                                        icon="pi pi-check"
                                        className="p-button-success"
                                        disabled={!isValid}
                                        type="submit"
                                    />
                                </form>
                            )}
                        </Formik>
                    </div>

                    <div className="col-md-6">
                        <h4>Listado de Accesorios</h4>
                        {accesorios.length > 0 ? (
                            <ul className="list-group">
                                {accesorios.map((accesorio) => (
                                    <li
                                        key={accesorio.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <span>{accesorio.tipo_accesorio}</span>
                                        <div>
                                            <Button
                                                label="Editar"
                                                icon="pi pi-pencil"
                                                className="p-button-warning p-button-sm me-2"
                                                onClick={() => handleEditar(accesorio.id)}
                                            />
                                            <Button
                                                label="Eliminar"
                                                icon="pi pi-trash"
                                                className="p-button-danger p-button-sm"
                                                onClick={() => handleEliminar(accesorio.id)}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay accesorios disponibles.</p>
                        )}
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
