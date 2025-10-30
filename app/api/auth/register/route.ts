import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { hashPassword, validateEmail, validatePassword, validatePhone, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role = 'client' } = await req.json()

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!validatePhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    if (!['admin', 'client'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await users.insertOne(newUser)
    
    // Generate token
    const authUser = {
      id: result.insertedId.toString(),
      name,
      email,
      phone,
      role
    }
    
    const token = generateToken(authUser)

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: authUser
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}