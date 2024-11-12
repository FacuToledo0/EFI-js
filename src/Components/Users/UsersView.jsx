import { Container } from "react-bootstrap";

const UsersView = ({ dataUsers }) => {
    return (
        <div style={{ textAlign: "center" }}>
        <h2>Lista de usuarios:</h2>
        <ul>
            {dataUsers.map((user) => (
            <li key={user.id}>{user.username}</li>
            ))}
        </ul>
        </div>
    );
};

export default UsersView;
