const express = require('express')
const router = express.Router()

// Routes
// Home page
router.get(['', '/home'], (req, res) => {
    const internals = {
        title: "Home page",
        description: "Welcome official website for PSF Rwanda"
    }
    res.render('clients/home', { internals });
});

// Services
router.get('/services', (req, res) => {
    const internals = {
        title: "Services",
        description: "PSF Offers various services including Advocacy, Membership, Market linkage, IBI..."
    }
    res.render('clients/services', { internals });
});


// Export this router
module.exports = router;
