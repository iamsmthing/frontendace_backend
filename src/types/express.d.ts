// src/types/express.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // Use a specific type instead of 'any' if possible, e.g., User
  }
}
