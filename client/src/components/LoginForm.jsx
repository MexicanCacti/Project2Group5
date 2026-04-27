import {useUser} from "./UserContext.jsx";
import {useState} from "react";
import {Login} from "../services/Users.js";

function LoginBox(){
    const {username, setUsername} = useUser();

    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");

    if(!username || username === ''){
        return(
            <form onSubmit={(e) => {e.preventDefault(); Login({ username: formUsername, password: formPassword, setUsername})}}>
                <label>
                    Username:
                    <input type="text" name="username" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} />
                </label>
                <label>
                    Password:
                    <input type="text" name="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                </label>
                <button type="submit">Login</button>
            </form>
        );
    }

    return(
        <div>
            <h3>Welcome {username}!</h3>
            <button onClick={() => {setUsername("");}}>Logout</button>
        </div>
    );
}

export default LoginBox