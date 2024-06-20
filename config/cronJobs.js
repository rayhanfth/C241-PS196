const cron = require('node-cron');
const User = require('../models/userModel');

cron.schedule('0 * * * *', async () => {
    try {
        const users = await User.findUnverifiedUsers();

        const currentTime = new Date().getTime();

        users.forEach(async (user) => {
            const userCreationTime = new Date(user.created_at).getTime();
            const timeDiff = (currentTime - userCreationTime) / (1000 * 60);

            if (timeDiff >= 60) {
                await User.deleteById(user.id);
                console.log(`Deleted unverified user: ${user.email}`);
            }
        });
    } catch (err) {
        console.error('Error deleting unverified users:', err.message);
    }
});
