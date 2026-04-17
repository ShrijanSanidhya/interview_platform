export async function getMe(req, res) {
    try {
        // req.user is already populated by protectRoute middleware
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.log("Error in getMe controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

export async function updateRole(req, res) {
    try {
        const userId = req.user._id;
        const { role } = req.body;

        if (!role || !["candidate", "interviewer"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const user = await req.user.constructor.findByIdAndUpdate(userId, { role }, { new: true });

        res.status(200).json({ user });
    } catch (error) {
        console.log("Error in updateRole controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
