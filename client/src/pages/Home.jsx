import TitleBar from "../components/TitleBar.jsx";
import NavButton from "../components/NavButton.jsx";
import '../styles/Home.css'

function Home() {
    return (
        <div id="Home">
            <TitleBar />

            <div id="HomeContent">

                <div id="HomeIntro">
                    <h1>Create AI-Powered Storybooks</h1>
                    <p>Import your own characters, record audio descriptions,
                        and let AI generate beautiful storybook pages
                    </p>

                    <div id="HomeButtons">
                        <NavButton
                            label="Start Creating"
                            id="HomeStartCreating"
                            destination={"/create"}
                        />
                        <NavButton
                            label="View My Stories"
                            id="HomeViewStories"
                            destination={"/stories"}
                        />
                    </div>
                </div>

                <div id="HomeDescription">
                    <h2>How It Works</h2>
                    <div id="HomeCardDescription">
                        <div className="DescriptionCard">
                            <h3>1. Add Characters</h3>
                            <p>Import images and assign aliases to create your cast of characters</p>
                        </div>

                        <div className="DescriptionCard">
                            <h3>2. Record Audio</h3>
                            <p>Describe each scene with your voice - include characters, actions, and settings</p>
                        </div>

                        <div className="DescriptionCard">
                            <h3>3. Add Characters</h3>
                            <p>AI combines your audio prompt and character images to create unique scenes</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Home