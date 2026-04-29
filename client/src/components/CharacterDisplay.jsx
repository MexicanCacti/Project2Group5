import {useState, useEffect} from 'react'

function DisplayCharacter({sourceID, username, CharacterAlias, CharacterImage, OnImageClick, OnChangeAlias}) {

    const [alias, setAlias] = useState(CharacterAlias);

    useEffect(() => {
        setAlias(CharacterAlias);
    }, [CharacterAlias]);

    return (
        <div className="Character">
            <img
                className="CharacterImage"
                alt='${alias}'
                src={CharacterImage}
                style={{ width: "120px", height: "120px" }}
                onClick={OnImageClick}
            />
            <h3>Alias:</h3>
            <input value={alias} className="CharacterInput" onChange={(e) => setAlias(e.target.value)} />
            <button onClick={() => OnChangeAlias(username, alias, sourceID)}>Change Alias</button>
        </div>
    );
}


export default DisplayCharacter;