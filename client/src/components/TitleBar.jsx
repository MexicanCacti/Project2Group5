import NavButton from './NavButton.jsx'
import '../styles/TitleBar.css'
import LoginBox from './LoginForm.jsx'

function TitleBar(){

    return (
        <div id="TitleBar">
            <NavButton className="TitleButton" id="TitleHome" label="Home" destination={"/"} />
            <NavButton className="TitleButton" id="TitleCharacters" label="Characters" destination={"/characters"} />
            <NavButton className="TitleButton" id="TitleCreate" label="Create Story" destination={"/create"} />
            <NavButton className="TitleButton" id="TitleStories" label="My Storybooks" destination={"/stories"} />
            <LoginBox />
        </div>
    );
}

export default TitleBar;