require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../config/db');
const { app } = require('../app');

let BASE_URL = 'http://127.0.0.1:5005/api';
let serverInstance;

const results = [];

function logTest(category, name, passed, details = '') {
  results.push({ category, name, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusStr} [${category}] ${name}${details ? ` - ${details}` : ''}`);
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, data, headers: res.headers };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function runE2ETests() {
  console.log('Connecting to MongoDB and launching test server on port 5005...');
  await connectDB();

  serverInstance = app.listen(5005, () => {
    console.log('Test Server listening at http://127.0.0.1:5005');
  });

  // Give server a moment to start
  await new Promise(res => setTimeout(res, 500));

  console.log(`\nStarting E2E API Verification Suite against ${BASE_URL}\n`);

  // Tokens & state
  let adminToken, orgToken, org2Token, partToken, part2Token, judgeToken, judge2Token;
  let adminId, orgId, org2Id, partId, part2Id, judgeId, judge2Id;
  let hackathonId, registrationId, teamId, invitationId, submissionId, reviewId;

  try {
    // 1. Startup & Health
    {
      const res = await request('/health');
      logTest('Startup', 'GET /api/health returns 200 OK', res.status === 200 && res.data?.status === 'ok');
    }

    // 2. Unknown Route (404)
    {
      const res = await request('/this-route-does-not-exist-xyz');
      logTest('Routing', 'Unknown route returns JSON 404', res.status === 404 && res.data?.success === false);
    }

    // 3. Login to Seeded Accounts
    {
      const loginAdmin = await request('/auth/login', { method: 'POST', body: { email: 'admin@hackverse.com', password: 'password123' } });
      if (loginAdmin.status === 200 && loginAdmin.data?.data?.token) {
        adminToken = loginAdmin.data.data.token;
        adminId = loginAdmin.data.data._id;
        logTest('Auth', 'Admin Login Successful', true);
      } else {
        logTest('Auth', 'Admin Login Successful', false, JSON.stringify(loginAdmin.data));
      }

      const loginOrg = await request('/auth/login', { method: 'POST', body: { email: 'organizer@hackverse.com', password: 'password123' } });
      if (loginOrg.status === 200) {
        orgToken = loginOrg.data.data.token;
        orgId = loginOrg.data.data._id;
        logTest('Auth', 'Organizer 1 Login Successful', true);
      } else {
        logTest('Auth', 'Organizer 1 Login Successful', false);
      }

      const loginJudge = await request('/auth/login', { method: 'POST', body: { email: 'judge1@hackverse.com', password: 'password123' } });
      if (loginJudge.status === 200) {
        judgeToken = loginJudge.data.data.token;
        judgeId = loginJudge.data.data._id;
        logTest('Auth', 'Judge 1 Login Successful', true);
      } else {
        logTest('Auth', 'Judge 1 Login Successful', false);
      }

      const loginJudge2 = await request('/auth/login', { method: 'POST', body: { email: 'judge2@hackverse.com', password: 'password123' } });
      if (loginJudge2.status === 200) {
        judge2Token = loginJudge2.data.data.token;
        judge2Id = loginJudge2.data.data._id;
        logTest('Auth', 'Judge 2 Login Successful', true);
      }
    }

    // 4. Signup & Security
    {
      const ts = Date.now();
      const signupData = { name: 'E2E Participant 1', email: `e2e_part_${ts}@hackverse.dev`, password: 'Test@123456' };
      const res = await request('/auth/signup', { method: 'POST', body: signupData });
      logTest('Auth', 'Participant Signup', res.status === 201 && res.data?.data?.token);
      if (res.status === 201) {
        partToken = res.data.data.token;
        partId = res.data.data._id;
      }

      // Role Escalation Attack Test
      const attackSignup = { name: 'Fake Admin', email: `fakeadmin_${ts}@hackverse.dev`, password: 'Test@123456', role: 'admin' };
      const resAttack = await request('/auth/signup', { method: 'POST', body: attackSignup });
      logTest('Security', 'Role Escalation Signup Attack Prevented (Role stays participant)', resAttack.status === 201 && resAttack.data?.data?.role === 'participant');

      // Duplicate Email Signup
      const resDup = await request('/auth/signup', { method: 'POST', body: signupData });
      logTest('Auth', 'Duplicate Email Signup Rejected with 409', resDup.status === 409);

      // Signup Participant 2 & Organizer 2 for negative tests
      const p2Signup = await request('/auth/signup', { method: 'POST', body: { name: 'E2E Participant 2', email: `e2e_part2_${ts}@hackverse.dev`, password: 'Test@123456' } });
      if (p2Signup.status === 201) {
        part2Token = p2Signup.data.data.token;
        part2Id = p2Signup.data.data._id;
      }

      // Login invalid password test
      const resInvalidPass = await request('/auth/login', { method: 'POST', body: { email: signupData.email, password: 'WrongPassword' } });
      logTest('Auth', 'Invalid Login Rejected with 401', resInvalidPass.status === 401);
    }

    // 5. Auth Me & Change Password
    {
      const resMe = await request('/auth/me', { token: partToken });
      logTest('Auth', 'GET /api/auth/me Returns Current User (No Password)', resMe.status === 200 && resMe.data?.data?.email && !resMe.data?.data?.password);

      const resNoToken = await request('/auth/me');
      logTest('Security', 'GET /api/auth/me Without Token Returns 401', resNoToken.status === 401);

      const resInvalidToken = await request('/auth/me', { token: 'invalid.jwt.token' });
      logTest('Security', 'GET /api/auth/me With Invalid Token Returns 401', resInvalidToken.status === 401);

      const resChangePw = await request('/auth/change-password', { method: 'PUT', token: partToken, body: { currentPassword: 'Test@123456', newPassword: 'NewPassword@123' } });
      logTest('Auth', 'PUT /api/auth/change-password Success', resChangePw.status === 200);

      // Re-login with new password
      if (resChangePw.status === 200) {
        const meRes = await request('/auth/me', { token: resChangePw.data?.data?.token || partToken });
        const userEmail = meRes.data?.data?.email;
        if (userEmail) {
          const resRelogin = await request('/auth/login', { method: 'POST', body: { email: userEmail, password: 'NewPassword@123' } });
          if (resRelogin.status === 200) {
            partToken = resRelogin.data.data.token;
          }
        }
      }

      // Sign up Organizer 2
      const org2Signup = await request('/auth/signup', { method: 'POST', body: { name: 'Organizer 2', email: `org2_${Date.now()}@hackverse.dev`, password: 'Test@123456' } });
      if (org2Signup.status === 201) {
        org2Id = org2Signup.data.data._id;
        // Promote to organizer via Admin API
        await request(`/admin/users/${org2Id}/role`, { method: 'PATCH', token: adminToken, body: { role: 'organizer' } });
        // Refresh Org 2 token
        const org2Relogin = await request('/auth/login', { method: 'POST', body: { email: org2Signup.data.data.email, password: 'Test@123456' } });
        if (org2Relogin.status === 200) {
          org2Token = org2Relogin.data.data.token;
        }
      }
    }

    // 6. User Profile APIs & Profile Mass Assignment Attack
    {
      const updateBody = { name: 'Updated Participant Name', bio: 'Full-stack wizard', skills: ['Node.js', 'MongoDB'], college: 'Tech University' };
      const resUpdate = await request('/users/me', { method: 'PUT', token: partToken, body: updateBody });
      logTest('UserProfile', 'PUT /api/users/me Profile Update', resUpdate.status === 200 && resUpdate.data?.data?.bio === 'Full-stack wizard');

      // Mass assignment attack: attempt to elevate role or unblock via profile update
      const resMassAttack = await request('/users/me', { method: 'PUT', token: partToken, body: { role: 'admin', isBlocked: true } });
      logTest('Security', 'Profile Mass Assignment Attack Blocked (Role remains participant)', resMassAttack.status === 200 && resMassAttack.data?.data?.role === 'participant');

      // Public Profile
      const resPub = await request(`/users/${partId}/profile`);
      logTest('UserProfile', 'GET /api/users/:id/profile Public Profile', resPub.status === 200 && resPub.data?.data?.name);
    }

    // 7. Hackathons CRUD & Security Attacks
    {
      const now = new Date();
      const hackathonData = {
        title: `E2E Automated Hackathon ${Date.now()}`,
        description: 'Comprehensive integration test hackathon',
        mode: 'online',
        registrationDeadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        prizePool: 10000,
        maxTeamSize: 4,
        judgingCriteria: [
          { name: 'Innovation', description: 'Originality', maxScore: 50 },
          { name: 'Technical Execution', description: 'Code quality', maxScore: 50 }
        ]
      };

      // Participant Hackathon Creation Attack
      const resPartCreate = await request('/hackathons', { method: 'POST', token: partToken, body: hackathonData });
      logTest('Security', 'Participant Create Hackathon Attack Rejected with 403', resPartCreate.status === 403);

      // Organizer Create Hackathon
      const resCreate = await request('/hackathons', { method: 'POST', token: orgToken, body: hackathonData });
      logTest('Hackathons', 'Organizer Create Hackathon', resCreate.status === 201 && resCreate.data?.data?._id);
      if (resCreate.status === 201) {
        hackathonId = resCreate.data.data._id;
      }

      // Get All & Search / Filter / Sort / Pagination
      const resList = await request('/hackathons?page=1&limit=5');
      logTest('Hackathons', 'GET /api/hackathons Listing with Pagination', resList.status === 200 && Array.isArray(resList.data?.data));

      const resSearch = await request('/hackathons?search=Automated');
      logTest('Hackathons', 'GET /api/hackathons Search Query', resSearch.status === 200);

      const resGetById = await request(`/hackathons/${hackathonId}`);
      logTest('Hackathons', 'GET /api/hackathons/:id', resGetById.status === 200 && resGetById.data?.data?.title === hackathonData.title);

      // Invalid ObjectId test
      const resInvalidId = await request('/hackathons/invalid-object-id-123');
      logTest('Validation', 'Invalid ObjectId Handled with 400', resInvalidId.status === 400);

      // Organizer 2 Ownership Attack on Update
      if (org2Token) {
        const resOrg2Update = await request(`/hackathons/${hackathonId}`, { method: 'PUT', token: org2Token, body: { title: 'Hacked Title' } });
        logTest('Security', 'Organizer B Update Organizer A Hackathon Attack Rejected with 403', resOrg2Update.status === 403);
      }

      // Update Hackathon by Owner
      const resUpdate = await request(`/hackathons/${hackathonId}`, { method: 'PUT', token: orgToken, body: { title: hackathonData.title + ' (Updated)' } });
      logTest('Hackathons', 'Organizer Owner Update Hackathon', resUpdate.status === 200);

      // Open / Close Registrations
      const resCloseReg = await request(`/hackathons/${hackathonId}/registration/close`, { method: 'PATCH', token: orgToken });
      logTest('Hackathons', 'Close Registration Endpoint', resCloseReg.status === 200);

      const resOpenReg = await request(`/hackathons/${hackathonId}/registration/open`, { method: 'PATCH', token: orgToken });
      logTest('Hackathons', 'Open Registration Endpoint', resOpenReg.status === 200);
    }

    // 8. Registrations
    {
      // Participant 1 Register
      const resReg1 = await request(`/hackathons/${hackathonId}/register`, { method: 'POST', token: partToken });
      logTest('Registrations', 'Participant Register for Hackathon', resReg1.status === 201 || resReg1.status === 200);
      if (resReg1.data?.data?._id) registrationId = resReg1.data.data._id;

      // Duplicate Registration Test
      const resDupReg = await request(`/hackathons/${hackathonId}/register`, { method: 'POST', token: partToken });
      logTest('Registrations', 'Duplicate Registration Rejected with 409', resDupReg.status === 409);

      // Participant 2 Register
      await request(`/hackathons/${hackathonId}/register`, { method: 'POST', token: part2Token });

      // My Registrations
      const resMyReg = await request('/registrations/me', { token: partToken });
      logTest('Registrations', 'GET /api/registrations/me', resMyReg.status === 200 && Array.isArray(resMyReg.data?.data));

      // Organizer Get Registrations List & Unauthorized Access Test
      if (org2Token) {
        const resOrg2GetRegs = await request(`/hackathons/${hackathonId}/registrations`, { token: org2Token });
        logTest('Security', 'Unauthorized Organizer View Registrations Attack Rejected with 403', resOrg2GetRegs.status === 403);
      }

      const resOrgGetRegs = await request(`/hackathons/${hackathonId}/registrations`, { token: orgToken });
      logTest('Registrations', 'Organizer View Registrations List', resOrgGetRegs.status === 200 && Array.isArray(resOrgGetRegs.data?.data));
      if (!registrationId && resOrgGetRegs.data?.data?.length > 0) {
        registrationId = resOrgGetRegs.data.data[0]._id;
      }

      // Approve Registration
      const resApprove = await request(`/registrations/${registrationId}/approve`, { method: 'PATCH', token: orgToken });
      logTest('Registrations', 'Organizer Approve Registration', resApprove.status === 200);
    }

    // 9. Teams & Invitations
    {
      // Create Team
      const resCreateTeam = await request(`/hackathons/${hackathonId}/teams`, { method: 'POST', token: partToken, body: { name: 'E2E Alpha Team' } });
      logTest('Teams', 'Create Team', resCreateTeam.status === 201 && resCreateTeam.data?.data?._id);
      if (resCreateTeam.status === 201) teamId = resCreateTeam.data.data._id;

      // Duplicate Team Membership Attack
      const resDupTeam = await request(`/hackathons/${hackathonId}/teams`, { method: 'POST', token: partToken, body: { name: 'Second Team' } });
      logTest('Security', 'Duplicate Team Membership Attack Rejected with 409', resDupTeam.status === 409);

      // Get Team Details
      const resGetTeam = await request(`/teams/${teamId}`, { token: partToken });
      logTest('Teams', 'GET /api/teams/:id Details', resGetTeam.status === 200 && resGetTeam.data?.data?.name === 'E2E Alpha Team');

      // Invite Participant 2
      const part2Me = await request('/auth/me', { token: part2Token });
      const p2Email = part2Me.data?.data?.email;

      const resInviteP2 = await request(`/teams/${teamId}/invitations`, { method: 'POST', token: partToken, body: { invitedEmail: p2Email } });
      logTest('Invitations', 'Team Leader Send Invitation', resInviteP2.status === 201);
      if (resInviteP2.status === 201) invitationId = resInviteP2.data.data._id;

      // Participant 2 Get Invitations
      const resMyInvites = await request('/invitations/me', { token: part2Token });
      logTest('Invitations', 'GET /api/invitations/me', resMyInvites.status === 200 && Array.isArray(resMyInvites.data?.data));

      // Wrong User Accept Invitation Attack
      if (invitationId) {
        const resWrongAccept = await request(`/invitations/${invitationId}/accept`, { method: 'PATCH', token: orgToken });
        logTest('Security', 'Wrong User Accept Invitation Attack Rejected with 403', resWrongAccept.status === 403);
      }

      // Accept Invitation as Participant 2 (Multi-doc Transaction)
      const regsList = await request(`/hackathons/${hackathonId}/registrations`, { token: orgToken });
      const p2Reg = regsList.data?.data?.find(r => {
        const id = r.participant?._id ? r.participant._id.toString() : r.participant?.toString();
        return id === part2Id?.toString();
      });
      if (p2Reg) {
        await request(`/registrations/${p2Reg._id}/approve`, { method: 'PATCH', token: orgToken });
      }

      if (invitationId) {
        const resAccept = await request(`/invitations/${invitationId}/accept`, { method: 'PATCH', token: part2Token });
        logTest('Invitations', 'Participant Accept Invitation (MongoDB Transaction)', resAccept.status === 200);
      }

      // Non-Leader Remove Member Attack
      const resNonLeaderRemove = await request(`/teams/${teamId}/members/${partId}`, { method: 'DELETE', token: part2Token });
      logTest('Security', 'Non-Leader Remove Member Attack Rejected with 403', resNonLeaderRemove.status === 403);
    }

    // 10. Submissions
    {
      const subPayload = {
        projectName: 'E2E AI Defender',
        problemStatement: 'Security vulnerabilities in web applications',
        solution: 'Automated AI vulnerability scanner and patch generator',
        description: 'Scans source code for security flaws.',
        githubRepository: 'https://github.com/example/e2e-defender',
        liveDemo: 'https://defender.example.com',
        techStack: ['Node.js', 'Express', 'MongoDB', 'Python']
      };

      // Create Submission as Leader
      const resSub = await request(`/hackathons/${hackathonId}/submissions`, { method: 'POST', token: partToken, body: subPayload });
      logTest('Submissions', 'Create Submission', resSub.status === 201 && resSub.data?.data?._id);
      if (resSub.status === 201) submissionId = resSub.data.data._id;

      // Duplicate Submission Attack
      const resDupSub = await request(`/hackathons/${hackathonId}/submissions`, { method: 'POST', token: partToken, body: subPayload });
      logTest('Security', 'Duplicate Team Submission Attack Rejected with 409', resDupSub.status === 409);

      // Get Submission Details
      const resGetSub = await request(`/submissions/${submissionId}`, { token: partToken });
      logTest('Submissions', 'GET /api/submissions/:id', resGetSub.status === 200 && resGetSub.data?.data?.projectName === subPayload.projectName);

      // Wrong Team Update Attack
      if (org2Token) {
        const resWrongUpdate = await request(`/submissions/${submissionId}`, { method: 'PUT', token: org2Token, body: { projectName: 'Hacked Project' } });
        logTest('Security', 'Unauthorized User Update Submission Attack Rejected with 403', resWrongUpdate.status === 403);
      }

      // Authorized Submission Update
      const resUpdateSub = await request(`/submissions/${submissionId}`, { method: 'PUT', token: partToken, body: { description: 'Updated project description for E2E.' } });
      logTest('Submissions', 'Authorized Leader Update Submission', resUpdateSub.status === 200);
    }

    // 11. Judging & Reviews
    {
      // Wrong Organizer Assign Judge Attack
      if (org2Token) {
        const resWrongAssign = await request(`/submissions/${submissionId}/judges/${judgeId}`, { method: 'POST', token: org2Token });
        logTest('Security', 'Unauthorized Organizer Assign Judge Attack Rejected with 403', resWrongAssign.status === 403);
      }

      // Assign Judge 1 & Judge 2
      const resAssign1 = await request(`/submissions/${submissionId}/judges/${judgeId}`, { method: 'POST', token: orgToken });
      logTest('Judging', 'Organizer Assign Judge 1', resAssign1.status === 201 || resAssign1.status === 200);

      const resAssign2 = await request(`/submissions/${submissionId}/judges/${judge2Id}`, { method: 'POST', token: orgToken });
      logTest('Judging', 'Organizer Assign Judge 2', resAssign2.status === 201 || resAssign2.status === 200);

      // Duplicate Assignment Attack
      const resDupAssign = await request(`/submissions/${submissionId}/judges/${judgeId}`, { method: 'POST', token: orgToken });
      logTest('Judging', 'Duplicate Judge Assignment Rejected with 409', resDupAssign.status === 409);

      // GET Judge Assignments
      const resJudgeAssigns = await request('/judge/assignments', { token: judgeToken });
      logTest('Judging', 'GET /api/judge/assignments', resJudgeAssigns.status === 200 && Array.isArray(resJudgeAssigns.data?.data));

      // Submit Review with Server-Calculated totalScore & Fake totalScore Override Test
      const reviewPayload = {
        criteriaScores: [
          { criterionName: 'Innovation', score: 45 },
          { criterionName: 'Technical Execution', score: 45 }
        ],
        feedback: 'Outstanding technical implementation and clear innovation.',
        status: 'submitted',
        totalScore: 999999 // Attack payload: attempting to inject fake total score
      };

      const resReview = await request(`/submissions/${submissionId}/reviews`, { method: 'POST', token: judgeToken, body: reviewPayload });
      logTest('Reviews', 'Judge Submit Review (Server Calculates totalScore = 90 & Ignores Fake 999999)', resReview.status === 201 && resReview.data?.data?.totalScore === 90);
      if (resReview.status === 201) reviewId = resReview.data.data._id;

      // Score Above Max Attack Test (MaxScore = 50)
      const resAboveMax = await request(`/submissions/${submissionId}/reviews`, { method: 'POST', token: judge2Token, body: {
        criteriaScores: [{ criterionName: 'Innovation', score: 100 }, { criterionName: 'Technical Execution', score: 40 }],
        status: 'submitted'
      }});
      logTest('Validation', 'Score Exceeding Max Score Rejected with 400', resAboveMax.status === 400);

      // Unknown Criterion Attack Test
      const resUnknownCrit = await request(`/submissions/${submissionId}/reviews`, { method: 'POST', token: judge2Token, body: {
        criteriaScores: [{ criterionName: 'Fake Criterion', score: 10 }, { criterionName: 'Technical Execution', score: 40 }],
        status: 'submitted'
      }});
      logTest('Validation', 'Unknown Criterion Score Rejected with 400', resUnknownCrit.status === 400);

      // Duplicate Review Attack Test
      const resDupReview = await request(`/submissions/${submissionId}/reviews`, { method: 'POST', token: judgeToken, body: reviewPayload });
      logTest('Reviews', 'Duplicate Review Submission Rejected with 409', resDupReview.status === 409);

      // Judge 2 Submit Valid Review (Scores: 40, 40 -> total = 80)
      const review2Payload = {
        criteriaScores: [
          { criterionName: 'Innovation', score: 40 },
          { criterionName: 'Technical Execution', score: 40 }
        ],
        feedback: 'Good work.',
        status: 'submitted'
      };
      await request(`/submissions/${submissionId}/reviews`, { method: 'POST', token: judge2Token, body: review2Payload });

      // GET Submission Reviews
      const resGetReviews = await request(`/submissions/${submissionId}/reviews`, { token: orgToken });
      logTest('Reviews', 'Organizer View Submission Reviews', resGetReviews.status === 200 && Array.isArray(resGetReviews.data?.data));
    }

    // 12. Leaderboard & Results Publication
    {
      // Unpublished Leaderboard Privacy Check (Participant access before publication)
      const resPrivLeaderboard = await request(`/hackathons/${hackathonId}/leaderboard`, { token: partToken });
      logTest('Security', 'Unpublished Leaderboard Access by Participant Rejected with 403', resPrivLeaderboard.status === 403);

      // Participant Publish Results Attack
      const resPartPub = await request(`/hackathons/${hackathonId}/publish-results`, { method: 'PATCH', token: partToken });
      logTest('Security', 'Participant Publish Results Attack Rejected with 403', resPartPub.status === 403);

      // Wrong Organizer Publish Results Attack
      if (org2Token) {
        const resOrg2Pub = await request(`/hackathons/${hackathonId}/publish-results`, { method: 'PATCH', token: org2Token });
        logTest('Security', 'Unauthorized Organizer Publish Results Attack Rejected with 403', resOrg2Pub.status === 403);
      }

      // Organizer Publish Results (MongoDB Transaction)
      const resPubRes = await request(`/hackathons/${hackathonId}/publish-results`, { method: 'PATCH', token: orgToken });
      logTest('Leaderboard', 'Organizer Publish Results (MongoDB Transaction)', resPubRes.status === 200);

      // Public Leaderboard Access Post-Publication
      const resPubLeaderboard = await request(`/hackathons/${hackathonId}/leaderboard`);
      logTest('Leaderboard', 'Public GET Leaderboard Post-Publication', resPubLeaderboard.status === 200 && Array.isArray(resPubLeaderboard.data?.data) && resPubLeaderboard.data.data.length > 0);

      // Post-Publication Review Lock Test
      if (reviewId) {
        const resPostPubEdit = await request(`/reviews/${reviewId}`, { method: 'PUT', token: judgeToken, body: {
          criteriaScores: [{ criterionName: 'Innovation', score: 10 }, { criterionName: 'Technical Execution', score: 10 }],
          status: 'submitted'
        }});
        logTest('Security', 'Post-Publication Review Edit Lock Enforced with 403', resPostPubEdit.status === 403);
      }
    }

    // 13. Notifications
    {
      const resNotifs = await request('/notifications', { token: partToken });
      logTest('Notifications', 'GET /api/notifications', resNotifs.status === 200 && Array.isArray(resNotifs.data?.data));

      const resUnread = await request('/notifications/unread-count', { token: partToken });
      logTest('Notifications', 'GET /api/notifications/unread-count', resUnread.status === 200 && typeof resUnread.data?.data?.count === 'number');

      const resMarkAll = await request('/notifications/read-all', { method: 'PATCH', token: partToken });
      logTest('Notifications', 'PATCH /api/notifications/read-all', resMarkAll.status === 200);
    }

    // 14. Dashboards & Analytics
    {
      const resPartDash = await request('/participant/dashboard', { token: partToken });
      logTest('Dashboards', 'GET /api/participant/dashboard', resPartDash.status === 200 && resPartDash.data?.data?.registrations);

      const resOrgAnalytics = await request('/organizer/analytics', { token: orgToken });
      logTest('Dashboards', 'GET /api/organizer/analytics', resOrgAnalytics.status === 200 && typeof resOrgAnalytics.data?.data?.myHackathons === 'number');

      const resJudgeDash = await request('/judge/dashboard', { token: judgeToken });
      logTest('Dashboards', 'GET /api/judge/dashboard', resJudgeDash.status === 200 && typeof resJudgeDash.data?.data?.totalAssigned === 'number');
    }

    // 15. Admin APIs & User Blocking Checks
    {
      // Non-Admin Access Attack on Admin API
      const resPartAdmin = await request('/admin/analytics', { token: partToken });
      logTest('Security', 'Participant Access Admin API Attack Rejected with 403', resPartAdmin.status === 403);

      // Admin Analytics
      const resAdminAnalytics = await request('/admin/analytics', { token: adminToken });
      logTest('Admin', 'GET /api/admin/analytics', resAdminAnalytics.status === 200 && typeof resAdminAnalytics.data?.data?.totalUsers === 'number');

      // Admin Users List & Activity Logs
      const resAdminUsers = await request('/admin/users', { token: adminToken });
      logTest('Admin', 'GET /api/admin/users', resAdminUsers.status === 200 && Array.isArray(resAdminUsers.data?.data));

      const resAdminLogs = await request('/admin/activity-logs', { token: adminToken });
      logTest('Admin', 'GET /api/admin/activity-logs', resAdminLogs.status === 200 && Array.isArray(resAdminLogs.data?.data));

      // Admin Block User Test
      const resBlock = await request(`/admin/users/${part2Id}/block`, { method: 'PATCH', token: adminToken });
      logTest('Admin', 'Admin Block User', resBlock.status === 200);

      // Blocked User Access Attack with active token
      const resBlockedMe = await request('/auth/me', { token: part2Token });
      logTest('Security', 'Blocked User Token Rejected on Protected API with 403', resBlockedMe.status === 403);

      // Admin Unblock User
      const resUnblock = await request(`/admin/users/${part2Id}/unblock`, { method: 'PATCH', token: adminToken });
      logTest('Admin', 'Admin Unblock User', resUnblock.status === 200);
    }
  } catch (err) {
    console.error('Unhandled error in E2E tests:', err);
  } finally {
    console.log('\n========================================');
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;
    console.log(`TOTAL TESTED: ${results.length}`);
    console.log(`TOTAL PASSED: ${passedCount}`);
    console.log(`TOTAL FAILED: ${failedCount}`);
    console.log('========================================\n');

    if (serverInstance) {
      serverInstance.close();
    }

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runE2ETests();
