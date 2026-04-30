import {useState, useEffect, useRef} from 'react'

import TitleBar from "../components/TitleBar.jsx";
import '../styles/Page.css';
import {TranscribeAudio} from '../services/Audio.js';
import { GenerateImage, setImages } from '../services/Photos.js';

import {changeCharacterAlias} from '../services/Characters.js';

import defaultImage from '../assets/hero.png';
import {useUser} from "../components/UserContext.jsx";
import GooglePhotosButton from '../components/GooglePhotosButton.jsx';
import DisplayCharacters from "../components/CharacterDisplay.jsx";
import {useLocation} from "react-router-dom";
import {addPage, fetchPageInfo, fetchStoryCharacters, NavigateStoryPage, savePage} from "../services/Storybooks.js";
import {useNavigate} from "react-router-dom";

/*
* Code adapted from:
* Title: simple-react-recorder
* Author: cassidoo
* Date: 2024
* Availability: https://gist.github.com/cassidoo/dd1190c248d60c723de14fe9ee32f450
*
* Creates a component to obtain microphone permissions, record audio, allow replay, and submission
* HandleRecording: Function to call to handle the raw recorded audio input, should have an argument for receiving this input
 */
function SimpleRecordButton( {HandleRecording} ) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioStream, setAudioStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef(null);
    const RECORDING_MAX_DURATION = 60; // 4 minutes in seconds

    useEffect(() => {
        if (!audioStream) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    setAudioStream(stream);
                    const mediaRecorder = new MediaRecorder(stream);
                    setMediaRecorder(mediaRecorder);
                    let audio;

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audio = [event.data];
                        }
                    };

                    mediaRecorder.onstop = (event) => {
                        const b = new Blob(audio, { type: "audio/wav" });
                        setAudioBlob(b);
                        console.log("audioBlob", b);
                    };
                })
                .catch((error) => {
                    console.error("Error accessing microphone:", error);
                });
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [audioStream]);

    const handleToggleRecording = (event) => {
        event.preventDefault();
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setAudioBlob(null);
        timerRef.current = setInterval(() => {
            setRecordingTime((prevTime) => {
                if (prevTime >= RECORDING_MAX_DURATION - 1) {
                    stopRecording();
                    return RECORDING_MAX_DURATION;
                }
                return prevTime + 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        mediaRecorder.stop();
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div>
            <button
                onClick={handleToggleRecording}
                className={`bg-red-400 hover:opacity-80 text-white font-bold py-2 px-4 rounded`}
            >
                {isRecording ? (
                    <>
                        <span className={`mr-3 ${isRecording && "animate-pulse"}`}>●</span>{" "}
                        Stop Recording
                    </>
                ) : audioBlob ? (
                    "Redo recording"
                ) : (
                    "Start Recording"
                )}
            </button>
            <div>
                {isRecording && (
                    <div>
                        <p>Recording...</p>
                        <p>Time: {formatTime(recordingTime)}</p>
                    </div>
                )}
            </div>
            {audioBlob && (
                <>
                    <div>Preview recording before submitting:</div>
                    <audio controls>
                        <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    </audio>
                    <button onClick={() => HandleRecording(audioBlob)}>Submit Recording</button>
                </>
            )}
        </div>
    );
}

/*
* Set up a text box so that when the audio is transcribed, the user can check and make any corrections
* before sending for image processing.
 */
function AudioBox({ value, onChange }) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function ImageBox({ value }) {
    return (
        <img
            alt="Generated Image"
            src={value}
        />
    );
}


function Page() {
    const { username, setUsername } = useUser();
    const [audioDescription, setAudioDescription] = useState('A man smiling while holding a puppy');
    const [generatedImage, setGeneratedImage] = useState(defaultImage);
    const [generatedSource, setGeneratedSource] = useState("");
    const [characterList, setCharacterList] = useState([]);
    const [storyID, setStoryID] = useState(null);
    const [storyTitle, setStoryTitle] = useState('');
    const [pageNumber, setPageNumber] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [pageInfo, setPageInfo] = useState(null);

    // So that when we are redirected to a page with the passed in states, we can populate the page's state
    const location = useLocation();

    const navigate = useNavigate();

    // Use location states to populate
    useEffect(() => {
        if(!location.state) return;
        setStoryID(location.state.storyID);
        setStoryTitle(location.state.storyTitle);
        setPageNumber(location.state.pageNumber);
        setCharacterList(location.state.characterList);
        setUsername(location.state.username);
        setPageCount(location.state.pageCount);
        setPageInfo(location.state.pageInfo);

        console.log(location.state.characterList);
    }, [location.state, setUsername]);

    // Now retrieve the rest of the needed info
    useEffect(() => {
        if(username === undefined || username === null || storyID === undefined || storyID === null) return;

        async function loadCharacters() {
            let characters = await fetchStoryCharacters(username, storyID);
            await setImages(setCharacterList, characters);
        }

        async function createPage() {
            let currentPageInfo = pageInfo;
            if(currentPageInfo === null || currentPageInfo === undefined){
                currentPageInfo = await addPage(username, pageNumber, storyID);
                if(currentPageInfo) setPageInfo(currentPageInfo);
            }
            await savePage(username, pageNumber, generatedSource, audioDescription, currentPageInfo.pageID);
        }

        // NOTE: In console should fail if this was redirected straight from Create Story!
        async function loadPageInfo(){
            let pageInfo = await fetchPageInfo(username, storyID, pageNumber);
            if(pageInfo?.audioPrompt) setAudioDescription(pageInfo.audioPrompt);
            if(pageInfo?.generatedImage) setGeneratedImage(pageInfo.generatedImage);
            if(pageInfo?.sourceID) setGeneratedSource(pageInfo.sourceID);
        }
        createPage();
        loadCharacters();
        loadPageInfo();
    }, [username, storyID, pageNumber, pageInfo]);

    async function UploadAudio(AudioBlob){
        const result = await TranscribeAudio(AudioBlob);
        setAudioDescription(result);
    }

    async function UploadText(AudioText) {
        const result = await GenerateImage(AudioText);
        setGeneratedImage(result);
    }

    async function handleSavePage(){
        const result = await savePage(username, pageNumber, generatedSource, audioDescription, pageInfo.pageID);
    }

    async function handlePrevPage() {
        if(pageNumber <= 0) return;
        await handleSavePage();
        NavigateStoryPage(navigate, username, storyID, storyTitle, characterList, pageNumber - 1, pageCount, null);
    }

    async function handleNextPage() {
        await handleSavePage();
        const nextPageNumber = pageNumber + 1;
        const nextPageCount = nextPageNumber > pageCount - 1 ? pageCount + 1 : pageCount;
        setPageCount(pageCount + 1);
        NavigateStoryPage(navigate, username, storyID, storyTitle, characterList, nextPageNumber, nextPageCount, null);
    }

    return (
        <div id="Page">
            <TitleBar />
            <div id="PageImage">
                <h1>StoryTitle: {storyTitle}</h1>
                <ImageBox value={generatedImage} />
                <p>Page[{pageNumber}]</p>
                <div id="PageImageNavigation">
                    {pageNumber > 0 && (
                        <button onClick={handlePrevPage}>
                            Previous Page
                        </button>
                    )}
                    {pageNumber >= 0 && (
                        <button onClick={handleNextPage}>Next Page
                        </button>
                    )}
                </div>
            </div>


            <div id="AudioPortion">
                <h3>Transcribed Audio</h3>
                <div id="AudioTranscriptBox">
                    <AudioBox
                        value={audioDescription}
                        onChange={setAudioDescription}/>
                </div>
                <SimpleRecordButton
                    HandleRecording={ UploadAudio }
                />
                <button onClick={() => UploadText(audioDescription)}>Generate Image</button>
                <button onClick={() => handleSavePage()}>Save Page</button>
            </div>

            <div id="ImagePortion">
                <DisplayCharacters ID="PageImages" username={username} ImageList={characterList} OnChangeAlias={changeCharacterAlias}/>
                <button>Upload Character</button>
                <GooglePhotosButton label="Upload from Google Photos" username={username} setImageList={setCharacterList} />
            </div>
        </div>
    );
}

export default Page