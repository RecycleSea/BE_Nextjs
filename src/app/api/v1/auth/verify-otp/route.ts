import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { otpSchema } from '@/lib/validation';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = otpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = result.data;

    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Mark user as verified
    if (otpRecord.user) {
      await prisma.user.update({
        where: { id: otpRecord.user.id },
        data: { 
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(email, otpRecord.user.name ?? '');
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Don't fail the verification if welcome email fails
      }
    }

    // Clean up old OTP codes for this email
    await prisma.otpCode.deleteMany({
      where: { 
        email,
        id: { not: otpRecord.id }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}