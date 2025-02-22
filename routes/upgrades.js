const express = require('express');
const router = express.Router();

// Upgrades route
router.get('/', (req, res) => {
    res.render('pages/upgrades');
});

module.exports = router;
