export async function Login(username, password, setUsername ) {
    const res = await fetch("/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
    });

    const data = await res.json()
    if (!res.ok) {
        console.error("Login failed:", data.error);
        return false;
    }

    setUsername(username);
    return true;
}