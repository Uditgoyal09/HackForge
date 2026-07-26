import Registration from '../models/Registration.js';
import Hackathon from '../models/Hackathon.js';

// @desc    Register for a hackathon
// @route   POST /api/registrations/:hackathonId
// @access  Private (Participant)
export const registerForHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const participantId = req.user.userId;

    // 1. Verify Hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // 2. Check if already registered
    const existingRegistration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this hackathon.' });
    }

    // 3. Create Registration
    const newRegistration = new Registration({
      hackathon: hackathonId,
      participant: participantId,
      status: 'approved' // Auto-approve for now
    });

    await newRegistration.save();

    res.status(201).json({
      message: 'Successfully registered for the hackathon!',
      registration: newRegistration
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Check registration status
// @route   GET /api/registrations/check/:hackathonId
// @access  Private (Participant)
export const checkRegistrationStatus = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const participantId = req.user.userId;

    const existingRegistration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId
    });

    if (existingRegistration) {
      return res.status(200).json({ isRegistered: true, status: existingRegistration.status });
    } else {
      return res.status(200).json({ isRegistered: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error checking registration status.' });
  }
};
