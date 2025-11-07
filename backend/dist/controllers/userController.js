import User from "../models/User.js";
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
export const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email)
            return res.status(400).json({ message: "name and email required" });
        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "Email already used" });
        const newUser = new User({ name, email });
        await newUser.save();
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=userController.js.map