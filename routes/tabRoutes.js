const express = require('express')
const router = express.Router()
const tabsController = require('../controllers/tabsController')

router.route('/')
    .get(tabsController.getAllTabs)
    .post(tabsController.createNewTab)
    .patch(tabsController.updateTab)
    .delete(tabsController.deleteTab)

module.exports = router