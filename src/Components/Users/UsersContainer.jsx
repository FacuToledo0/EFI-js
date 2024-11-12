import { useState, useEffect } from "react";
import UsersView from "./UsersView";
import { ProgressSpinner } from "primereact/progressspinner";

const UserContainer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/users", {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  return (
    <div className="container">

      {isAdmin ? (
        <>
          {loading ? (
            <ProgressSpinner />
          ) : (
            <UsersView dataUsers={users} />
          )}
        </>
      ) : (
        <p>No tienes permisos para gestionar usuarios.</p>
      )}
    </div>
  );
};

export default UserContainer;