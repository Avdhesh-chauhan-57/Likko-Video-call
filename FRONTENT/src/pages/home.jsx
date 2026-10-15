import React, { useContext, useState } from 'react'
import "../styles/home.css"
import WithAuth from '../utils/withauth'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton';
import RestoreIcon from '@mui/icons-material/Restore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AuthContext } from '../contexts/AuthContext';



function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [error, setError] = useState(false);

    const { addToUserHistory } = useContext(AuthContext)


    const handleVideoCall = async () => {
        if (!meetingCode.trim()) {
            setError(true);
            return;
        }

        setError(false);

        await addToUserHistory(meetingCode.trim());
        navigate(`/${meetingCode.trim()}`);
    };

    // let handleVideoCall = async () => {
    //     await addToUserHistory(meetingCode)
    //     navigate(`/${meetingCode}`)
    // }
    let handleLogout = () => {
        localStorage.getItem("token");

        navigate("/auth")
    }


    return (
        <>
            <div className="navbar">
                <div className='navleftSide'>
                    <h2>Likko Video Call</h2>
                </div>
                <div className='navRightSide'>
                    <IconButton onClick={() => {
                        navigate("/history")
                    }}>
                        <RestoreIcon />

                    </IconButton>
                    <p onClick={() => {
                        navigate("/history")
                    }}>History</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div className="meetContainer">
                <div className="leftPannel">
                    <div>
                        <h2>
                            Providing Quality Video Call Just like Quality Education
                        </h2>
                        <div>
                            <TextField
                                label="Meeting Code"
                                variant="outlined"
                                value={meetingCode}
                                onChange={(e) => {
                                    setMeetingCode(e.target.value);
                                    setError(false);
                                }}
                                error={error}
                                helperText={error ? "Meeting code is required" : ""}
                            />
                            <Button onClick={handleVideoCall} variant="contained">
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="rightPannel">
                    <img src='../logo3.png'></img>
                </div>
            </div >
        </>
    )
}


export default WithAuth(HomeComponent);