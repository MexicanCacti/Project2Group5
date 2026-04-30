import DisplayCharacter from "./CharacterBox.jsx";

function DisplayCharacters({ID, username, ImageList, OnImageClick, OnChangeAlias, DisplayStories}){
    return(
        <div id={ID}>
            {ImageList.map((img) => (

                <DisplayCharacter
                    key={img.id}
                    sourceID={img.id}
                    username={username}
                    CharacterAlias={img.alias || ""}
                    CharacterImage={img.url}
                    CharacterStories={img.storyList}
                    OnImageClick={() => OnImageClick?.(img.id, img.url)}
                    OnChangeAlias={OnChangeAlias}
                    DisplayStories={DisplayStories}
                />
            ))}
        </div>
        );
}

export default DisplayCharacters