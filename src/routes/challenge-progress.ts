import { Router} from 'express';
import { getAllProblemsWithCompletionStatus } from '../challenges/progress';
import { markAsComplete } from '../challenges/challenge';


const router = Router();

router.post('/markAsComplete',markAsComplete);
router.post('/getChallengesForUser',getAllProblemsWithCompletionStatus);

export default router;


