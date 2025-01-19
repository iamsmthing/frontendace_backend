import { Router} from 'express';
import { createPost, deletePost, getAllPosts, updatePost } from '../user_post/post';
import { toggleUpvote } from '../user_post/upvote';
import { createComment,  getCommentsByPost, getCommentsByPost1 } from '../user_post/comments';


const router = Router();

router.post('/createPost',createPost);
router.delete('/deletePost/:id',deletePost)
router.post('/updatePost',updatePost)
router.get('/fetchAllPosts',getAllPosts)
router.post('/upvote',toggleUpvote)
router.post('/comments',createComment);
router.get('/comments/:id',getCommentsByPost1);




export default router;


