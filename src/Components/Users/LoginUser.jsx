import { useState } from "react";

const LoginUser = () => {
  const [message, setMessage] = useState("");

  const login = async (username, password) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${username}:${password}`),
        },
      });

      // Verificamos si la respuesta fue exitosa
      if (response.ok) {
        const data = await response.json();
        const accessToken = data.Token;
        localStorage.setItem("token", accessToken);

        const claims = JSON.parse(atob(accessToken.split(".")[1]));
        localStorage.setItem("isAdmin", claims.administrador);
        setMessage("Inicio de sesión exitoso.");
      } else {
        // Si la respuesta no es exitosa, intentamos obtener detalles adicionales
        const errorData = await response.json();
        console.log("Error de respuesta: ", errorData); // Log para ver el error
        setMessage(errorData.Mensaje || "Error en el inicio de sesión. Verifique sus credenciales.");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setMessage("Ocurrió un error durante el inicio de sesión.");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    login(username.value, password.value);
  };

  return (
    <div className="container">
      <form onSubmit={handleLogin}>
        <h4>Inicio de Sesión</h4>
        <div className="mb-3">
          <input type="text" name="username" placeholder="Usuario" required />
        </div>
        <div className="mb-3">
          <input type="password" name="password" placeholder="Contraseña" required />
        </div>
        <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default LoginUser;
