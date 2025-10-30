import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenFromRequest, verifyToken, hashPassword, comparePassword, validateEmail, validatePhone, validatePassword } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    const userData = await users.findOne({ _id: new ObjectId(user.id) })
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    })

  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, email, phone, currentPassword, newPassword } = await req.json()

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    const userData = await users.findOne({ _id: new ObjectId(user.id) })
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: any = { updatedAt: new Date() }

    // Update basic info
    if (name && name !== userData.name) {
      updateData.name = name
    }

    if (email && email !== userData.email) {
      if (!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
      
      // Check if email already exists
      const existingUser = await users.findOne({ email, _id: { $ne: new ObjectId(user.id) } })
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
      
      updateData.email = email
    }

    if (phone && phone !== userData.phone) {
      if (!validatePhone(phone)) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
      }
      updateData.phone = phone
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }

      const isValidCurrentPassword = await comparePassword(currentPassword, userData.password)
      if (!isValidCurrentPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.valid) {
        return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
      }

      updateData.password = await hashPassword(newPassword)
    }

    await users.updateOne({ _id: new ObjectId(user.id) }, { $set: updateData })

    return NextResponse.json({ message: 'Profile updated successfully' })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted' }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')
    const chatHistory = db.collection('chat_history')

    // Delete user and their chat history
    await Promise.all([
      users.deleteOne({ _id: new ObjectId(user.id) }),
      chatHistory.deleteMany({ userId: user.id })
    ])

    return NextResponse.json({ message: 'Account deleted successfully' })

  } catch (error: any) {
    console.error('Profile delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}