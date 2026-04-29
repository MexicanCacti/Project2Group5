import {addImages, PollForPickedGooglePhoto, UploadGooglePhotos} from "../services/Photos.js";

async function HandleGooglePhotosUpload({username, setImageList}){
    console.log({username});
    const session =  await UploadGooglePhotos(username);
    if(!session) return;

    // wait until picker uri is closed/image selected, eventually backend will send image information for download
    const picked = await PollForPickedGooglePhoto(username, session.sessionID);
    if(!picked) return;

    await addImages(setImageList, picked);
}

function GooglePhotosButton({label, username, setImageList}){
    return (
        <>
            <button onClick={() => HandleGooglePhotosUpload({username, setImageList}) }>{label}</button>
        </>
    )
}

export default GooglePhotosButton;