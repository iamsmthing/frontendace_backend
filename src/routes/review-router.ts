import { Router} from 'express';
import { getChallengeReviewsOfUser, getPendingPeerReviewById, getPendingPeerReviews, submitChallengeForReview, submitPeerReview } from '../peer-reviews/review';



const router = Router();

router.post('/submitChallenge',submitChallengeForReview);
router.get('/getPendingReviews',getPendingPeerReviews)
router.get('/getPendingReview/:id',getPendingPeerReviewById)
router.post('/submitPeerReview',submitPeerReview)
router.get('/getChallengeReviewsOfUser',getChallengeReviewsOfUser)


export default router;


