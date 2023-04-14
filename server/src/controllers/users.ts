import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import UserModel from '../models/user';
import { UserDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from 'jsonwebtoken';
import { secret } from "../config";

const normalizeUser = (user: UserDocument) => {
  const token = jwt.sign({id: user.id, email: user.email}, secret);
  return {
    email: user.email, 
    username: user.username, 
    id: user.id, 
    token: `Bearer ${token}`, 
  };
};

export const register = async (
  req: ExpressRequestInterface, 
  res: Response, 
  next: NextFunction, 
) => {
  try {
    const newUser = new UserModel({
      email: req.body.email, 
      username: req.body.username, 
      password: req.body.password,
    }); 
    const savedUser = await newUser.save();
    res.send(normalizeUser(savedUser));
  } catch(err) {
    if (err instanceof Error.ValidationError) {
      const messages = Object.values(err.errors).map((err) => {err.message});
      return res.status(422).json(messages);
    }
    next(err);
  }
};

export const login = async (
  req: ExpressRequestInterface, 
  res: Response, 
  next: NextFunction 
) => {
  try {
    const user = await UserModel.findOne({email: req.body.email}).select("+password")
    const errors = { emailOrPassword: 'Incorrect email or password' };

    if (!user) {
      return res.status(422).json(errors);
    }

    const isSamePassword = await user.validatePassword(req.body.password);

    if (!isSamePassword) {
      return res.sendStatus(422).json(errors);
    }

    res.send(normalizeUser(user));
  } catch (err) {
    next(err);
  };
};

export const currentUser = (req: ExpressRequestInterface, res: Response) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  res.send(normalizeUser(req.user));
};