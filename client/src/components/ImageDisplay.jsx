import DisplayCharacter from "./CharacterDisplay";

function DisplayImages({ID, username, ImageList, OnImageClick, OnChangeAlias}){

    return(
        <div id={ID}>
            {ImageList.map((img) => (

                <DisplayCharacter
                    key={img.id}
                    sourceID={img.id}
                    username={username}
                    CharacterAlias={img.alias || ""}
                    CharacterImage={img.url}
                    OnImageClick={() => OnImageClick?.(img.id, img.url)}
                    OnChangeAlias={OnChangeAlias}
                />
            ))}
        </div>
        );
}

export default DisplayImages