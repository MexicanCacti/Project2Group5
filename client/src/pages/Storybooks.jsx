import TitleBar from "../components/TitleBar.jsx";
import '../styles/Storybooks.css'
import NavButton from "../components/NavButton.jsx";

function Storybooks() {
    return (
        <div id="Stories">
            <TitleBar />

            <div id="StoriesContent">

                <div id="StoriesIntro">
                    <h1>My Storybooks</h1>
                    <p>View and manage your created storybooks</p>
                    <NavButton
                        label="Create New Story"
                        id="StoriesCreateNav"
                        destination={"/create"}
                    />
                </div>

                {/*Backend call to get all the users stories & display them, each one should have...
                    First Page Image, Title, Description, Number Pages, Button to take to create story w/ loaded data
                 */
                }
                <div id="StoriesBox">
                    <NavButton
                        label="Create New Story"
                        id="StoriesCreateNav"
                        destination={"/create"}
                    />
                </div>

            </div>

        </div>
    );
}

export default Storybooks