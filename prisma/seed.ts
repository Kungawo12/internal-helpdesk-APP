import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.feedback.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const employee1 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@company.com",
      password,
      role: "employee",
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: "Mike Chen",
      email: "mike@company.com",
      password,
      role: "employee",
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      name: "Lisa Park",
      email: "lisa@company.com",
      password,
      role: "employee",
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@company.com",
      password,
      role: "admin",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "David Wilson",
      email: "david@company.com",
      password,
      role: "manager",
    },
  });

  const itStaff = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@company.com",
      password,
      role: "it_staff",
    },
  });

  const hrStaff = await prisma.user.create({
    data: {
      name: "Emma Taylor",
      email: "emma@company.com",
      password,
      role: "hr_staff",
    },
  });

  // Create tickets with various statuses
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Cannot connect to company VPN",
      description:
        "Getting a timeout error when trying to connect to the VPN from home. Tried restarting my router and laptop. Error code: VPN_TIMEOUT_403.",
      type: "IT",
      status: "resolved",
      priority: "high",
      solution:
        "Updated VPN client to latest version and reconfigured the connection profile. The old profile was pointing to a deprecated server endpoint.",
      creatorId: employee1.id,
      assigneeId: itStaff.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Laptop keyboard not working properly",
      description:
        "Several keys on my laptop keyboard are unresponsive. The keys E, R, and T do not register when pressed. Started happening after the latest system update.",
      type: "IT",
      status: "in_progress",
      priority: "medium",
      creatorId: employee2.id,
      assigneeId: itStaff.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Need access to project management tool",
      description:
        "I recently joined the marketing team and need access to the project management tool (Asana). My manager approved the request verbally.",
      type: "IT",
      status: "open",
      priority: "medium",
      creatorId: employee3.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Monitor flickering intermittently",
      description:
        "My external monitor flickers every few minutes. It happens more frequently when multiple windows are open. Using a Dell 27-inch display connected via HDMI.",
      type: "IT",
      status: "open",
      priority: "low",
      creatorId: employee1.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Email not syncing on phone",
      description:
        "Company email stopped syncing on my work phone since yesterday. I can access it from my laptop browser fine. Phone is an iPhone 15 with iOS 18.",
      type: "IT",
      status: "open",
      priority: "high",
      creatorId: employee2.id,
    },
  });

  // HR tickets
  const hrTicket1 = await prisma.ticket.create({
    data: {
      title: "Holiday balance discrepancy",
      description:
        "My holiday balance shows 12 days remaining but according to my calculations it should be 15. I took 5 days in January and started the year with 20.",
      type: "HR",
      status: "resolved",
      priority: "medium",
      solution:
        "Reviewed the records and found that 3 days from a December carry-over were not applied. Balance has been corrected to 15 days.",
      creatorId: employee3.id,
      assigneeId: hrStaff.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Payslip not available for April",
      description:
        "I cannot find my payslip for April 2026 in the HR portal. All previous months are showing correctly.",
      type: "HR",
      status: "open",
      priority: "high",
      creatorId: employee1.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Update emergency contact details",
      description:
        "I need to update my emergency contact information. New contact: Jane Smith, relationship: spouse, phone: 555-0198.",
      type: "HR",
      status: "in_progress",
      priority: "low",
      creatorId: employee2.id,
      assigneeId: hrStaff.id,
    },
  });

  // Add feedback for resolved tickets
  await prisma.feedback.create({
    data: {
      rating: 5,
      comment:
        "Alex resolved this within an hour. The new VPN configuration works perfectly now. Great support!",
      ticketId: ticket1.id,
      userId: employee1.id,
    },
  });

  await prisma.feedback.create({
    data: {
      rating: 4,
      comment: "Issue resolved correctly. Took a couple of days but the balance is now accurate.",
      ticketId: hrTicket1.id,
      userId: employee3.id,
    },
  });

  console.log("Seed complete!");
  console.log("");
  console.log("Demo accounts (all passwords: password123):");
  console.log("─────────────────────────────────────────────");
  console.log("Admin:     admin@company.com");
  console.log("Employee:  sarah@company.com");
  console.log("Employee:  mike@company.com");
  console.log("Employee:  lisa@company.com");
  console.log("Manager:   david@company.com");
  console.log("IT Staff:  alex@company.com");
  console.log("HR Staff:  emma@company.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
