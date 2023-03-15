require("dotenv").config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
app.use(express.json()) //==> works for postman
app.use(express.urlencoded({ extended: false }))

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
            console.log(userData);
            //password hasing ==> concept of middlewire
            //jwt ==> middlewire required 
            const token = await userData.generateAuthToken();
            console.log("token from app page==>" + token);
            userData = await userData.save();
            // res.status(201).send({
            //     status: "sucessfull",
            //     data: userData
            // })
            res.status(201).render("index")
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