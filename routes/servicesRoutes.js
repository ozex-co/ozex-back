const express = require("express");
const { getServices, createService } = require("../controllers/servicesController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getServices);
router.post("/", authMiddleware, createService);

module.exports = router;
