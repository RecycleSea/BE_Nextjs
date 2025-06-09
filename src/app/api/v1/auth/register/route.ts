import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword, generateOtp, getOtpExpiry } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isEmailVerified: false,
      },
    });

    // Clean up old OTP codes for this email
    await prisma.otpCode.deleteMany({
      where: { email }
    });

    // Generate and save OTP
    const otp = generateOtp();
    await prisma.otpCode.create({
      data: {
        code: otp,
        email,
        userId: user.id,
        expiresAt: getOtpExpiry(),
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp, name);

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      data: { 
        email: user.email,
        name: user.name,
        requiresVerification: true
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}