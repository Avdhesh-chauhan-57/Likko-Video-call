// import React, { useEffect, useRef, useState } from 'react'
import React, { useCallback, useEffect, useRef, useState, memo } from 'react'
import styles from "../styles/vedioComponent.module.css"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import io from "socket.io-client";
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import server from '../environment';

const server_url = server;
var connections = {};

const peerConfigConnection = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}



const VideoTile = memo(function VideoTile({ stream, socketId }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && ref.current.srcObject !== stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <div>
            <video className={styles.video} data-socket={socketId} ref={ref} autoPlay playsInline />
        </div>
    );
});

const ChatInput = memo(function ChatInput({ onSend }) {
    const [text, setText] = useState("");
    const send = () => {
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };
    return (
        <div className={styles.chattingarea}>
            <TextField value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                label="Enter Your chat" variant="outlined" size="small" />
            <Button variant="contained" className={styles.sendButton} onClick={send}>Send</Button>
        </div>
    );
});





export default function VedioMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let [socketId, setSocketId] = useState("");

    let localVedioRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModel, setShowModel] = useState();
    let [screenAvailable, setScreenAvailable] = useState();
    // let [message, setMessage] = useState("");
    let [messages, setMessages] = useState([]);
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([]);
    const videoRef = useRef([]);
    const [usernameError, setUsernameError] = useState(false);


    // if (isChrome() === false) {

    // }




    const getPermissions = async () => {
        try {
            const videoPermissions = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoPermissions) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false)
            }

            const audioPermissions = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermissions) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getUserMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false)
            }


            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVedioRef.current) {
                        localVedioRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (err) {
            console.log("getPermissions error:", err);
        }
    }




    useEffect(() => {
        getPermissions()
    }, []);







    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVedioRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVedioRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVedioRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }




    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }








    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio, audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => { console.log(e) })
        } else {
            try {
                let tracks = localVedioRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e);
            }
        }
    }





    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);



    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    //TODO when  come its time

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((preMessages) => [
            ...preMessages,
            { sender: sender, data: data }
        ])
        if (socketIdSender !== socketIdRef.current) {
            // setNewMessages((prevNewMessages) => prevNewMessages + 1);
            setNewMessages(prevMessage => (Number(prevMessage) || 0) + 1);
        }
    }



    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);

            socketIdRef.current = socketRef.current.id;
            setSocketId(socketRef.current.id);

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnection)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video

                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }




    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVedioRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVedioRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVedioRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }





    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }



    let connect = () => {
        if (!username.trim()) {
            setUsernameError(true);
            return;
        }
        setUsernameError(false);
        setAskForUsername(false);
        getMedia();
    }


    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])


    let handleScreen = () => {
        setScreen(!screen)
    }


    const sendMessage = useCallback((text) => {
        socketRef.current.emit('chat-message', text, username)
    }, [username]);


    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home"
    }

    return (
        <div>
            {askForUsername === true ?
                <div className={styles.lobbyPage}>
                    <div className={styles.lobbyCard}>
                        <h2 className={styles.lobbyTitle}>
                            Enter into <span>Lobby</span>
                        </h2>
                        <p className={styles.lobbySub}>Check your camera, then join the call</p>

                        <div className={styles.lobbyVideoBox}>
                            <video ref={localVedioRef} autoPlay muted className="lobbyVideo"></video>
                        </div>

                        <TextField
                            id="outlined-basic"
                            label="Username"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                setUsernameError(false);
                            }}
                            variant="outlined"
                            fullWidth
                            className={styles.lobbyInput}
                            error={usernameError} helperText={usernameError ? "Please enter your username" : ""}
                            sx={{
                                "& .MuiInputLabel-root": { color: "#a1a1b5" },
                                "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },

                                "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    borderRadius: "14px",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                                    "&:hover fieldset": { borderColor: "#3b82f6" },
                                    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
                                },

                                /* Stops the white/yellow background when the browser autofills */
                                "& input:-webkit-autofill": {
                                    WebkitBoxShadow: "0 0 0 100px #12121c inset",
                                    WebkitTextFillColor: "#fff",
                                    caretColor: "#fff",
                                    borderRadius: "14px",
                                },
                            }}
                        />

                        <Button variant="contained" onClick={connect} className={styles.lobbyBtn} fullWidth>
                            Connect
                        </Button>
                    </div>
                </div>
                :
                <div className={styles.meetVideoContainer}>
                    {showModel ? <div className={styles.chatroom}>
                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>
                            <div className={styles.chattingDisplay}>
                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => {

                                        console.log(messages)
                                        { item.sender }
                                        return (
                                            <div style={{ marginBottom: "20px" }} key={index}>
                                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p>Say! Hello</p>}
                                </div>


                            </div>
                            {/* <div className={styles.chattingarea}>
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant="contained" className={styles.sendButton} onClick={sendMessage}>Contained</Button>
                            </div> */}
                            <ChatInput onSend={sendMessage} />

                        </div>
                    </div> : <></>}
                    <div className={styles.buttonContainer}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>
                        }
                        <Badge className={styles.massege} badgeContent={Number(newMessages) || 0} max={999} color='secondary'>
                            <IconButton onClick={() => { setShowModel(!showModel); setNewMessages(0) }} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>
                    <video className={styles.meetUserVideo} ref={localVedioRef} autoPlay muted></video>
                    <div className={styles.conferenceView}>
                        {/* {videos.map((video) => (
                            <div key={video.socketId}>

                                <video className={styles.video}
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream
                                        }
                                    }}
                                    autoPlay
                                >

                                </video>


                            </div>))} */}
                        {videos.map((v) => (
                            <VideoTile key={v.socketId} socketId={v.socketId} stream={v.stream} />
                        ))}
                    </div>

                </div>
            }
        </div >
    )
}
