import TitleBar from "../components/TitleBar.jsx";
import '../styles/CreateStory.css'
import {useEffect, useState} from "react";
import {useUser} from "../components/UserContext.jsx";
import {setImages} from "../services/Photos.js";
import {fetchAllCharacters, changeCharacterAlias} from "../services/Characters.js";
import DisplayCharacters from "../components/CharacterDisplay.jsx";


function CreateStory() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [characterList, setCharacterList] = useState([]);
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const {username} = useUser();

    // Load the Character list for seleciton
    useEffect(() => {
        async function loadCharacters() {
            if(!username) return;
            const characters = await fetchAllCharacters(username);
            await setImages(setCharacterList, characters);
        }
        loadCharacters();
    }, [username]);

    // Pass into the character display. Basically, stores selected characters in the 'selectedCharacters' state.
    // Click to select, click to deselect, note: alias changes not currently reflected in selection!
    function handleCharacterSelect(characterID, sourceURL){
        setSelectedCharacters((prev) => {
            const validCharacter = characterList.find((img) => img.id === characterID);
            if(!validCharacter) return prev;

            const isSelected = prev.find((character) => character.characterID === characterID);
            if(isSelected) return prev.filter((character) => character.characterID !== characterID);

            return [
                ...prev,
                {
                    characterID: validCharacter.id,
                    sourceURL: sourceURL,
                    alias: validCharacter.alias,
                    url: validCharacter.url,
                },
            ];
        });
    }

    function handleCreateStory(){

    }

    return (
        <div id="CreateStory">
            <TitleBar />
            <form onSubmit={handleCreateStory} id="CreateStoryForm">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the name of your story"
                />
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter the description of your story"
                />
                <button type="submit">
                    Create Story
                </button>
            </form>

            <div id="CreateStoryCharacterSelection">
                <h2>Select Characters</h2>
                <p>Click on a character to add/remove it from the story</p>

                <DisplayCharacters
                    ID="CreateStoryCharacterList"
                    username={username}
                    ImageList={characterList}
                    OnImageClick={handleCharacterSelect}
                    OnChangeAlias={changeCharacterAlias}
                    DisplayStories={false}
                />
            </div>

            <div className="SelectedCharactersSection">
                <h2>Selected characters</h2>

                {selectedCharacters.length === 0 ? (
                    <p>No characters selected yet.</p>
                ) : (
                    <ul>
                        {selectedCharacters.map((character) => (
                            <li key={character.characterID}>
                                {character.alias}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
}

export default CreateStory