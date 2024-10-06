const express = require('express')
const roomController = require('../../controllers/room.controller')
const asyncHandler = require('../../helpers/asyncHandle')
const { authentication } = require('../../auth/authUtils')
const { uploadFile } = require('../../middleware')

const router = express.Router()

router.use(authentication)

router.get('/', asyncHandler(roomController.getAllRoom))
router.get('/my-room', asyncHandler(roomController.getMyRoom))
router.post('/', uploadFile.single('picture'), asyncHandler(roomController.createRoom))
router.post('/auction', asyncHandler(roomController.handleAuction))

module.exports = router
