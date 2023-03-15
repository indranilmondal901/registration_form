const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    ph_no: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})



//GENERATING TOKENS (instance--> instance.method || model --> model.static)
registerSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(process.env.SECRET_KEY);
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY) // uniq , secret(min=>32 ch)
        console.log("token from register page==>" + token);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    } catch (err) {
        console.log("the err is==>" + err);
        res.send("the err is==>" + err);
    }
}

//CONVERTING PASSWORD INTO HASH USUING BCRYPT
//middlewire for schema(pre/post)
registerSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log(`the current password is ${this.password}`)
        // const hashedPassword = await bcrypt.hash(password,10);
        this.password = await bcrypt.hash(this.password, 10); // salt = 10
        console.log(`the hased password is ${this.password}`);
        this.confirmPassword = await bcrypt.hash(this.confirmPassword,10);
    }
    next(); //for next //???? not required ???
})


const Register = new mongoose.model("Register", registerSchema);

module.exports = Register;