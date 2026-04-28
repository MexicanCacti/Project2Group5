import {useUser} from "./UserContext.jsx";
import {useState} from "react";
import {Login} from "../services/Users.js";

function LoginBox() {
    const { username, setUsername } = useUser();

    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await Login(formUsername, formPassword, setUsername);
    };

    if (!username) {
        return (
            <div>
                <p>If I don't change you have the wrong credentials!</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input
                            type="text"
                            name="username"
                            value={formUsername}
                            onChange={(e) => setFormUsername(e.target.value)}
                        />
                    </label>

                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                        />
                    </label>

                    <button type="submit" className="TitleButton">Login</button>
                </form>
            </div>

        );
    }

    return (
        <div>
            <h3>Welcome {username}</h3>
            <button onClick={() => {
                setUsername("");
                window.location.reload();
            }}>
                Logout
            </button>
        </div>
    );
}

export default LoginBox;