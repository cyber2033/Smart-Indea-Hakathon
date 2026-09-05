const jwt = require("jsonwebtoken");
const { inMemoryDB } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "sih2026_krishi_key";

exports.loginDemoUser = (req, res) => {
  const defaultFarmer = inMemoryDB.users[0];
  const token = jwt.sign(
    { id: defaultFarmer.id, phone: defaultFarmer.phone, name: defaultFarmer.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    success: true,
    message: "Demo farmer authenticated successfully",
    token,
    user: defaultFarmer
  });
};

exports.getUserProfile = (req, res) => {
  return res.status(200).json({
    success: true,
    user: inMemoryDB.users[0]
  });
};
