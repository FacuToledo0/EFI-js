import { Formik } from "formik";
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import { Button } from 'primereact/button';

const CreateUser = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null); // Guarda solo el ID del usuario que se está editando
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");  // Obtener el token del localStorage
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));  // Obtener si es admin del localStorage

  const ValidationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Este campo es requerido')
      .max(50, 'El username no debe ser mayor a 50 caracteres'),
    password: Yup.string()
      .required('Este campo es requerido')
      .max(50, 'La contraseña no debe ser mayor a 50 caracteres'),
    is_admin: Yup.number()
      .required('Este campo es requerido')
      .oneOf([0, 1], 'Debe ser 1 para admin o 0 para usuario')
  });

  // Función para obtener los usuarios desde el backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/users', {
        headers: { 
          'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      console.log('Datos recibidos del backend:', data); 
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Función para crear o editar un usuario
  const RegisterUser = async (values, { resetForm }) => {
    const bodyRegisterUser = {
      username: values.username,  
      password: values.password,  
      is_admin: values.is_admin === 1 ? 1 : 0,  
    };

    const url = editing
      ? `http://127.0.0.1:5000/users/${editing}/editar`  // Si estamos editando, usamos PUT
      : 'http://127.0.0.1:5000/users';  // Si estamos creando un nuevo usuario, usamos POST
    const method = editing ? 'PUT' : 'POST'; 

    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(bodyRegisterUser),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Enviar el token JWT en la cabecera
        }
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();  // Actualizar la lista de usuarios
        resetForm();  // Limpiar el formulario
        setEditing(null);  // Resetear el estado de edición
        setMessage("Usuario guardado exitosamente.");
      } else {
        setMessage(data.Mensaje || "Error al guardar el usuario.");
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      setMessage("Ocurrió un error al guardar el usuario.");
    }
  };

  // Función para manejar la edición de un usuario
  const handleEditar = (id) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditing(id);  // Guardamos el ID del usuario que se va a editar
    }
  };

  // Función para manejar la eliminación de un usuario
  const handleEliminar = async (id) => {
    if (!token) {
      setMessage("No estás autorizado. El token no está disponible.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${id}/borrar`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,  // Enviar el token JWT
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.Mensaje || "Error al eliminar el usuario");
      }

      fetchUsers();  // Actualizar la lista de usuarios
      setMessage(data.Mensaje || "Usuario eliminado exitosamente.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Error al eliminar el usuario.");
    }
  };

  return (
    <div className="container">
      {isAdmin ? (
        <>
          <h4>{editing ? "Editar usuario" : "Crear nuevo usuario"}</h4>
          <Formik
            enableReinitialize
            initialValues={{
              username: editing ? users.find(user => user.id === editing)?.username : '',
              password: '',
              is_admin: editing ? users.find(user => user.id === editing)?.is_admin : 0,
            }}  
            validationSchema={ValidationSchema}
            onSubmit={RegisterUser}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isValid
            }) => (
              <form onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                  />
                  {errors.username && touched.username && (
                    <div className="text-danger">{errors.username}</div>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {errors.password && touched.password && (
                    <div className="text-danger">{errors.password}</div>
                  )}
                </div>
                <div>
                  <select
                    name="is_admin"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.is_admin}
                  >
                    <option value={0}>Usuario</option>
                    <option value={1}>Administrador</option>
                  </select>
                  {errors.is_admin && touched.is_admin && (
                    <div className="text-danger">{errors.is_admin}</div>
                  )}
                </div>
                <Button
                  label={editing ? "Actualizar usuario" : "Crear usuario"}
                  icon="pi pi-check"
                  type="submit"
                  disabled={!isValid}
                  className="custom-green-button"
                />
              </form>
            )}
          </Formik>

          {message && <div className="alert alert-info mt-3">{message}</div>}

          <h4>Lista de Usuarios</h4>
          <ul>
            {users.map((user, index) => (
              <li key={user.id || index}>  {/* Usamos el `id` si está disponible, si no, usamos el índice */}
                <span>{user.username} - {user.is_admin === 1 ? "Administrador" : "Usuario"}</span>
                <Button
                  icon="pi pi-pencil"
                  className="custom-soft-yellow-button"
                  onClick={() => handleEditar(user.id)}
                  label="Editar"
                />
                <Button
                  icon="pi pi-trash"
                  className="custom-red-button"
                  onClick={() => handleEliminar(user.id)} // Pasamos correctamente el id
                  label="Eliminar"
                />
              </li>
            ))}
          </ul>

        </>
      ) : (
        <p>No estás autorizado para gestionar usuarios.</p>
      )}
    </div>
  );
};

export default CreateUser;
