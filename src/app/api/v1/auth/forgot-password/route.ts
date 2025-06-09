import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { generateResetToken, getResetTokenExpiry } from '@/lib/auth';
import { sendResetPasswordEmail } from '@/lib/email';
import { forgotPasswordSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    const successMessage = 'If an account with that email exists, we have sent a password reset link.';

    if (!user) {
      return NextResponse.json({
        success: true,
        message: successMessage,
      });
    }

    // Clean up old reset tokens for this user
    await prisma.resetToken.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { used: true },
          { expiresAt: { lt: new Date() } }
        ]
      }
    });

    // Generate reset token
    const resetToken = generateResetToken();

    // Save reset token
    await prisma.resetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: getResetTokenExpiry(),
      },
    });

    // Send reset email (with fallback for null name)
    try {
      const userName = user.name ?? 'there';
      await sendResetPasswordEmail(email, resetToken, userName);
    } catch (emailError) {
      console.error('Reset email error:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
    });

    } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
    );
    }
}
