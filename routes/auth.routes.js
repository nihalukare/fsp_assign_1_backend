const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");

const {
  createUser,
  userLogin,
  getUser,
} = require("../controllers/auth.controllers");

const router = express.Router();

// SignUp Auth
router.post("/signup", createUser);

// Login Auth
router.post("/login", userLogin);

router.get("/me", verifyJWT, getUser);

module.exports = router;
