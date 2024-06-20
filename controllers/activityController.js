const Activity = require('../models/activityModel');
const User = require('../models/userModel');

exports.saveActivity = async (req, res) => {
    const { extracted_skin_tone, predicted_palette } = req.body;
    const userId = req.user;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const existingActivity = await Activity.findBySkinTone(user.email, extracted_skin_tone);

        if (existingActivity.length > 0) {
            return res.status(400).json({ msg: 'Activity with the same skin tone already exists' });
        }

        await Activity.create(user.email, extracted_skin_tone, predicted_palette);

        res.status(201).json({ msg: 'Activity saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getActivities = async (req, res) => {
    const userId = req.user;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const activities = await Activity.findByEmail(user.email);

        if (activities.length === 0) {
            return res.status(404).json({ msg: 'No activities found for this user' });
        }

        res.status(200).json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const result = await Activity.deleteById(id);

        if (result === 0) {
            return res.status(404).json({ msg: 'Activity not found' });
        }

        res.status(200).json({ msg: 'Activity deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
