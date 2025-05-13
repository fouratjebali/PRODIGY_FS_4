const express = require('express');
const chatController = require('../Controllers/chatController');
const { authenticate } = require('../Middlewear/authMiddlewear'); 


const router = express.Router();

router.post('/create', authenticate,chatController.createRoom);
router.get('/user-rooms',authenticate, chatController.getUserRooms);
router.get('/:id',authenticate, chatController.getRoomById);
router.post('/join/:id',authenticate, chatController.joinRoom);
router.post('/message', authenticate,chatController.sendMessage);
router.get('/messages/:roomId', authenticate,chatController.getMessages);



module.exports = router;