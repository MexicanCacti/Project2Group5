import {useEffect, useState} from "react";
import TitleBar from "../components/TitleBar.jsx";
import '../styles/Characters.css';
import {fetchAllCharacters, uploadCharacter} from "../services/Characters.js";
import GooglePhotosButton from '../components/GooglePhotosButton.jsx'
import {useUser} from "../components/UserContext.jsx";
import {setImages} from "../services/Photos.js";

function Characters() {
    const [charGenHidden, setCharGenHidden] = useState(false);
    const [charGenName, setCharGenName] = useState('');
    const [charGenRefFile, setCharGenRefFile] = useState('');
    const [charGenFileError, setCharGenFileError] = useState('');
    const [imageList, setImageList] = useState([]);
    const {username} = useUser();

    // On page load, retrieves every character a user has uploaded
    useEffect(() => {
        async function loadCharacters() {
            if(!username) return;

            const characters = await fetchAllCharacters(username);

            await setImages(setImageList, characters);
        }
        loadCharacters();
    }, [username]);

    {/* Write a new character to the database*/}
    const handleSubmit = (e) => {
        e.preventDefault() // Prevent page reload
        uploadCharacter(charGenName, charGenRefFile);
    };

    const toggleForm = () => {
        setCharGenHidden((prev) => !prev);
    };

    const handleFileChange = (e) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
        // Example validation: limit file size to 5MB
        if (selectedFile.size > 5 * 1024 * 1024) {
            setCharGenFileError("File size must be less than 5MB.");
            setCharGenRefFile('');
            return;
        }
        setCharGenRefFile(selectedFile);
        setCharGenFileError('');
        }
    };

    // Handle file upload
    return (
        <div id="Characters">
            <TitleBar />

            <div id="CharactersContent">

                <div id="CharactersIntro">
                    <h1>Character Library</h1>
                    <p>Import images and assign aliases to use in your storybooks</p>
                    
                    {/*Button should do a dialog pop-up box to let the user upload or provide a link to an image?*/}
                    <button onClick={() => {toggleForm();}}>Add Character</button>
                    <GooglePhotosButton label="Add Character from Google Photos" username={username} setImageList={setImageList} />


                    {/* */}
                    {charGenHidden && (
                        <form onSubmit={(e) => {
                                e.handleSubmit();
                                e.toggleForm();}}
                            >
                            <label>
                                Character Name:
                                <input
                                    type="text"
                                    name="characterName"
                                    value={charGenName}
                                    onChange={(e) => setCharGenName(e.target.value)}
                                />
                            </label>
                            <label>
                                {/*Todo - change this to use a file*/}
                                Character Reference Image:
                                <input
                                    type="file"
                                    name="characterReference"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    )}
                    
                </div>

            </div>

            {/*Backend call to database, get list of characters & coupled alias, display in list*/}
            {/*Also add button to allow user to add a character, similar to one in the above div*/}
            {/*When listing characters, maybe also include what stories the character is a part of?*/}
            <div id="CharactersBox">
                <div id="ImageList">
                    {/* See backend functions for retrieving photos for changing the attributes each img stores */}
                    {imageList.map((img) => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt="Image"
                            style={{ width: "120px", height: "120px" }}
                        />
                    ))}
                </div>

            </div>

        </div>
    );
}

export default Characters