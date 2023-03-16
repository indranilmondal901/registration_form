require("dotenv").config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middlewire/auth");
const port = process.env.PORT || 3000;

//connection
require("./db/connection")
//model
const Register = require("./models/registerSchema")



//for index.html which we made inside public
const static_Path = path.join(__dirname, "../public");
const new_views_Path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_Path));
app.set("view engine", "hbs");
app.set("views", new_views_Path);
hbs.registerPartials(partial_path)

//middlewire
app.use(express.json()); //==> works for postman
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*::::::::::::::::::::::[ROUTE]:::::::::::::::::::::::: */

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cPassword = req.body.confirm_password;
        if (password === cPassword) {
            let userData = new Register({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                gender: req.body.gender,
                age: req.body.age,
                ph_no: req.body.phone,
                password: req.body.password,
                confirmPassword: req.body.confirm_password
            })
            // console.log(userData);
            //password hasing ==> concept of middlewire
            //jwt ==> middlewire required 
            const token = await userData.generateAuthToken();
            console.log("token from app page==>" + token);


            //The res.cooke() function is used to set the cooke name to value;
            //The value parameter may be a string or obj converted to JSON.
            res.cookie("regJwt", token, {
                expires: new Date(Date.now() + 120000),
                // httpOnly: true 
            });


            userData = await userData.save();
            // res.status(201).send({
            //     status: "sucessfull",
            //     data: userData
            // })
            res.status(201).render("index");
        } else {
            res.send("Password is not matching")
        }

    } catch (err) {
        res.status(400).send("err is =>" + err);
    }
})

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        console.log(`email is ${username} and passwordis ${password}`)
        // const userEmail = await Register.findOne({email: usename} && {password:password})
        const userData = await Register.findOne({ email: username })
        // console.log(userData)

        const checkMatch = await bcrypt.compare(password, userData.password);
        // console.log(password, checkMatch);


        if (checkMatch) {
            const token = await userData.generateAuthToken();
            console.log("token after login==>" + token)

            res.cookie("loginJwt", token, {
                expires: new Date(Date.now() + 120000),
                httpOnly: true,
                // secure: true
            });
            // console.log(`login jwt is --> ${req.cookies.loginJwt}`)

            res.status(201).render("index");
            console.log("login sucessfully");

        } else {
            res.status(400).send("<h1>invalid login credential</h1>")
        }

    } catch (err) {
        res.status(400).send("<h1>login credential not matched</h1>");
    }
})

app.get("/", (req, res) => {
    // res.send("hiii from app");
    res.render("index");
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", auth, async (req, res) => {
    try {
        console.log(`this user is logged out ==> ${req.user}`)

        //logout from single device
        // req.user.tokens = req.user.tokens.filter((val,index,arr)=>{
        //     return val.token != req.token;
        // })

        //logout from all devices
        req.user.tokens = [];

        res.clearCookie("loginJwt")
        await req.user.save();

        // res.send("logout done")
        console.log("User sucessfully logged out");
        res.render("login");
    } catch (err) {
        res.status(500).send(err);
    }
})

//if auth {geniune} user then only render secret page
app.get("/secret", auth, (req, res) => {
    console.log(`login jwt is --> ${req.cookies.loginJwt}`);
    res.render("secret")
})

// PASSWORD
// const securePassword = async (password) =>{
//     const hashedPassword = await bcrypt.hash(password,10); // salt = 10(default),the more round means more secure password
//     console.log(hashedPassword); 

//     const checkpassword = await bcrypt.compare(password,hashedPassword);
//     console.log(checkpassword);
// }
// securePassword("abc123");

app.listen(port, () => {
    console.log("your server is running at port no ==>" + port);
})