import offerModel from "../models/offerModel.js";
import fs from "fs";

// Utility function to update isActive for all offers
const updateActiveStatus = async () => {
  const currentDate = new Date();
  const offers = await offerModel.find({});

  for (let offer of offers) {
    const shouldBeActive = offer.endDateTime && new Date(offer.endDateTime) >= currentDate;
    if (offer.isActive !== shouldBeActive) { // Only update if status has changed
      offer.isActive = shouldBeActive;
      await offer.save();
    }
  }
};

// Add Offer
const addOffer = async (req, res) => {
  try {
    const { name, code, startDateTime, endDateTime, discountType, discountValue } = req.body;

    // Validate required fields
    if (!name || !code || !startDateTime || !endDateTime || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate date times
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({ success: false, message: "Start date must be before end date" });
    }

    // Validate discount type and value
    if (!['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Discount type must be 'percentage' or 'flat'" });
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ success: false, message: "Percentage discount must be between 0 and 100" });
    }

    const offer = new offerModel({
      name,
      code,
      startDateTime,
      endDateTime,
      discountType,
      discountValue,
      isActive: true // Initially set as active since it's a new offer
    });

    await offer.save();
    res.json({ success: true, message: "Offer Added Successfully.", offer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// List Offers
const listOffers = async (req, res) => {
  try {
    await updateActiveStatus(); // Ensure all offers have correct isActive status before listing

    const updatedOffers = await offerModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: updatedOffers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// Update Offer
const updateOffer = async (req, res) => {
  try {
    const { id, name, code, startDateTime, endDateTime, discountType, discountValue } = req.body;

    const offer = await offerModel.findById(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    // Update only provided fields
    if (name) offer.name = name;
    if (code) offer.code = code;
    if (startDateTime) offer.startDateTime = startDateTime;
    if (endDateTime) offer.endDateTime = endDateTime;
    if (discountType) offer.discountType = discountType;
    if (discountValue) offer.discountValue = discountValue;

    // Validate updated dates
    if (startDateTime && endDateTime && new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({ success: false, message: "Start date must be before end date" });
    }

    // Validate discount
    if (discountType && !['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Discount type must be 'percentage' or 'flat'" });
    }

    if (discountType === 'percentage' && discountValue && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ success: false, message: "Percentage discount must be between 0 and 100" });
    }

    // Update isActive based on new endDateTime
    const currentDate = new Date();
    offer.isActive = new Date(offer.endDateTime) >= currentDate;

    await offer.save();
    res.json({ success: true, message: "Offer Updated Successfully.", offer });

    // Optionally call updateActiveStatus to ensure all offers are checked
    await updateActiveStatus();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

// Delete Offer
const removeOffer = async (req, res) => {
  try {
    const offer = await offerModel.findById(req.body.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    await offerModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Offer Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};

export { addOffer, listOffers, updateOffer, removeOffer };