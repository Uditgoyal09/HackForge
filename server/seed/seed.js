const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const JudgeAssignment = require('../models/JudgeAssignment');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackverse');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany(),
      Hackathon.deleteMany(),
      Registration.deleteMany(),
      Team.deleteMany(),
      Submission.deleteMany(),
      JudgeAssignment.deleteMany(),
      Review.deleteMany(),
      ActivityLog.deleteMany(),
      Notification.deleteMany(),
      Invitation.deleteMany(),
    ]);

    console.log('Creating users...');
    const pw = 'password123';

    const admin = await User.create({ name: 'Admin User', email: 'admin@hackverse.com', password: pw, role: 'admin' });
    const organizer = await User.create({ name: 'Organizer Sam', email: 'organizer@hackverse.com', password: pw, role: 'organizer' });
    const judge1 = await User.create({ name: 'Judge Jane', email: 'judge1@hackverse.com', password: pw, role: 'judge' });
    const judge2 = await User.create({ name: 'Judge John', email: 'judge2@hackverse.com', password: pw, role: 'judge' });
    const p1 = await User.create({ name: 'Alice (P1)', email: 'alice@hackverse.com', password: pw, role: 'participant' });
    const p2 = await User.create({ name: 'Bob (P2)', email: 'bob@hackverse.com', password: pw, role: 'participant' });
    const p3 = await User.create({ name: 'Charlie (P3)', email: 'charlie@hackverse.com', password: pw, role: 'participant' });
    const p4 = await User.create({ name: 'Diana (P4)', email: 'diana@hackverse.com', password: pw, role: 'participant' });

    console.log('Creating hackathons...');
    const now = new Date();
    
    // 1. Ongoing Hackathon
    const ongoingHackathon = await Hackathon.create({
      title: 'Global AI Hackathon 2026',
      tagline: 'Build the future of AI',
      description: 'An ongoing event where teams submit AI projects.',
      organizer: organizer._id,
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      submissionDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'ongoing',
      mode: 'online',
      judgingCriteria: [
        { name: 'Innovation', description: 'How innovative is the idea?', maxScore: 30 },
        { name: 'Technical Execution', description: 'Code quality and technical depth', maxScore: 40 },
        { name: 'Impact', description: 'Real world impact', maxScore: 30 },
      ],
      maxTeamSize: 4,
    });

    // 2. Completed Hackathon with Results
    const completedHackathon = await Hackathon.create({
      title: 'Web3 Builder Fiesta',
      tagline: 'Decentralize Everything',
      description: 'A completed hackathon to test leaderboard.',
      organizer: organizer._id,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      submissionDeadline: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      status: 'completed',
      mode: 'online',
      resultsPublished: true,
      judgingCriteria: [
        { name: 'Innovation', description: 'Novelty', maxScore: 50 },
        { name: 'Technical', description: 'Stack usage', maxScore: 50 },
      ],
      maxTeamSize: 4,
    });

    console.log('Seeding data for Completed Hackathon...');
    // Registrations
    const r1 = await Registration.create({ hackathon: completedHackathon._id, participant: p1._id, status: 'approved' });
    const r2 = await Registration.create({ hackathon: completedHackathon._id, participant: p2._id, status: 'approved' });
    const r3 = await Registration.create({ hackathon: completedHackathon._id, participant: p3._id, status: 'approved' });
    const r4 = await Registration.create({ hackathon: completedHackathon._id, participant: p4._id, status: 'approved' });

    // Teams
    const teamA = await Team.create({ name: 'Web3 Wizards', hackathon: completedHackathon._id, leader: p1._id, members: [p1._id, p2._id], inviteCode: 'ABCD' });
    const teamB = await Team.create({ name: 'Decentralized Devs', hackathon: completedHackathon._id, leader: p3._id, members: [p3._id, p4._id], inviteCode: 'EFGH' });

    r1.team = teamA._id; await r1.save();
    r2.team = teamA._id; await r2.save();
    r3.team = teamB._id; await r3.save();
    r4.team = teamB._id; await r4.save();

    // Submissions
    const subA = await Submission.create({
      hackathon: completedHackathon._id,
      team: teamA._id,
      projectName: 'DeFi Swap',
      problemStatement: 'High fees in finance',
      solution: 'Layer 2 swapping protocol',
      githubRepository: 'https://github.com/example/defi',
      status: 'approved',
    });

    const subB = await Submission.create({
      hackathon: completedHackathon._id,
      team: teamB._id,
      projectName: 'NFT Marketplace',
      problemStatement: 'NFT trading is hard',
      solution: 'Easy UX for NFTs',
      githubRepository: 'https://github.com/example/nft',
      status: 'approved',
    });

    // Judge Assignments
    const ja1 = await JudgeAssignment.create({ hackathon: completedHackathon._id, submission: subA._id, judge: judge1._id, assignedBy: admin._id, status: 'reviewed' });
    const ja2 = await JudgeAssignment.create({ hackathon: completedHackathon._id, submission: subA._id, judge: judge2._id, assignedBy: admin._id, status: 'reviewed' });
    const ja3 = await JudgeAssignment.create({ hackathon: completedHackathon._id, submission: subB._id, judge: judge1._id, assignedBy: admin._id, status: 'reviewed' });

    // Reviews (Team A gets 90 and 85, avg 87.5) (Team B gets 80, avg 80)
    await Review.create({
      submission: subA._id, judge: judge1._id, status: 'submitted',
      criteriaScores: [{ criterionName: 'Innovation', score: 45, maxScore: 50 }, { criterionName: 'Technical', score: 45, maxScore: 50 }],
      totalScore: 90
    });
    await Review.create({
      submission: subA._id, judge: judge2._id, status: 'submitted',
      criteriaScores: [{ criterionName: 'Innovation', score: 40, maxScore: 50 }, { criterionName: 'Technical', score: 45, maxScore: 50 }],
      totalScore: 85
    });
    await Review.create({
      submission: subB._id, judge: judge1._id, status: 'submitted',
      criteriaScores: [{ criterionName: 'Innovation', score: 40, maxScore: 50 }, { criterionName: 'Technical', score: 40, maxScore: 50 }],
      totalScore: 80
    });

    console.log('Seeding Data for Ongoing Hackathon...');
    // Only p1 registers and makes a team
    const ro1 = await Registration.create({ hackathon: ongoingHackathon._id, participant: p1._id, status: 'approved' });
    const ongoingTeam = await Team.create({ name: 'AI Innovators', hackathon: ongoingHackathon._id, leader: p1._id, members: [p1._id], inviteCode: 'AI123' });
    ro1.team = ongoingTeam._id; await ro1.save();

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
