import express ,{Request,Response} from 'express';
import 'dotenv/config';
import { createNewUser, signIn } from './auth/user';
import cors from 'cors'; // Import cors
import { bulkCreateChallenges, createChallenge, deleteChallenge, getChallengeById, getChallenges } from './challenges/challenge';
import challengeRouter from './routes/challenge-progress';
import postRouter from './routes/post-router';
import { shield } from './auth/auth';

const app=express();
const port=process.env.PORT || 3002;
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.get('/',(req:Request,res:Response)=>{
    res.json({data:'hello'})
});
app.post('/signup',createNewUser);
app.post('/signin',signIn);
app.get('/getChallenges',getChallenges);
app.post('/getChallengeById',getChallengeById)
app.post('/createChallenge',createChallenge);
app.post('/bulkCreate',bulkCreateChallenges)
app.delete('/deleteChallenge/:id',deleteChallenge)


// temp route

const projectsData = [
  {
    id: "1",
    title: "E-commerce Dashboard",
    description: "Build a modern e-commerce admin dashboard with real-time analytics, order management, and inventory tracking.",
    type: "frontend",
    difficulty: "Intermediate",
    techStack: ["React", "TypeScript", "Tailwind CSS", "React Query"],
    githubUrl: "https://github.com/example/ecommerce-dashboard",
    guide: {
      sections: [
        {
          id: "setup",
          title: "Project Setup",
          description: "Set up your development environment and install dependencies",
          steps: [
            {
              id: "step-1",
              title: "Create Next.js Project",
              description: "Create a new Next.js project with TypeScript and Tailwind CSS",
              code: "npx create-next-app@latest my-dashboard --typescript --tailwind --eslint"
            },
            {
              id: "step-2",
              title: "Install Dependencies",
              description: "Install required packages for the project",
              code: "npm install @tanstack/react-query axios recharts @radix-ui/react-dialog"
            }
          ]
        },
        {
          id: "auth",
          title: "Authentication",
          description: "Implement user authentication and protected routes",
          steps: [
            {
              id: "step-3",
              title: "Set up Authentication Context",
              description: "Create an authentication context to manage user state",
              code: `export const AuthContext = createContext({})
              
export function AuthProvider({ children }) {
  // Add authentication logic here
}`
            },
            {
              id: "step-4",
              title: "Create Login Form",
              description: "Build a login form with validation"
            }
          ]
        }
      ],
      steps: []
    }
  },
  {
    id: "2",
    title: "Social Media API",
    description: "Create a RESTful API for a social media platform with authentication, posts, comments, and user relationships.",
    type: "backend",
    difficulty: "Advanced",
    techStack: ["Node.js", "Express", "PostgreSQL", "JWT"],
    githubUrl: "https://github.com/example/social-media-api",
    guide: {
      sections: [
        {
          id: "setup",
          title: "Initial Setup",
          description: "Set up your Node.js project and install dependencies",
          steps: [
            {
              id: "step-1",
              title: "Initialize Project",
              description: "Create a new Node.js project and install dependencies",
              code: "npm init -y\nnpm install express pg jsonwebtoken bcrypt cors dotenv"
            }
          ]
        }
      ],
      steps: []
    }
  }
]

// Route to fetch a project by id
app.get("/api/project/:id", (req, res) => {
    const { id } = req.params;
  
    // Find the project by ID
    const project = projectsData.find((p) => p.id === id);
  
    if (!project) {
      return res.status(404).json({ error: "Project nott found" });
    }
  
    return res.json(project);
  });


app.use('/v1/api',shield,challengeRouter)
app.use('/v1/api/post',shield,postRouter)

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})