import { Router} from 'express';
import { createPost, deletePost, getAllPosts, updatePost } from '../user_post/post';
import { toggleUpvote } from '../user_post/upvote';


const router = Router();

router.post('/createPost',createPost);
router.delete('/deletePost/:id',deletePost)
router.post('/updatePost',updatePost)
router.get('/fetchAllPosts',getAllPosts)
router.post('/upvote',toggleUpvote)




export default router;


