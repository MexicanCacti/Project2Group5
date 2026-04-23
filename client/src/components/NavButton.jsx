import { useNavigate } from "react-router-dom"
import '../styles/NavButton.css'

/*
    NavButton function accepts the following props:
        label - Text button should display
        image - Image button should have (be left of text)
        id - id button should hold for styling
        className - Same as id
    Basically just a reusable component for creating any clickable navigation button
 */
function NavButton({label, destination, image, id = "NavButtonId", className = "NavButton"}) {
    const navigate = useNavigate();

    let imageElement = null;

    if (image) {
        imageElement = (
            <img
                src={image}
                alt=""
                className="navButtonImage"
            />
        );
    }

    return (
        <button
            className={className}
            id={id}
            onClick={() => navigate(destination)}
        >
            {imageElement}
            <span>{label}</span>
        </button>
    );
}

export default NavButton