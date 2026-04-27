/*
*   Used so that the user's username is cached on the client side for display and retrieval
 */

import {createContext, useContext, useState} from 'react'

const UserContext = createContext();

export function UserProvider({children}) {
    const [username, setUsername] = useState('');

    return (
        <UserContext.Provider value={{username, setUsername}}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}