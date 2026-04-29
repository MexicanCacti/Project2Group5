import TitleBar from "../components/TitleBar.jsx";
import '../styles/CreateStory.css'

function CreateStory() {
    return (
        <div id="CreateStory">
            <TitleBar />
            <form onSubmit={onSubmit}>
                <input defaultValue="Enter the name of your story" />
                <input defaultValue="Enter the description of your story" />
            </form>
            {/* Component to allow users to select characters from their list of uploaded characters to include in the story*/}
            {/* Once the characters & title of the story are inputted, make a backend call to create an entry into the database
                With the story information (title, desc, [list of character sourceIDs]) Then redirect to a page that looks similar to Page.jsx*/}
        </div>
    );
}

export default CreateStory