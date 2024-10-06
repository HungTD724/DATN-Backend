const express = require('express')

const router = express.Router()

router.use('/room', require('./room'))
router.use('/auth', require('./access'))

module.exports = router
