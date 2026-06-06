const BusinessSectorService = require('../services/businessSectorService');
const { asyncHandler } = require('../utils/asyncHandler');

// Get all business sectors
exports.getAllSectors = asyncHandler(async (req, res) => {
    const sectors = await BusinessSectorService.getAllSectors();

    const internals = {
        title: "Business Sector",
        breadcrumbL1: "BS",
        breadcrumbL2: "Home",
        inUser: req.session.in_user
    };

    res.render("membership/read-business-sectors", {
        layout: "./layouts/LAdmin",
        internals,
        sectors
    });

});

// Display business sector create form
exports.createSectorForm = (req, res) => {
    const internals = {
        title: "Business Sector",
        breadcrumbL1: "BS",
        breadcrumbL2: "Home",
        inUser: req.session.in_user
    };
    res.render("membership/create-business-sector", {
        layout: "./layouts/LAdmin",
        internals,
        sector: {}
    });
};

// Create new business sector
exports.createSector = asyncHandler(async (req, res) => {
    const { sector_name, sector_description } = req.body;

    // Simple validation
    if (!sector_name || sector_name.trim() === '') {
        
        const internals = {
            title: "Business Sector",
            breadcrumbL1: "BS",
            breadcrumbL2: "Home",
            inUser: req.session.in_user
        };

        return res.render('membership/create-business-sector', {
            layout: "./layouts/LAdmin",
            internals,
            title: 'Create Business Sector',
            error: 'Sector name is required',
            sector: { sector_name, sector_description }
        });
    }

    const sector = await BusinessSectorService.createSector({
        sector_name: sector_name.trim(),
        sector_description: sector_description || null
    });

    req.flash = 'Business sector created successfully';
    res.redirect('/business-sectors/all');
});

// Delete business sector
exports.deleteSector = asyncHandler(async (req, res) => {
  await BusinessSectorService.deleteSector(req.params.id);
  
  req.flash = 'Business sector deleted successfully';
  res.redirect('/business-sectors/all');
});