import {useState, useEffect} from 'react'

function StoryDisplay({CharacterStories}){
    return(
        <div id="CharacterStories">
            <h4>In Stories:</h4>
            <ul>
                {CharacterStories.map((story) =>(
                    <li key={story.id}>
                        {story.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function DisplayCharacter({sourceID, username, CharacterAlias, CharacterImage, CharacterStories, OnImageClick, OnChangeAlias, DisplayStories}) {

    const [alias, setAlias] = useState(CharacterAlias);

    useEffect(() => {
        setAlias(CharacterAlias);
    }, [CharacterAlias]);

    return (
        <div className="Character">
            <img
                className="CharacterImage"
                alt={alias}
                src={CharacterImage}
                style={{ width: "120px", height: "120px" }}
                onClick={OnImageClick}

            />
            <h3>Alias:</h3>
            <input value={alias} className="CharacterInput" onChange={(e) => setAlias(e.target.value)} />
            <button onClick={() => OnChangeAlias(username, alias, sourceID)}>Change Alias</button>
            {DisplayStories && CharacterStories && (<StoryDisplay CharacterStories={CharacterStories} />)}

        </div>
    );
}


export default DisplayCharacter;