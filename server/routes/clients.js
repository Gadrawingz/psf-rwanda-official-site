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


// Routes for for about us
router.get('/background', (req, res) => {
    const internals = {
        title: "Our Background",
        description: ""
    }
    res.render('clients/about/background', { internals });
});

router.get('/psf-25', (req, res) => {
    const internals = {
        title: "PSF 25",
        description: ""
    }
    res.render('clients/about/psf-25', { internals });
});

router.get('/strategies', (req, res) => {
    const internals = {
        title: "Strategies",
        description: ""
    }
    res.render('clients/about/strategies', { internals });
});


// Routes for Membership
router.get('/association', (req, res) => {
    const internals = {
        title: "Clusters - Association",
        description: ""
    }
    res.render('clients/membership/assoc', { internals });
});

router.get('/golden-circle', (req, res) => {
    const internals = {
        title: "Golden Circle",
        description: ""
    }
    res.render('clients/membership/golden-circle', { internals });
});

router.get('/regular', (req, res) => {
    const internals = {
        title: "Regular",
        description: ""
    }
    res.render('clients/membership/regular', { internals });
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
