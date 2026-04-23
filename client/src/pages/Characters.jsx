import TitleBar from "../components/TitleBar.jsx";
import '../styles/Characters.css'

function Characters() {
    return (
        <div id="Characters">
            <TitleBar />

            <div id="CharactersContent">

                <div id="CharactersIntro">
                    <h1>Character Library</h1>
                    <p>Import images and assign aliases to use in your storybooks</p>
                    {/*Button should do a dialog pop-up box to let the user upload or provide a link to an image?*/}
                    <button>Add Character</button>
                </div>

            </div>

            {/*Backend call to database, get list of characters & coupled alias, display in list*/}
            {/*Also add button to allow user to add a character, similar to one in the above div*/}
            {/*When listing characters, maybe also include what stories the character is a part of?*/}
            <div id="CharactersBox">


            </div>

        </div>
    );
}

export default Characters