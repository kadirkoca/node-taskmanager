const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email:{
        type: String,
        unique:true,
        trim:true,
        lowercase:true,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email type is not valid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.length < 7 || value.toLowerCase().includes('password')){
                throw new Error('Invalid Password')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){

        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id:this._id.toString()}, process.env.APP_SECRET)
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        return {error: 'No record found with given credentials'}
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return {error: 'No record found with given credentials'}
    }

    return user
}


userSchema.pre("save", async function(next){

    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    
    next()
})

userSchema.pre('remove', async function(next){
    await Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User