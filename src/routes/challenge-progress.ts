import { Router} from 'express';
import { getAllProblemsWithCompletionStatus } from '../challenges/progress';
import { fetchUserScores, markAsComplete } from '../challenges/challenge';


const router = Router();

router.post('/markAsComplete',markAsComplete);
router.post('/getChallengesForUser',getAllProblemsWithCompletionStatus);
router.get('/fetchLeaderBoardScore',fetchUserScores)

export default router;


