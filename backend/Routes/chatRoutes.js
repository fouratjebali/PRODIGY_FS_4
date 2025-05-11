const express = require('express');
const chatController = require('../Controllers/chatController');


const router = express.Router();

router.post('/create', chatController.createRoom);
router.get('/user-rooms', chatController.getUserRooms);
router.get('/:id', chatController.getRoomById);
router.post('/join/:id', chatController.joinRoom);
router.post('/message', chatController.sendMessage);
router.get('/messages/:roomId', chatController.getMessages);



module.exports = router;