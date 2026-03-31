const {
  createLicense,
  getLatestSellerLicense,
  listPendingLicenses,
  reviewLicense,
  getLicenseById,
} = require("./licenseModel");

async function uploadLicense(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "license file is required" });
    }

    const saved = await createLicense({
      sellerId: req.user.id,
      filePath: `/uploads/licenses/${req.file.filename}`,
    });

    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function myLicense(req, res) {
  try {
    const license = await getLatestSellerLicense(req.user.id);

    if (!license) {
      return res.status(404).json({ message: "No license uploaded yet" });
    }

    return res.json(license);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getPendingLicenses(req, res) {
  try {
    const pending = await listPendingLicenses();
    return res.json(pending);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function reviewSellerLicense(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be approved or rejected" });
    }

    const existing = await getLicenseById(id);
    if (!existing) {
      return res.status(404).json({ message: "License not found" });
    }

    const reviewed = await reviewLicense({
      licenseId: id,
      status,
    });

    return res.json(reviewed);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  uploadLicense,
  myLicense,
  getPendingLicenses,
  reviewSellerLicense,
};
