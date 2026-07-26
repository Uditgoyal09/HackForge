import Hackathon from '../models/Hackathon.js';
import path from 'path';
import fs from 'fs';

// @desc    Create a hackathon
// @route   POST /api/hackathons
// @access  Private (Organizer/Admin)
export const createHackathon = async (req, res) => {
  try {
    const { 
      title, description, theme, mode, venue, 
      startDate, endDate, registrationDeadline, 
      prizePool, maxTeamSize, rules, judgingCriteria 
    } = req.body;

    // Check if an image was uploaded
    let bannerImage = '';
    if (req.file) {
      // Create a URL path to the file
      bannerImage = `/uploads/${req.file.filename}`;
    }

    const hackathon = new Hackathon({
      title,
      description,
      theme,
      mode,
      venue,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      maxTeamSize,
      rules,
      judgingCriteria,
      bannerImage,
      organizer: req.user.userId // from auth middleware
    });

    const savedHackathon = await hackathon.save();
    res.status(201).json(savedHackathon);
  } catch (error) {
    console.error('Error creating hackathon:', error);
    res.status(500).json({ message: 'Server error while creating hackathon', error: error.message });
  }
};

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
export const getAllHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(hackathons);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching hackathons' });
  }
};

// @desc    Get hackathon by ID
// @route   GET /api/hackathons/:id
// @access  Public
export const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('organizer', 'name email profile');
      
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching hackathon' });
  }
};

// @desc    Update a hackathon
// @route   PUT /api/hackathons/:id
// @access  Private
export const updateHackathon = async (req, res) => {
  try {
    let hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Verify ownership or admin
    if (hackathon.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this hackathon' });
    }

    const updateData = { ...req.body };

    // Handle new image upload
    if (req.file) {
      updateData.bannerImage = `/uploads/${req.file.filename}`;
      
      // Optionally delete old image from disk
      if (hackathon.bannerImage) {
        const oldImagePath = path.join(process.cwd(), hackathon.bannerImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating hackathon' });
  }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private
export const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Verify ownership or admin
    if (hackathon.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this hackathon' });
    }

    // Delete associated image
    if (hackathon.bannerImage) {
      const oldImagePath = path.join(process.cwd(), hackathon.bannerImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await hackathon.deleteOne();
    res.status(200).json({ message: 'Hackathon removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting hackathon' });
  }
};
