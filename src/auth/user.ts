import {db} from '../db/drizzle';
import {users} from '../db/schema/schema';
import {v4 as uuidv4} from 'uuid';
import { Request,Response } from 'express';
import { eq } from 'drizzle-orm';
import { error } from 'console';
import { comparePassword, generateToken, hashPassword } from './auth';

export const createNewUser=async(req:Request,res:Response)=>{
    const checkIfUserExists=await db.select().from(users).where(eq(users.email,req.body.email));
    if(checkIfUserExists.length>0){
        return res.status(400).json({message:"User already exists"});
    }
    try {
        const {email,password,username,imageUrl}=req.body;
        const hash=await hashPassword(password);
        const user=await db.insert(users).values({id:uuidv4(),username,email,password:hash,imageUrl}).returning();
        const token=generateToken({id:user[0].id});
        console.log(token);
        const data={
            id:user[0].id,
            username:user[0].username,
            email:user[0].email,
            imageUrl,
            token

        }
        return res.json(data);
    } catch (error) {
        console.log(error);
        res.json(error)
        
    }
}

export const signIn=async(req:Request,res:Response)=>{
    try {
        const {email,password}=req.body;
        const user=await db.select().from(users).where(eq(users.email,email));
        if(!user.length){
            return res.status(404).json({error:'User not found'});
        }
        const isPasswordValid=await  comparePassword(password,user[0].password);
        if(!isPasswordValid){
            return res.status(401).json({error:'Invalid password'});
        }
        const token=generateToken({id:user[0].id});
        const data={
            id:user[0].id,
            username:user[0].username,
            email:user[0].email,
            imageUrl:user[0].imageUrl,
            token

        }
        return res.json(data);
    } catch (error) {
        return res.status(500).json(error);
        
    }
}