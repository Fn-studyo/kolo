require('dotenv').config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const crypto = require("crypto");
const User = require("../models/User.js");
const { validationResult } = require("express-validator/check");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, //ssl
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_SECRET
  },
  tls: {
    rejectUnauthorized: false
  }
});

const handlebarOptions = {
  viewPath: "./app/templates/",
  extName: ".hbs"
};

transporter.use("compile", hbs(handlebarOptions));

exports.createUser = async (req, res) => {
  const data = req.body;
  const user = new User();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (await User.findOne({ email: data.email })) {
    return res.status(404).send({
      status: 404,
      message: `${data.email} already exists in the database`
    });
  }
  fetch(`https://api.flutterwave.com/v3/kyc/bvns/${data.bvn}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer FLWSECK_TEST-SANDBOXDEMOKEY-X`,
      "Content-Type": "application/json"
    }
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.status === "success") {
        bcrypt.hash(data.password, saltRounds, (err, hash) => {
          crypto.randomBytes(20, (err, buffer) => {
            const token = buffer.toString("hex");
            let HelperOptions = {
              from: `Kolo ${process.env.EMAIL_ADDRESS}`,
              to: data.email,
              subject: "Kolo | Activate Account",
              context: {
                name: json.data.first_name + "" + json.data.last_name,
                email: data.email,
                url: "http://localhost:8080/activate?key=" + token
              }
            };
            user.name = json.data.first_name + "" + json.data.last_name;
            user.email = data.email;
            user.phone = json.data.phone_number;
            user.savings = [];
            user.bank_code = "";
            user.verified = false;
            user.password = hash;
            user.userToken = token;
            user.resetPasswordExpire = Date.now() + 86400000;
            if (user.save()) {
              transporter.sendMail(HelperOptions, (error, info) => {
                if (error) {
                  return res.json(error);
                } else {
                  return res.send({
                    userToken: token,
                    resetPasswordExpires: Date.now() + 3600000,
                    message: `A verification link has been sent to ${data.email}.`
                  });
                }
              });
            }
          });
        });
      } else {
        return res.status(400).send({
          message: "Invalid BVN"
        });
      }
    });
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  const { email, password, pin } = req.body;
  pin ?  await passwordLess(email, pin, res) : await passwordFull(email, password, res);
};


async function passwordFull(email, password, res) {
  try{
    let user = await User.findOne({
      email
    });
    if (!user)
      return res.status(401).json({
        message: 'Password or email address may be incorrect'
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        message: "Unauthorized !"
      });
    const payload = {
      user: user
    };
    jwt.sign(
        payload,
        "secret Key",
        {
          expiresIn: '20 days'
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token
          });
        }
    );
  }catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error"
    });
  }
}



async function passwordLess(email,pin,res) {
  try{
    let user = await User.findOne({
      email,
      pin
    });
    if(user){
      const payload = {
        user: user
      };
      jwt.sign(
          payload,
          "secret Key",
          {
            expiresIn: '20 days'
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
      );
    }
  }catch (e){
    console.error(e);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}