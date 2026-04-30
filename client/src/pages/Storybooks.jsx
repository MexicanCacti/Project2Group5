import TitleBar from "../components/TitleBar.jsx";
import '../styles/Storybooks.css'
import NavButton from "../components/NavButton.jsx";
import {useEffect, useState} from "react";
import {fetchAllStories, fetchPageInfo, NavigateStoryPage, removeStory} from "../services/Storybooks.js";

import {useUser} from "../components/UserContext.jsx";
import {useNavigate} from "react-router-dom";

function Storybooks() {
    const [stories, setStories] = useState([]);
    const {username} = useUser();
    const navigate = useNavigate();

    // On page load, retrieves every storybook a user created
    useEffect(() => {
        async function loadStories() {
            if(!username) return;

            const stories = await fetchAllStories(username);
            setStories(stories.stories)
        }
        loadStories();
    }, [username]);

    async function handleStoryRemove(username, storyID){
        const result = await removeStory(username, storyID);
        if(result === null){
            return;
        }

        setStories((prev) => prev.filter((story) => story.id !== storyID));
    }
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

                <div id="StoriesBox">
                    {stories.length === 0 ? (
                        <p>No storybooks found.</p>
                    ) : (
                        stories.map((story) => (
                            <div key={story.id} className="StoryBox">
                                <h2>{story.title || "Untitled Story"}</h2>
                                <p>{story.description || "No description"}</p>
                                <p>Pages: {story.pageCount}</p>

                                <NavButton
                                    label="Open"
                                    id={`open-${story.id}`}
                                    OnClick= {() =>
                                        NavigateStoryPage(navigate, username, story.id, story.title, [], 0, story.pageCount, null)}
                                />
                                <NavButton
                                    label="Remove"
                                    id={`delete-${story.id}`}
                                    OnClick= {() => handleStoryRemove(username, story.id)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Storybooks