const Service = require("../models/Service");

exports.getServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

exports.createService = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const service = await Service.create({ name, description, price });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: "Error creating service" });
    }
};
