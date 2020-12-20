const { body } = require("express-validator");

module.exports = (app) => {
  const users = require("../controllers/UserController.js");

  //Create User

  app
    .route("/api/user/register", [
      body("bvn").isLength({ min: 9 }).isNumeric(),
      body("email").isEmail(),
      body("password").isLength({ min: 7 })
    ])
    .post(users.createUser);

  //Login User
  app
    .route("/api/user/login", [
        body("pin").isNumeric(),
      body("email").isEmail().not().isEmpty(),
      body("password")
    ])
    .post(users.loginUser);
};
