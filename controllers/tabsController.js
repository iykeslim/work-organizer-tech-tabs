const Tab = require('../models/Tab')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all tabs 
// @route GET /tabs
// @access Private
const getAllTabs = asyncHandler(async (req, res) => {
    // Get all tabs from MongoDB
    const tabs = await Tab.find().lean()

    // If no tabs 
    if (!tabs?.length) {
        return res.status(400).json({ message: 'No tabs found' })
    }

    // Add username to each tab before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const tabsWithUser = await Promise.all(tabs.map(async (tab) => {
        const user = await User.findById(tab.user).lean().exec()
        return { ...tab, username: user.username }
    }))

    res.json(tabsWithUser)
})

// @desc Create new tab
// @route POST /tabs
// @access Private
const createNewTab = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Tab.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate tab title' })
    }

    // Create and store the new user 
    const tab = await Tab.create({ user, title, text })

    if (tab) { // Created 
        return res.status(201).json({ message: 'New tab created' })
    } else {
        return res.status(400).json({ message: 'Invalid tab data received' })
    }

})

// @desc Update a tab
// @route PATCH /tabs
// @access Private
const updateTab = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm tab exists to update
    const tab = await Tab.findById(id).exec()

    if (!tab) {
        return res.status(400).json({ message: 'tab not found' })
    }

    // Check for duplicate title
    const duplicate = await Tab.findOne({ title }).lean().exec()

    // Allow renaming of the original tab 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate tab title' })
    }

    tab.user = user
    tab.title = title
    tab.text = text
    tab.completed = completed

    const updatedTab = await Tab.save()

    res.json(`'${updatedTab.title}' updated`)
})

// @desc Delete a tab
// @route DELETE /tabs
// @access Private
const deleteTab = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'tab ID required' })
    }

    // Confirm tab exists to delete 
    const tab = await Tab.findById(id).exec()

    if (!tab) {
        return res.status(400).json({ message: 'tab not found' })
    }

    const result = await Tab.deleteOne()

    const reply = `tab '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllTabs,
    createNewTab,
    updateTab,
    deleteTab
}