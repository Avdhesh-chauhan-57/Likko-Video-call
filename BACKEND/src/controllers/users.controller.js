import httpStatus from "http-status";
import { User } from "../models/users.model.js";
import bcrypt from "bcrypt"
import crypto from "node:crypto";
import { Meeting } from "../models/meeting.model.js"


const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide " })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User doesn't exit" });
        }
        if (await bcrypt.compare(password, user.password)) {
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `somethings wents wrong ${e}` });
    }

}



const register = async (req, res) => {
    const { name, username, password } = req.body;


    try {
        const exitingUser = await User.findOne({ username });
        if (exitingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already Exits" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User(
            {
                name: name,
                username: username,
                password: hashedPassword
            });

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User register Successfully" })

    } catch (e) {
        res.json({ message: `Somethings went wrong ${e}` })
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token })
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Sometings went Wromg ${e}` })
    }

}


const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {

        const user = await User.findOne({ token: token })
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Added code to the history" })

    } catch (e) {
        res.json({ message: `Sometings went Wrong ${e}` })
    }
}

export { login, register, getUserHistory, addToHistory };