import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import {Request,Response, NextFunction } from 'express';


export const hashPassword=async(password:string)=>{
    return bcrypt.hash(password,10);
}

export const generateToken=(user:any)=>{

    const token=jwt.sign(user,process.env.JWT_SECRET || 'secret',{expiresIn:'7d'});
    return token;
}

export const comparePassword=async(password:string,hash:string)=>{
    return bcrypt.compare(password,hash);

}

export const shield=async(req:Request,res:Response,next:NextFunction)=>{
    const bearer=req.headers.authorization;
    if(!bearer){
        return res.status(401).json({message:'Unauthorized'});
    }
    const token=bearer.split(' ')[1];
    if(!token){
        return res.status(401).json({message:'Unauthorized or Not a valid token'});
    } 
    try {
        const user=jwt.verify(token,process.env.JWT_SECRET! ||'secret');
        req.user=user;
        next();
        
    } catch (error) {
        res.json(error);
    }  

}