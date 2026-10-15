

import React from 'react'
import "../App.css"
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
    const route = useNavigate();

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Likko Video Call</h2>
                </div>
                <div className="navlist">
                    <p onClick={() => { route("/guest-??zndfgn0nvcnvdngqtu9485468vbwt") }}>Join as Guest</p>
                    <p className='register-btn' onClick={() => { route("/auth") }}>Register</p>
                    <div role="button" className="login-btn">
                        <p onClick={() => { route("/auth") }}>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingmainContainer">
                <div className="main-text">
                    <h1 >
                        <span className="accent">Avdhesh</span><span className='hero-text'>,your loved ones are one tap away</span>
                    </h1>
                    <p className="sub-text">
                        Cover a distance by <span className="accent">Likko video call</span>
                    </p>

                    <div role="button" className="get-btn">
                        <Link to="/auth">Get Started</Link>
                    </div>

                    <div className="feature-row">
                        <img src="/chip-secure.png" alt="End-to-end secure" />
                        <img src="/chip-hd.png" alt="HD video and audio" />
                        <img src="/chip-instant.png" alt="Instant join" />
                    </div>
                    <img className="users-card" src="/card-users.png" alt="10K+ happy users" />
                </div>

                <div className="img-main">
                    <img className="hero-card" src="/zoom-card.png" alt="Likko video call preview" />
                    <img className="float-share" src="/chip-share.png" alt="" />
                    <img className="float-react" src="/pill-reactions.png" alt="" />
                </div>
            </div>
        </div>
    )
}
