import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // Ambil resetToken dari URL
    const url = new URL(request.url);
    const resetToken = url.pathname.split("/").pop();

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: "Reset token is missing" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { newPassword } = result.data;

    // Find valid reset token
    const tokenRecord = await prisma.resetToken.findFirst({
      where: {
        token: resetToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: tokenRecord.user.id },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.resetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId: tokenRecord.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
