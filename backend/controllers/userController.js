require('dotenv').config()
const User = require("../models/userModel");
const Package = require("../models/packageModel");
const RouterOSAPI = require('node-routeros').RouterOSAPI;
const { userSchema, checkConnectionExpiryDate } = require("../middlewares/validator");
const connection = require('mikrotik/lib/connection');

function getRouterConnection(){
    return  new RouterOSAPI({
        host: process.env.MIKROTIK_HOST,
        user: process.env.MIKROTIK_USER,
        password: process.env.MIKROTIK_PASSWORD,
        port: process.env.MIKROTIK_PORT,
    });
}

const getUsers = async (req, res) =>{
    try{
        const result = await User.find().sort({createdAt: -1}).populate({
            path: "package",
            select: "packageName"
        })
        res.status(200).json({success:true, message: "users", data:result})
    }catch(error){
        res.status(500).json({
            success:true,
            message: "Error retrieving users",
            error: error.message})
    }
}

const getUserById = async (req, res) =>{
    try{
        const result = await User.findById(req.params.id).populate("package")
        if(!result){
            return res.status(404).json({success:false, message: "User not found"})
        }
        res.status(200).json({success:true, message: "User", data:result})
    }
    catch(error){
        res.status(500).json({success:false, message: "Error retrieving user", error: error.message})
    }
}

const addUser = async(req,res) =>{
    const {
        type,
        firstName,
        lastName,
        username,
        userPaass,
        packageId,
        email,
        phoneNumber,
        address,
        comment,
    } = req.body;

    try {
        const {error, value} = userSchema.validate({
            type,
            firstName,
            lastName,
            username,
            userPaass,
            packageId,
            email,
            phoneNumber,
            address,
            comment,
        })

        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }
        
        // Validate the package
        const selectedPackage = await Package.findById(packageId);
        console.log(selectedPackage)
        if (!selectedPackage) {
        return res.status(400).json({ message: "Invalid package selected" });
        }

        const user = new User(
            {
                type,
                firstName,
                lastName,
                username,
                userPaass,
                package: packageId,
                balance: 0,
                email,
                phoneNumber,
                address,
                comment,
            }
        );
        const saveUser = await user.save();

        // Create a new user on the Mikrotik RouterOS
        try{
            const conn = getRouterConnection();

            await conn.connect();

            await conn.write('/ppp/secret/add', [
                '=name=' + username,
                '=password=' + userPaass,
                '=service=pppoe',
                '=profile='+selectedPackage.packageName,
                '=disabled=yes',
                '=comment=' + `${firstName} ${lastName} - ${comment || ''}`,
            ]);
            conn.close();

        res.status(201).json({message: "User created successfully", data: saveUser});
    

        }catch (mikrotikError){
            await User.findByIdAndDelete(user._id)
            console.log("Error Creating mikrotik user: ", mikrotikError)
            return res.status(500).json({message: "Failed to create Mikrotik User", error: error.message})
        }  
    }catch (error){
        console.error('Error creating User:', error);
        return res.status(400).json({
            success: false,
            message: 'Error creating User',
            error: error.message,
        });  
    }
}


const updateUser = async (req, res) => {
    const {
        type,
        firstName,
        lastName,
        username,
        userPaass,
        packageId,
        email,
        phoneNumber,
        connectionExpiryDate,
        address,
        comment,
    } = req.body;

    try {
        // Validate input
        const {error, value} = userSchema.validate({
            type,
            firstName,
            lastName,
            username,
            userPaass,
            packageId,
            email,
            phoneNumber,
            connectionExpiryDate,
            address,
            comment,
        });

        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        // Find the existing user first
        const existingUser = await User.findById(req.params.id).populate('package');
        if (!existingUser) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        // Validate the new package
        const selectedPackage = await Package.findById(packageId);
        if (!selectedPackage) {
            return res.status(400).json({message: "Invalid package selected"});
        }

        try {
            // Update Mikrotik profile first
            const connection = getRouterConnection()

            await connection.connect();

            // Find existing PPPoE secret
            const secrets = await connection.write('/ppp/secret/print', [
                '=.proplist=.id',
                '?name=' + existingUser.username
            ]);

            if (secrets.length > 0) {
                // Update the PPPoE secret
                await connection.write('/ppp/secret/set', [
                    '=.id=' + secrets[0]['.id'],
                    '=name=' + username,
                    '=password=' + userPaass,
                    '=profile=' + selectedPackage.packageName,
                    '=comment=' + `${firstName} ${lastName} - ${comment || ''}`,
                    // Add other relevant Mikrotik properties you want to update
                ]);

                connection.close();

                // If Mikrotik update succeeds, update MongoDB
                const result = await User.findByIdAndUpdate(
                    req.params.id,
                    {
                        type,
                        firstName,
                        lastName,
                        username,
                        userPaass,
                        package: packageId,
                        email,
                        phoneNumber,
                        connectionExpiryDate,
                        address,
                        comment,
                    },
                    {new: true}
                ).populate('package');

                res.status(200).json({
                    success: true,
                    message: "User and PPPoE secret updated successfully",
                    data: result
                });
            } else {
                connection.close();
                res.status(404).json({
                    success: false,
                    message: "PPPoE secret not found in Mikrotik"
                });
            }

        } catch (mikrotikError) {
            console.error("Error updating Mikrotik PPPoE secret:", mikrotikError);
            res.status(500).json({
                success: false,
                message: "Failed to update Mikrotik PPPoE secret",
                error: mikrotikError.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

const deleteUser = async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({success:false, message: "User not found"})
        }
        try{
            const conn = getRouterConnection();
            await conn.connect();
            
            // First find the item to get its ID
            const items = await conn.write('/ppp/secret/print', [
                '=.proplist=.id',
                '?name=' + user.username
            ]);

            if (items.length > 0) {
                // Delete using the internal ID
                await conn.write('/ppp/secret/remove', [
                    '=.id=' + items[0]['.id']
                ]);
            }
            conn.close();

            const result = await User.findByIdAndDelete(req.params.id);
            
            res.status(200).json({success:true, message: "User deleted successfully", data:result})

        } catch (mikrotikError) {
            console.error("Error deleting username in mikrotik: ", mikrotikError);
            res.status(500).json({ 
                success: false, 
                message: "Failed to delete Mikrotik profile", 
                error: mikrotikError.message 
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error user",
            error: error.message,
        });
    }
};

const changeExpiryDate = async (req, res) =>{
    const {connectionExpiryDate} = req.body;

    try{
        const {error, value} = checkConnectionExpiryDate.validate({connectionExpiryDate});
        if(error){
            return res.status(400).json({
                message: "Expiry Date Validation failed",
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { connectionExpiryDate }, {new: true});
        if(!user){
            return res.status(404).json({success:false, message: "User not found"})
        }
        res.status(200).json({success:true, message: "User updated successfully", data: user})
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message,
        });
    }
}
    const activeUsers = async () => {
        // return User.find({connectionExpiryDate: {$gte: new Date()}}).populate('package');

        try{
            const conn = getRouterConnection()
            await conn.connect();

            // Find all active users
            const users = await conn.write('/ppp/active/print');
            
            if(users.length === 0){
                return res.status(200).json({success: true, message: "No active users found"})
            }
            res.status(200).json({success: true, message: "Active users", data: users})
    
        }catch(e){
            console.error("Error getting active users: ", e);
            res.status(500).json({ 
                success: false, 
                message: "Failed to connect to Mikrotik", 
                error: e.message 
            });
        }
    }

    const expiredUsers = () => {
        return User.find({connectionExpiryDate: {$lt: new Date()}}).populate('package');
    }
    const enabledUsers = async() => {
        let connection = null;
        try {
            // Establish connection
            connection = getRouterConnection();
            await connection.connect();
    
            // Get all disabled PPP secrets
            const disabledUsers = await connection.write('/ppp/secret/print', [
                '=.proplist=.id,name,profile,comment,disabled',
                '?disabled=yes'
            ]);
    
            return {
                success: true,
                users: disabledUsers.map(user => ({
                    id: user['.id'],
                    username: user.name,
                    profile: user.profile,
                    comment: user.comment,
                    disabled: user.disabled
                }))
            };
    
        } catch (error) {
            console.error('Error fetching disabled users:', error);
            return { success: false, message: error.message, users: [] };
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error("Error closing Mikrotik connection:", closeError);
                }
            }
        }
    }

    const activateUser = async (req, res) => {
        try{
            const user = await User.findById(req.params.id);

            if(!user){
                return res.status(404).json({success:false, message: "User not found"})
            }
            try{
                const conn = getRouterConnection();
                await conn.connect();
                
                // First find the item to get its ID
                const items = await conn.write('/ppp/secret/print', [
                    '=.proplist=.id',
                    '?name=' + user.username
                ]);
                
                if (items.length > 0) {
                    // Activate using the internal ID
                    await conn.write('/ppp/active/set', [
                        '=.id=' + items[0]['.id'],
                        '=status=active'
                    ]);
                    conn.close();
                    user.connectionExpiryDate = new Date();
                    await user.save();
                    res.status(200).json({success: true, message: "User activated successfully", data: user})
                    return;
                    
                } else {
                    conn.close();
                    return res.status(404).json({success: false, message: "PPPoE secret not found in Mikrotik"})
                }

    
            }catch(e) {
                console.error("Error getting username in mikrotik: ", e);
                res.status(500).json({ 
                    success: false, 
                    message: "Failed to connect to Mikrotik", 
                    error: e.message 
                });
    
        }
    }catch (error){
            res.status(500).json({
                success: false,
                message: "Error getting user",
                error: error.message,
            });
        }
        }
    

    const disconnectUser = async (req, res) => {
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json({success:false, message: "User not found"})
            }

            try{
                const conn = getRouterConnection();
                await conn.connect();
                
                // First find the item to get its ID
                const secrets = await conn.write('/ppp/secret/print', [
                    '=.proplist=.id',
                    '?name=' + user.username
                ]);
                
                if (secrets.length > 0) {
                    // Deactivate using the internal ID
                    await conn.write('/ppp/secret/set', [
                        '=.id=' + secrets[0]['.id'],
                        '=disabled=yes'
                    ]);
                }

                // Then remove any active connections
                const activeConnections = await connection.write('/ppp/active/print', [
                    '?name=' + username
                ]);
                
                if (activeConnections.length > 0) {
                    await conn.write('/ppp/active/remove', [
                        '=.id=' + activeConnections[0]['.id']
                    ]);    
                }
                   return res.status(200).json({success: true, message: "User deactivated successfully", data: user})
                await conn.close()
            }catch(e) {
                console.error("Error getting username in mikrotik: ", e);
                res.status(500).json({
                    success: false,
                    message: "Failed to connect to Mikrotik",
                    error: e.message,
                });
            }

        }catch (err){
            console.error("Error getting username in mikrotik: ", err)

            res.status(500).json({
                success: false,
                message: "Error getting user",
                error: e.message,
            });
        }
    }

module.exports = {
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getUserById,
    changeExpiryDate,
    activeUsers,
    expiredUsers,
    activateUser,
    disconnectUser,
}