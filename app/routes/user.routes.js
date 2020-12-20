const { check } = require("express-validator");

module.exports = (app) => {
  const users = require("../controllers/UserController.js");

  //Create User

    app.post('/api/user/register',[
        check("bvn").isLength({ min: 9 }).isNumeric().not().isEmpty(),
        check("email").isEmail().not().isEmpty(),
        check("password").isLength({ min: 7 }).not().isEmpty()
    ], users.createUser)



  //Login User
  app
    .post("/api/user/login", [
        check("pin").isNumeric(),
      check("email").isEmail().not().isEmpty(),
      check("password")
    ],users.loginUser);

  //forgot password
    app.post("/api/user/forgot",[
        check("email").isEmail().not().isEmpty().normalizeEmail(),
    ],users.forgotPassword);
};
