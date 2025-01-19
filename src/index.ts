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


const peerData=[
  {
      id: '1',
      title: "Redesign Landing Page",
      description: "Complete redesign of our company's landing page",
      assignee: "Alice Johnson",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      status: "Pending Review",
      progress: 75,
      screenshot: "https://res.cloudinary.com/dtzsujhps/image/upload/v1737098984/j8nerxgoz7vh56o02vmm.webp",
      code: `
  import React from 'react';
  
  const LandingPage = () => {
    return (
      <div className="landing-page">
        <header>
          <h1>Welcome to Our Company</h1>
          <nav>{/* Navigation items */}</nav>
        </header>
        <main>
          <section className="hero">
            <h2>Transform Your Business with Our Solutions</h2>
            <button>Get Started</button>
          </section>
          {/* More sections */}
        </main>
        <footer>{/* Footer content */}</footer>
      </div>
    );
  };
  
  export default LandingPage;
      `
    },
    {
      id: '2',
      title: "Implement User Authentication",
      description: "Add secure user authentication to the platform",
      assignee: "Bob Smith",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      status: "Pending Review",
      progress: 50,
      screenshot: "/placeholder.svg?height=300&width=500",
      code: `
  import { useState } from 'react';
  import { signIn } from 'next-auth/react';
  
  const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      await signIn('credentials', { email, password });
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Log In</button>
      </form>
    );
  };
  
  export default LoginForm;
      `
    },
    {
      id: '3',
      title: "Optimize Database Queries",
      description: "Improve performance of key database queries",
      assignee: "Charlie Brown",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      status: "Approved",
      progress: 100,
      screenshot: "/placeholder.svg?height=300&width=500",
      code: `
  
  
  async function getUsers() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE active = true');
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  async function getUserPosts(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT p.* FROM posts p JOIN users u ON p.user_id = u.id WHERE u.id = $1',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  module.exports = { getUsers, getUserPosts };
      `
    },
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
  app.get("/api/peer/:id", (req, res) => {
    const { id } = req.params;
  
    // Find the project by ID
    const project = peerData.find((p) => p.id === id);
  
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