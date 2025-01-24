"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progress_1 = require("../challenges/progress");
const challenge_1 = require("../challenges/challenge");
const router = (0, express_1.Router)();
router.post('/markAsComplete', challenge_1.markAsComplete);
router.post('/getChallengesForUser', progress_1.getAllProblemsWithCompletionStatus);
exports.default = router;
