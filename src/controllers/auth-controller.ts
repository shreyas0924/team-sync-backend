import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../model/user'
import { secretKey } from '../utils'
import { PrismaClient } from '@prisma/client'
const saltRounds = 10

const prisma = new PrismaClient()
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, defaultGroupName } = req.body

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide username, email, and password' })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = await User.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    })

    await prisma.group.create({
      data: {
        name: defaultGroupName,
        members: {
          create: { userId: user.id, role: 'ADMIN' }, // Assuming user who logged in is an admin of the group
        },
      },
    })

    const token = jwt.sign({ userId: user.id }, secretKey!)

    res.status(201).json({ token })
  } catch (error) {
    console.error('Error signing up:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide email and password' })
    }

    const user = await User.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    const token = jwt.sign({ userId: user.id }, secretKey!)

    res.status(200).json({ token })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
