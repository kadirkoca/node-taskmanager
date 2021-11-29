const express = require('express')
const router = new express.Router
const User = require('../models/user')
const auth = require('../middleware/auth')
const { SendWelcomeEmail, SendCancellationEmail } = require('../email/account')

router.post('/users', async (req, res)=>{
    const user = new User(req.body)

    try {
        const userRec = await user.save()
        const token = await userRec.generateAuthToken()
        SendWelcomeEmail(user.email, user.name)
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/users/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if(user.error){
            return res.status(401).send(user.error)
        }
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})


router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.status(200).send('Logged Out!')
    } catch (error) {
        res.status(500).send()
    }
})


router.post('/users/logoutall', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Logged Out From All Devices!')
    } catch (error) {
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res)=>{    
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send("Invalid Update Operation")
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        SendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        return res.status(500).send(error)
    }
})


module.exports = router