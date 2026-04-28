import {useState, useEffect, useRef} from 'react'

import TitleBar from "../components/TitleBar.jsx";
import '../styles/Page.css';
import {TranscribeAudio} from '../services/Audio.js';
import {GenerateImage} from '../services/Photos.js';
import {UploadGooglePhotos} from "../services/Photos.js";

import defaultImage from '../assets/hero.png';
import {useUser} from "../components/UserContext.jsx";

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

function ImageBox({ value, onChange }) {
    return (
        <img
            alt="Generated Image"
            src={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}

function Page() {
    const { username, setUsername } = useUser();
    const [audioDescription, setAudioDescription] = useState('A man smiling while holding a puppy');
    const [generatedImage, setGeneratedImage] = useState(defaultImage);

    async function UploadAudio(AudioBlob){
        const result = await TranscribeAudio(AudioBlob);
        setAudioDescription(result);
    }

    async function UploadText(AudioText) {
        const result = await GenerateImage(AudioText);
        setGeneratedImage(result);
    }

    return (
        <div id="Page">
            <TitleBar />

            <div id="PageImage">
                <ImageBox
                    value={generatedImage}
                    onChange={setGeneratedImage}
                />
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
            </div>

            <div id="ImagePortion">
                <div id="ImageList">
                    <h3>Image List goes here</h3>
                </div>
                <button>Upload Character</button>
                <button onClick={() => UploadGooglePhotos(username)}>Upload from Google Photos</button>
            </div>
        </div>
    );
}

export default Page