import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const validRoles = ["employee", "it_staff", "hr_staff", "admin"];

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const userRole = validRoles.includes(role) ? role : "employee";

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
      },
    });

    return Response.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
