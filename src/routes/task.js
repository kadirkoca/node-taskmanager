const express = require('express')
const router = new express.Router
const Task = require('../models/task')
const auth = require('../middleware/auth')



router.post('/tasks', auth, async (req, res)=>{
    const task = new Task(req.body)
    task.owner = req.user._id
    await task.save().then((task)=>{
        res.status(201).send(task)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})

router.get('/tasks', auth, async (req, res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const sortParts = req.query.sortBy.split(':')
        sort[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1
    }
    
    try {
        await req.user.populate({ 
            path: 'tasks',
            match,
            options: {
                limit: req.query.limit === undefined ? 100 : parseInt(req.query.limit),
                skip: req.query.skip === undefined ? 0 : parseInt(req.query.skip),
                sort
            },
        })
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get('/tasks/:id', auth, async (req, res)=>{  
    await Task.findOne({_id: req.params.id, owner: req.user._id}).then((task)=>{
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }).catch((error)=>{
        res.status(500).send(error)
    })
})

router.patch('/tasks/:id', auth, async (req, res)=>{
    const fields = Object.keys(req.body)
    const allowedFields = ["completed", "description"]
    const isValidOperation = fields.every((field) => allowedFields.includes(field))
    if(!isValidOperation){
        return res.status(404).send("Invalid operation")
    }
    try {
        const task = await Task.findOneAndUpdate({_id: req.params.id, owner: req.user._id}, {...req.body})
        if(!task){
            return res.status(404).send("Requested task could not be found")
        }
        res.send(task)
    } catch (error) {
        return res.status(500).send(error)
    }
})




router.delete('/tasks/:id', auth, async (req, res)=>{
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send("Requested task could not be found")
        }
        res.send(task)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router