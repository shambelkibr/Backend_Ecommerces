const {
  createShop,
  getShopBySellerId,
  listPendingShops,
  reviewShop,
  getShopById,
} = require("./shopModel");

async function registerShop(req, res) {
  try {
    const { name, description, address } = req.body;
    if (!name || !address) {
      return res.status(400).json({ message: "Name and address are required to open a shop." });
    }

    const existing = await getShopBySellerId(req.user.id);
    if (existing) {
       return res.status(400).json({ message: "You already have a shop registered." });
    }

    const saved = await createShop({
      sellerId: req.user.id,
      name,
      description,
      address
    });

    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function myShop(req, res) {
  try {
    const shop = await getShopBySellerId(req.user.id);

    if (!shop) {
      return res.status(404).json({ message: "No shop registered yet" });
    }

    return res.json(shop);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getPendingShops(req, res) {
  try {
    const pending = await listPendingShops();
    return res.json(pending);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function reviewSellerShop(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be approved or rejected" });
    }

    const existing = await getShopById(id);
    if (!existing) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const reviewed = await reviewShop({
      shopId: id,
      status,
    });

    return res.json(reviewed);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  registerShop,
  myShop,
  getPendingShops,
  reviewSellerShop,
};
