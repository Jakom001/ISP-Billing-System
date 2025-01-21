require('dotenv').config()
const cron = require("node-cron");
const User = require("../models/userModel");
const RouterOSAPI = require('node-routeros').RouterOSAPI;

function getRouterConnection() {
    return new RouterOSAPI({
        host: process.env.MIKROTIK_HOST,
        user: process.env.MIKROTIK_USER,
        password: process.env.MIKROTIK_PASSWORD,
        port: process.env.MIKROTIK_PORT,
        timeout: 15000  
    });
}

const checkAndDeductUserBalance = async () => {
    let connection = null;
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const userToDisconnect = await User.find({
            connectionExpiryDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate({
            path: "package",
            select: "price"
        });

        if (userToDisconnect.length === 0) {
            console.log("No users found with expired connection date");
            return;
        }

        for (const user of userToDisconnect) {
            const packagePrice = user.package.price;

            if (user.balance >= packagePrice) {
                const now = new Date();
                user.balance -= packagePrice;
                user.connectionExpiryDate = new Date(now.setDate(now.getDate() + 30));
                user.isConnected = true;
                console.log(`User ${user.username} expiry date has been extended. Balance: ${user.balance}`);
            } else {
                user.isConnected = false;

                try {
                    // Create new connection for each user to prevent timeout issues
                    connection = getRouterConnection();
                    await connection.connect();

                    const secrets = await connection.write('/ppp/secret/print', [
                        '=.proplist=.id',
                        '?name=' + user.username
                    ]);

                    if (secrets.length > 0) {
                        await connection.write('/ppp/secret/set', [
                            '=.id=' + secrets[0]['.id'],
                            '=disabled=yes'
                        ]);
                    }

                    const activeConnections = await connection.write('/ppp/active/print', [
                        '?name=' + user.username
                    ]);

                    if (activeConnections.length > 0) {
                        await connection.write('/ppp/active/remove', [
                            '=.id=' + activeConnections[0]['.id']
                        ]);
                    }

                    console.log(`User ${user.username} disconnected due to insufficient balance. Balance: ${user.balance}`);
                } catch (mikrotikError) {
                    console.error(`Mikrotik error disabling user ${user.username}:`, mikrotikError);
                } finally {
                    if (connection) {
                        try {
                            await connection.close();
                            connection = null;
                        } catch (closeError) {
                            console.error("Error closing Mikrotik connection:", closeError);
                        }
                    }
                }
            }

            await user.save();
        }
    } catch (error) {
        console.error("Error checking user connections:", error);
    }
};

// 
const checkBalanceJob = cron.schedule('59 23 * * *', async () => {
    try {
        console.log('Running disconnection job...');
        await checkAndDeductUserBalance();
        console.log('Disconnection job completed');
    } catch (error) {
        console.error('Error in disconnection job:', error);
    }
}, {
    scheduled: true,
    timezone: "Africa/Nairobi"
});

module.exports = { checkBalanceJob  };