import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import "../styles/history.css"

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);

            } catch (e) {
                throw e
            }
        }
        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`
    }

    return (
        <div className="history-page">
            <div className="history-header">
                <IconButton onClick={() => routeTo("/home")}>
                    <KeyboardBackspaceIcon />
                </IconButton>
                <h2>Meeting History</h2>
            </div>

            <div className="history-list">
                {meetings.length === 0 ? (
                    <p className="history-empty">No meetings yet.</p>
                ) : (
                    meetings.map((e, i) => (
                        <Card key={e._id || i} variant="outlined" className="history-card">
                            <CardContent>
                                <Typography gutterBottom className="history-code" sx={{ fontSize: 14 }}>
                                    Meeting-Code: {e.meetingCode}
                                </Typography>
                                <span className="history-date">Date: {formatDate(e.date)}</span>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )

}

export default History