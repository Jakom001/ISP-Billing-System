const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

router.get("/all-users", userController.getUsers);

router.post('/add-user', userController.addUser)

router.put('/update-user/:id', userController.updateUser)

router.delete('/delete-user/:id', userController.deleteUser)

router.get('/single-user/:id', userController.getUserById)

router.post('/change-expiry-date/:id', userController.changeExpiryDate)


module.exports = router