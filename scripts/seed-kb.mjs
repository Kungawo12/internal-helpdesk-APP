/**
 * KB SEED SCRIPT
 * ==============
 * Clears all existing KB articles and seeds 45 high-quality FAQ articles
 * covering the most common employee helpdesk questions.
 *
 * Run: node --env-file=.env scripts/seed-kb.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FAQ_ARTICLES = [
  // ─── IT (15 articles) ─────────────────────────────────────────────────────
  {
    title: "How do I reset my password if I'm locked out?",
    type: "IT",
    tags: "password,login,locked,account,access",
    content: `If you're locked out of your account, follow these steps:

1. Go to the login page and click "Forgot Password" below the sign-in button.
2. Enter your company email address and click "Send Reset Link."
3. Check your inbox (and spam folder) for an email from helpdesk@company.com.
4. Click the reset link within 30 minutes — it expires after that.
5. Choose a new password that is at least 12 characters, includes uppercase, lowercase, a number, and a special character.
6. Log in with your new password.

If you don't receive the reset email within 5 minutes, check your spam/junk folder. If it's still not there, raise an IT ticket and select "Password Reset" as the category — IT staff can manually reset your account.

Important: Never share your password with anyone, including IT staff. We will never ask for your password.`,
  },
  {
    title: "How do I connect to the company VPN from home?",
    type: "IT",
    tags: "vpn,remote,work from home,network,access",
    content: `The VPN (Virtual Private Network) allows you to securely access company resources from outside the office.

Setup steps:
1. Download the VPN client from the company software portal (ask IT for the link if you don't have it).
2. Install the application and launch it.
3. Enter the VPN server address provided in your IT onboarding email.
4. Log in with your company username and password.
5. If prompted for a second factor, open your authenticator app and enter the 6-digit code.

Common issues:
- "Authentication failed": Double-check your password hasn't expired. Try resetting via the password reset page.
- "Cannot connect to server": Check your internet connection first. Try a different network (e.g., mobile hotspot) to rule out home router issues.
- Slow connection through VPN: Avoid running large downloads while connected. Use VPN only when accessing internal systems.

Contact IT support if you're unable to connect after following these steps.`,
  },
  {
    title: "My laptop is running slow — what should I try first?",
    type: "IT",
    tags: "slow,performance,laptop,computer,speed",
    content: `Before raising a ticket, try these steps to speed up your laptop:

1. Restart your computer. This clears memory and closes background processes. Do this at least once a week.
2. Close unused browser tabs and applications. Each tab uses memory.
3. Check storage space. Go to Settings > Storage (Windows) or Apple menu > About This Mac > Storage (Mac). If less than 10GB free, delete or archive old files.
4. Run Windows Update or macOS Software Update — outdated OS can cause slowness.
5. Check for too many startup programs: Windows: Task Manager > Startup tab. Disable any non-essential apps.
6. Scan for malware using the company-approved antivirus software.
7. Check if a specific application is causing the issue. Open Task Manager (Ctrl+Shift+Esc on Windows) and look at the CPU/Memory column.

If none of the above helps after 24 hours, raise an IT ticket with details of what you've tried. Include how long the issue has been happening and whether it started after any changes (software installs, updates, etc.).`,
  },
  {
    title: "How do I set up two-factor authentication (2FA)?",
    type: "IT",
    tags: "2fa,mfa,security,authentication,login",
    content: `Two-factor authentication (2FA) adds an extra layer of security to your account. It is mandatory for all staff.

To set up 2FA:
1. Download an authenticator app on your phone: Google Authenticator, Microsoft Authenticator, or Authy are all supported.
2. Log into your company account and go to Settings > Security > Two-Factor Authentication.
3. Click "Enable 2FA" and choose "Authenticator App."
4. Open your authenticator app, tap the "+" button, and scan the QR code shown on screen.
5. Enter the 6-digit code from the app to confirm setup.
6. Save your backup codes in a secure location (printed or a password manager). These let you log in if you lose your phone.

Once enabled, you'll be asked for a 6-digit code every time you log in from a new device.

Lost your phone? Use one of your saved backup codes to log in, then go to Security Settings to re-enroll a new device. If you've lost your backup codes too, raise an urgent IT ticket.`,
  },
  {
    title: "How do I request access to a new system or application?",
    type: "IT",
    tags: "access,software,permissions,application,request",
    content: `To request access to a system or application you don't currently have:

1. Raise an IT ticket and select type: "IT" with category "Service Request."
2. In the title, write: "Access Request: [System Name]" (e.g., "Access Request: Salesforce").
3. In the description, include:
   - Why you need access (your business reason)
   - Your manager's name (approval will be sought from them)
   - The level of access needed (read-only, edit, admin)
   - Urgency / date needed by

Approval process:
- Your manager will receive an email to approve or reject the request.
- Once approved, IT will provision access within 1 business day for standard systems, up to 3 days for systems requiring vendor provisioning.

Important: Do not ask colleagues to share their login credentials. Shared accounts violate the company's security policy and can result in disciplinary action.`,
  },
  {
    title: "My screen is blank or flickering — what do I do?",
    type: "IT",
    tags: "screen,monitor,display,flickering,blank",
    content: `Screen issues are usually hardware or driver related. Try these steps:

For a blank screen:
1. Check the power cable on your monitor is firmly connected.
2. Check the cable connecting monitor to computer (HDMI/DisplayPort/USB-C) is secure at both ends.
3. Press the power button on the monitor to confirm it's on.
4. Try a different cable or port if available.
5. If using a laptop with an external monitor, press Win+P to check display settings.

For a flickering screen:
1. Update your display driver: Device Manager > Display Adapters > right-click > Update Driver.
2. Check refresh rate: Right-click desktop > Display Settings > Advanced Display Settings > set to 60Hz or higher.
3. If flickering started after a Windows update, roll back the display driver.
4. Rule out the cable by swapping it.

For laptop screens specifically: If the screen flickers when you move the lid, this may indicate a failing display cable — raise a hardware ticket immediately.

Take a photo or video of the issue before raising the ticket — it helps IT diagnose faster.`,
  },
  {
    title: "How do I connect to the office WiFi?",
    type: "IT",
    tags: "wifi,wireless,network,internet,office",
    content: `The office has two WiFi networks:

1. CompanyNet (for work devices): Use your company login credentials (same username and password as your computer login). This gives full access to internal systems.

2. CompanyGuest (for visitors and personal devices): No password needed. This is internet-only and cannot access internal systems.

To connect your work laptop to CompanyNet:
1. Click the WiFi icon in your taskbar.
2. Select "CompanyNet" from the list.
3. Enter your company username and password when prompted.
4. Tick "Remember this network" so you connect automatically in future.

If you're getting "Authentication failed": Your password may have changed recently. Try your current login password. If it still fails, raise an IT ticket.

If you're connected but have no internet: Try forgetting the network and reconnecting. If the issue persists, check if others nearby are also affected — if so, there may be a network outage. Check the IT status board for updates.`,
  },
  {
    title: "How do I install approved software on my work computer?",
    type: "IT",
    tags: "software,install,applications,it portal,download",
    content: `Work computers are locked to prevent installation of unauthorised software. You can only install software through the company's approved software portal.

To install approved software:
1. Open the Company Software Portal (icon on your desktop, or search "Software Center" in Start menu on Windows).
2. Browse or search for the application you need.
3. Click "Install" — no admin password is required for approved applications.
4. The installation runs in the background. You'll get a notification when complete.

Need software that isn't in the portal?
1. Raise an IT ticket: type "Service Request," category "Software Request."
2. Explain the business need for the software.
3. IT will evaluate it for security and licensing compliance.
4. Approved software is typically added to the portal within 5 business days.

Do NOT install software downloaded from the internet directly — this bypasses security scanning and could introduce malware. Violating this policy may result in disciplinary action.`,
  },
  {
    title: "What should I do if I receive a suspicious email?",
    type: "IT",
    tags: "phishing,email,security,spam,scam",
    content: `Phishing emails are designed to steal your credentials or install malware. Here's what to do:

Signs of a phishing email:
- Unexpected requests for your password, banking details, or personal information
- Urgency language: "Act now!", "Your account will be closed"
- Generic greeting: "Dear Customer" instead of your name
- Suspicious sender address (hover over the name to see the actual email)
- Links that don't match the company they claim to be from
- Attachments you weren't expecting

If you receive a suspicious email:
1. Do NOT click any links or open attachments.
2. Do NOT reply to the email.
3. Forward the email as an attachment to security@company.com.
4. Delete the email from your inbox.
5. Raise an IT ticket if you accidentally clicked a link or entered credentials.

If you clicked a link or entered your password:
- Immediately raise an URGENT IT ticket.
- Change your password right now.
- IT Security will investigate and contain any breach.

Remember: IT staff will NEVER ask for your password via email.`,
  },
  {
    title: "How do I set up my work email on my phone?",
    type: "IT",
    tags: "email,phone,mobile,outlook,setup",
    content: `You can access your work email on your personal phone using Microsoft Outlook.

iPhone setup:
1. Download "Microsoft Outlook" from the App Store.
2. Open Outlook and tap "Add Account."
3. Enter your company email address.
4. Tap "Next" — Outlook will auto-configure the settings.
5. Enter your password and complete 2FA if prompted.
6. Allow the company to manage the app (required for security compliance).

Android setup:
1. Download "Microsoft Outlook" from the Google Play Store.
2. Open Outlook and tap "Add Account."
3. Enter your company email address and tap "Continue."
4. Enter your password and complete 2FA.
5. Accept the mobile device management policy.

Important notes:
- By accepting MDM (Mobile Device Management), IT can remotely wipe the work data from the Outlook app (NOT your whole phone) if you report your phone lost or stolen.
- Using third-party mail apps (Gmail, Apple Mail) for work email is not recommended as they may not encrypt email properly.

Having trouble? Raise an IT ticket and mention your phone model and OS version.`,
  },
  {
    title: "How do I recover deleted files?",
    type: "IT",
    tags: "deleted,files,recovery,recycle bin,backup",
    content: `Whether you can recover a deleted file depends on where it was stored and how it was deleted.

Files deleted from your desktop or local drive:
1. Check the Recycle Bin (Windows) or Trash (Mac) first — double-click and look for your file.
2. Right-click the file and select "Restore" to put it back where it was.
3. If you emptied the Recycle Bin, raise an IT ticket immediately — recovery becomes harder over time.

Files stored on a company network drive or SharePoint:
1. Navigate to the folder where the file was.
2. Windows: Right-click in the folder > "Restore previous versions" — you can often recover files from snapshots.
3. SharePoint: Files are kept in the "Recycle Bin" for 93 days. Click the Recycle Bin icon in the left sidebar.

Files deleted from OneDrive:
1. Go to onedrive.com and sign in.
2. Click "Recycle Bin" in the left sidebar.
3. Find your file and click "Restore."

Raise an IT ticket if:
- The file is not in any recycle bin
- You need a version from more than 93 days ago
- The file was critical (finances, contracts) — IT can escalate to backup recovery.`,
  },
  {
    title: "How do I fix a printer that won't print?",
    type: "IT",
    tags: "printer,print,offline,queue,stuck",
    content: `Printer issues are usually one of three things: connection, queue jam, or driver. Try these in order:

Step 1 — Check the basics:
- Is the printer powered on? (Green light on the front panel)
- Is the paper tray loaded?
- Is there a paper jam? Open all doors/trays and check.
- Are ink/toner levels low? Check the printer's display screen.

Step 2 — Clear the print queue:
1. Open Settings > Devices > Printers & Scanners (Windows) or System Settings > Printers & Scanners (Mac).
2. Click your printer > Open Queue.
3. Cancel all pending jobs.
4. Try printing again.

Step 3 — Restart the print spooler (Windows):
1. Press Win+R, type "services.msc," press Enter.
2. Find "Print Spooler," right-click > Restart.
3. Try printing again.

Step 4 — Remove and re-add the printer:
1. Go to Printers & Scanners settings and remove the printer.
2. Add it again — it will reinstall the driver automatically.

If the printer shows as "Offline" despite being on:
- Right-click the printer > "See what's printing" > Printer menu > Uncheck "Use Printer Offline."

Still not working? Raise an IT ticket with the printer name, location, and error message shown.`,
  },
  {
    title: "How do I set up remote desktop to access my work computer?",
    type: "IT",
    tags: "remote desktop,rdp,remote access,work from home,home office",
    content: `Remote Desktop allows you to connect to your office computer from home as if you were sitting at it.

Requirements:
- You must be connected to the company VPN first (see the VPN setup guide).
- Remote Desktop must be enabled on your work computer (IT can enable this for you).
- Your work computer must be turned on and not in hibernation.

Windows to Windows:
1. Connect to VPN first.
2. Press Win+R, type "mstsc" and press Enter.
3. Enter your work computer's hostname (format: COMP-YOURNAME or ask IT for yours).
4. Click Connect and enter your company credentials.

Mac to Windows:
1. Download "Microsoft Remote Desktop" from the Mac App Store.
2. Connect to VPN first.
3. Open the app, click "Add PC."
4. Enter your work computer's hostname.
5. Under "User Account," add your company credentials.
6. Double-click to connect.

Common issues:
- "Cannot connect": Confirm VPN is active and your work computer is on.
- "Credentials not accepted": Use DOMAIN\\username format if a domain prompt appears.

Raise an IT ticket to request Remote Desktop be enabled on your machine if you haven't used it before.`,
  },
  {
    title: "How do I share files securely with colleagues and external parties?",
    type: "IT",
    tags: "files,sharing,onedrive,sharepoint,secure,external",
    content: `Always use company-approved methods to share files. Do not use personal Dropbox, Google Drive, or WeTransfer for work files.

Sharing with colleagues internally:
1. Save the file to OneDrive or SharePoint.
2. Right-click the file > Share.
3. Type the colleague's name or email.
4. Choose permission level: "Can edit" or "Can view."
5. Click Send — they'll receive a link via email.

Sharing with external parties:
1. Save the file to OneDrive or SharePoint.
2. Right-click > Share > Click the link settings (the pencil icon).
3. Change "Anyone with the link" to "Specific people" for sensitive files.
4. Enter the external person's email address.
5. Set an expiry date if the access is temporary.
6. Click Send.

For highly confidential files (contracts, personal data, financial documents):
- Use encrypted email: compose your email and check "Encrypt" before sending.
- Or use the company's secure file transfer portal — ask IT for the link.

Never email sensitive files as unencrypted attachments. Do not share files via WhatsApp or personal email accounts.`,
  },
  {
    title: "How do I request a hardware upgrade (laptop, monitor, peripherals)?",
    type: "IT",
    tags: "hardware,laptop,monitor,upgrade,equipment,peripherals",
    content: `Hardware requests go through the IT team and require manager approval.

To request new or replacement hardware:
1. Raise an IT ticket and select category "Service Request."
2. Title it: "Hardware Request: [item]" (e.g., "Hardware Request: Additional Monitor").
3. In the description, include:
   - What you're requesting and why (business justification)
   - Your current hardware details (if requesting a replacement)
   - Your manager's name for approval
   - Whether it's urgent and why

Approval and lead times:
- Standard peripherals (mice, keyboards, headsets): 3-5 business days.
- Monitors: 5-10 business days.
- Laptops/computers: 10-15 business days (subject to stock availability).
- Urgent replacements (faulty equipment affecting work): Same-day or next-day where possible.

For faulty hardware:
- Raise a ticket as above but note "FAULTY" in the title.
- If your laptop won't turn on, contact IT immediately — we can provide a loaner while yours is repaired.

Note: All company hardware remains company property. Return it when you leave the company.`,
  },

  // ─── HR (15 articles) ─────────────────────────────────────────────────────
  {
    title: "How many days of annual leave am I entitled to?",
    type: "HR",
    tags: "annual leave,holiday,entitlement,days off,pto",
    content: `Annual leave entitlement depends on your employment type and length of service:

Full-time employees:
- 0–2 years service: 25 days per year
- 2–5 years service: 27 days per year
- 5+ years service: 30 days per year

Part-time employees: Entitlement is calculated pro-rata based on your contracted hours. For example, 3 days per week = 60% of the full-time entitlement.

Public/bank holidays are in addition to the above entitlement.

Leave year:
- The leave year runs from January 1 to December 31.
- Up to 5 unused days can be carried over to the following year (must be used by March 31).
- Carry-over requires manager approval.

How to check your remaining balance:
- Log into the HR portal > My Leave > Balance.
- Or check your payslip — leave balance is shown each month.

Raise an HR ticket if you believe your balance is incorrect or if you need to discuss a carry-over arrangement.`,
  },
  {
    title: "How do I book annual leave?",
    type: "HR",
    tags: "annual leave,holiday,booking,request,time off",
    content: `Annual leave requests must be submitted with as much notice as possible. The minimum notice required is twice the length of the leave (e.g., 5 days off = 10 days' notice).

To book leave:
1. Log into the HR portal.
2. Go to My Leave > New Request.
3. Select the dates (start and end date).
4. Add a note if needed (e.g., "Family holiday — non-negotiable dates").
5. Submit — your manager will receive a notification to approve or decline.

You'll receive an email confirmation once your manager acts on the request.

Tips:
- Book popular periods (Christmas, school holidays, summer) as early as possible — approval is first-come, first-served.
- Check your team calendar before booking to avoid clashing with colleagues.
- Peak periods (Christmas week, Easter) may have a maximum number of simultaneous team absences — check with your manager.

If your request is declined:
- Your manager should provide a reason.
- Discuss alternative dates with them.
- If you feel the decision is unfair, raise an HR ticket to speak with an HR Business Partner.`,
  },
  {
    title: "What is the sick leave policy?",
    type: "HR",
    tags: "sick leave,illness,absence,sick pay,self-certification",
    content: `What to do when you're unwell:

On the day of absence:
1. Call or message your manager before your normal start time. Do not just send an email — you must speak with them or leave a voicemail.
2. Indicate how long you expect to be off if possible.
3. Arrange for urgent tasks to be covered if needed.

Self-certification (first 7 days):
- For absences of up to 7 calendar days, you self-certify your sickness.
- Complete the Self-Certification Form in the HR portal when you return.

Longer absences (8+ days):
- You will need a "fit note" (doctor's certificate) from your GP.
- Submit the fit note via the HR portal or email it to hr@company.com.
- HR will contact you to discuss a return-to-work plan.

Sick pay:
- Statutory Sick Pay (SSP) applies from day 4 of absence.
- Company sick pay: Full pay for the first 10 days per year, half pay for the next 10 days. After 20 days, SSP only.

Return to work:
- A return-to-work conversation with your manager is required after all absences.
- This is supportive, not disciplinary.

Raise an HR ticket for confidential questions about sick pay or medical adjustments.`,
  },
  {
    title: "How do I submit an expense claim?",
    type: "HR",
    tags: "expenses,claim,receipt,reimbursement,travel",
    content: `To claim back money you've spent on company business:

What can be claimed:
- Business travel (train, taxi, mileage)
- Meals when away from the office on business (up to £25 per day)
- Client entertainment (pre-approved by your manager)
- Work equipment under £50 (must be pre-approved for larger amounts)
- Conference/training fees

How to submit:
1. Keep all receipts — photos are accepted if they're clear and readable.
2. Log into the Expenses portal (link in the company intranet).
3. Create a new expense report and add each item individually.
4. Upload your receipt photo for each line item.
5. Add a brief description of the business purpose.
6. Submit for manager approval.

Timeline:
- Submit claims within 30 days of the expense.
- Claims over 60 days old may not be reimbursed.
- Approved claims are paid in the next payroll run (usually within 2 weeks).

Mileage claims:
- Use the current HMRC approved mileage rate (45p/mile for the first 10,000 miles in a tax year).
- Log your start and end postcode in the expenses system for automatic calculation.

Raise an HR ticket if your claim is rejected or if you need to claim for something unusual.`,
  },
  {
    title: "When do I get paid and how can I view my payslip?",
    type: "HR",
    tags: "payroll,payslip,salary,pay date,wages",
    content: `Pay schedule:
- Salaries are paid on the last working day of each month.
- If the last day is a weekend or bank holiday, payment is made on the last working day before that.

How to view your payslip:
1. Log into the HR portal.
2. Go to Pay > Payslips.
3. Select the month you want to view.
4. Download as PDF if you need a hard copy.

Payslips are uploaded on the 25th of each month (or the nearest working day).

Your payslip shows:
- Gross pay (before deductions)
- Tax (PAYE)
- National Insurance contributions
- Pension contributions
- Any additional deductions (e.g., cycle to work scheme)
- Net pay (what hits your bank account)

Payroll queries:
- Check your payslip carefully each month.
- If you notice a discrepancy, raise an HR ticket ASAP — corrections are easier to make before the following payroll runs.
- Include: what you expected vs what was paid, and the month affected.

Tax code queries: Contact payroll@company.com or raise an HR ticket.`,
  },
  {
    title: "What is the remote working policy?",
    type: "HR",
    tags: "remote working,work from home,hybrid,wfh,flexible working",
    content: `The company operates a hybrid working model for most roles.

Standard arrangement:
- Employees are expected to be in the office a minimum of 2 days per week (usually Tuesday and Thursday, though teams may have different core days).
- The other days can be worked remotely.
- Core office hours (10am–3pm) must be maintained regardless of location.

Requesting remote working:
- Speak with your manager to agree your hybrid arrangement.
- Complete the Remote Working Agreement in the HR portal if working primarily from home.

Equipment for home working:
- The company will provide a laptop. You are responsible for having a suitable internet connection (minimum 10Mbps download/upload recommended).
- Ergonomic equipment (chair, monitor, desk accessories) can be requested via an HR ticket — subject to manager approval and budget.
- You must connect via VPN when accessing company systems from home.

Ad hoc remote days:
- Let your manager know in advance (ideally the day before).
- Keep your status updated in Teams/Slack so the team knows your location.

Not eligible for hybrid working: Roles that require physical presence (reception, facilities, etc.) are not eligible for remote working. Check your contract.

Raise an HR ticket to discuss flexible working arrangements formally.`,
  },
  {
    title: "How do I request parental leave (maternity, paternity, shared parental)?",
    type: "HR",
    tags: "maternity,paternity,parental leave,baby,adoption",
    content: `The company offers enhanced parental leave above the statutory minimum.

Maternity leave:
- Up to 52 weeks of maternity leave.
- Enhanced pay: Full pay for weeks 1–16, 50% pay for weeks 17–26, statutory only for weeks 27–39.
- You must give at least 15 weeks' notice before your due date.

Paternity/partner leave:
- 2 weeks of paid leave at full pay, to be taken within 8 weeks of the birth/adoption.
- Give 4 weeks' notice where possible.

Shared parental leave (SPL):
- Allows parents to share up to 50 weeks of leave between them.
- Both parents must be eligible. Contact HR for eligibility checks.

Adoption leave:
- Same terms as maternity leave apply.

How to request parental leave:
1. Raise an HR ticket marked "Confidential."
2. State the type of leave and your expected dates.
3. HR will send you the relevant forms and have a private conversation with you.

Your job is protected during parental leave. You are entitled to return to the same or a suitable alternative role.

All parental leave discussions are kept strictly confidential.`,
  },
  {
    title: "How does the performance review process work?",
    type: "HR",
    tags: "performance review,appraisal,feedback,goals,objectives",
    content: `The company runs a twice-yearly performance review cycle.

Review schedule:
- Mid-year review: July (covers January–June)
- Year-end review: December (covers July–December and full-year summary)

The process:
1. Self-assessment (2 weeks before review): Complete your self-review in the HR portal — rate yourself against your objectives and provide examples.
2. Manager review: Your manager completes their assessment independently.
3. Calibration: Managers discuss ratings within their team to ensure fairness.
4. Review meeting: 1-on-1 conversation with your manager to discuss the assessment, achievements, development areas, and goals for the next period.
5. Finalisation: Review is signed off in the HR portal by you and your manager.

What's assessed:
- Achievement against objectives (SMART goals set at the start of the period)
- Behaviours and values alignment
- Development and growth

Ratings: Typically 5 levels from "Exceeds Expectations" to "Requires Improvement."

Setting objectives: Work with your manager at the start of each period to set 3–5 SMART objectives. These are logged in the HR portal.

Raise an HR ticket if you have concerns about your review process or outcome.`,
  },
  {
    title: "What training and development opportunities are available?",
    type: "HR",
    tags: "training,development,learning,courses,skills,career",
    content: `The company supports continuous learning through multiple channels.

Internal training:
- Monthly "Lunch & Learn" sessions — topics include technical skills, soft skills, and company updates.
- Onboarding programme for new joiners (first 3 months).
- Mentoring programme — sign up in the HR portal to be matched with a mentor.

Online learning platforms:
- All employees have access to LinkedIn Learning — log in with your company SSO (Single Sign-On).
- Role-specific tooling has dedicated training modules in the Software Portal.

External training and conferences:
- Each employee has an annual L&D budget of £500 (subject to manager approval).
- To use it: raise an HR ticket titled "Training Request" and include the course name, cost, dates, and how it benefits your role.
- Requests over £500 require director approval.

Certifications:
- The company will fund certifications relevant to your role (e.g., AWS, Microsoft, CIPD, ACCA).
- Raise an HR ticket with details of the certification and cost.

Career development conversations:
- Discuss career aspirations in your regular 1-on-1s with your manager.
- HR can facilitate development planning sessions — raise an HR ticket to request one.`,
  },
  {
    title: "How do I update my personal details (address, bank account, emergency contact)?",
    type: "HR",
    tags: "personal details,address,bank,emergency contact,update",
    content: `It's important to keep your details up to date so payroll, emergency services, and HR can contact the right people.

You can update the following yourself in the HR portal (My Profile section):
- Home address
- Phone number
- Emergency contact name and number
- Preferred name / pronouns

For changes that require verification or have payroll implications, raise an HR ticket:
- Bank account / sort code change (for payroll)
- Name change (requires legal documentation, e.g., deed poll or marriage certificate)
- National Insurance number update
- Visa / right to work document update

Changing your bank details:
1. Raise an HR ticket marked "Confidential — Bank Details Change."
2. Include your new account number and sort code.
3. Attach a bank statement or voided cheque as verification.
4. Changes submitted before the 20th of the month take effect in the same month's payroll.

Emergency contacts:
- Ensure at least one emergency contact is on file.
- To add or change: HR portal > My Profile > Emergency Contacts.

Your personal data is handled in accordance with GDPR. Raise an HR ticket if you have any data privacy questions.`,
  },
  {
    title: "What is the company's disciplinary and grievance process?",
    type: "HR",
    tags: "disciplinary,grievance,complaint,hr,process,conduct",
    content: `The company takes all disciplinary matters and employee grievances seriously and follows a fair, transparent process.

Disciplinary process:
If there is a concern about an employee's conduct or performance:
1. Informal stage: Manager discusses the concern privately with the employee, setting clear expectations.
2. Formal stage: If the issue continues, a formal investigation is triggered.
3. Disciplinary hearing: The employee is invited to a formal hearing with an HR representative present. They can bring a colleague or trade union rep.
4. Outcome: Options range from a verbal warning to final written warning or dismissal, depending on severity.
5. Appeal: The employee can appeal any formal outcome within 5 working days.

Gross misconduct (e.g., theft, harassment, serious data breach) can result in immediate suspension pending investigation, with potential dismissal without notice.

Grievance process:
If you have a complaint about your treatment at work:
1. Informal: Try to resolve it by speaking with your manager first. HR can facilitate if needed.
2. Formal grievance: If informal resolution fails, submit a written grievance to HR.
3. Investigation: HR will investigate and hold a grievance hearing within 10 working days.
4. Outcome: A written response will be provided.
5. Appeal: You can appeal the outcome within 5 working days.

Raise an HR ticket marked "Confidential" for all grievance or disciplinary queries. Everything is handled in strict confidence.`,
  },
  {
    title: "How does the company pension scheme work?",
    type: "HR",
    tags: "pension,retirement,contributions,workplace pension",
    content: `The company operates a workplace pension scheme in compliance with auto-enrolment legislation.

Auto-enrolment:
- All eligible employees are automatically enrolled in the pension scheme from their start date.
- Eligible means: aged 22–66 and earning over £10,000 per year.
- You'll receive a letter within 6 weeks of your start date confirming enrolment.

Contribution rates:
- Employee contribution: 5% of qualifying earnings (deducted from your salary pre-tax).
- Employer contribution: 4% of qualifying earnings (added on top by the company).
- Total minimum: 9% into your pension pot each month.

You can increase your contribution at any time via the HR portal > Pension Settings.

Opting out:
- You can opt out within 1 month of being enrolled and receive a refund.
- After that, you can stop contributions but won't get a refund.
- You'll be re-enrolled every 3 years even if you've opted out.

Pension provider:
- The company uses [Pension Provider Name] — you can view your pension pot, statements, and manage investments via their online portal.
- Log in at pensionprovider.com using your company email.

Raise an HR ticket for any queries about your pension — HR can connect you with a financial guidance session if needed.`,
  },
  {
    title: "How do I report a workplace concern or harassment?",
    type: "HR",
    tags: "harassment,bullying,concern,report,confidential,wellbeing",
    content: `The company has a zero-tolerance policy on bullying, harassment, and discrimination. All concerns are taken seriously and handled confidentially.

Types of concerns you can report:
- Bullying or harassment (in person, written, or online)
- Discrimination based on protected characteristics (age, gender, race, disability, etc.)
- Inappropriate behaviour or misconduct
- Health and safety concerns
- Suspected fraud or dishonesty (whistleblowing)

How to report:
Option 1 — Speak to HR directly:
- Raise an HR ticket marked "Confidential — Workplace Concern."
- An HR Business Partner will contact you within 24 hours.

Option 2 — Speak to your manager's manager:
- If your concern involves your manager, you can bypass them and go directly to the next level.

Option 3 — Anonymous reporting:
- Use the confidential whistleblowing hotline: 0800 XXX XXXX (available 24/7).
- Or submit anonymously via the Ethics & Compliance portal on the intranet.

What happens next:
- HR will acknowledge your report within 1 working day.
- An investigation will be conducted (typically 2–4 weeks).
- You'll be kept informed of progress where possible.
- Retaliation against anyone who makes a good-faith report is a disciplinary matter.

Your wellbeing matters. Don't hesitate to reach out.`,
  },
  {
    title: "What is the referral scheme — can I refer a friend for a job?",
    type: "HR",
    tags: "referral,recruitment,friend,bonus,vacancy,hiring",
    content: `Yes! The employee referral scheme rewards you for recommending great people to join the company.

How it works:
1. Check the open vacancies on the Careers page (intranet > Careers > Open Roles).
2. Think of someone in your network who'd be a great fit.
3. Ask them to apply through the Careers page and enter your name in the "Referred by" field.
4. Or you can refer them directly: Raise an HR ticket titled "Referral: [Role Name]" and include your contact's name and email. HR will reach out to them.

Referral bonus:
- £1,000 bonus if your referral is hired and completes their 3-month probation.
- Bonus is paid in the payroll following the probation completion date.
- The bonus is subject to income tax and NI as normal pay.

Exclusions:
- You cannot refer someone you directly manage or have direct authority over.
- You cannot refer immediate family members.
- The referred candidate must not have applied in the last 12 months.

Check the current vacancy list on the intranet or raise an HR ticket if you want to discuss a specific referral.`,
  },
  {
    title: "How do I request flexible working (changes to hours or location)?",
    type: "HR",
    tags: "flexible working,hours,part-time,job share,request,contract",
    content: `Any employee who has worked for the company for 26 weeks or more has the legal right to request flexible working.

Types of flexible working you can request:
- Reduced hours (part-time)
- Compressed hours (e.g., 5 days' work in 4 days)
- Job share
- Staggered hours (different start/finish times)
- Fully remote working
- Term-time only working

How to make a formal request:
1. Raise an HR ticket titled "Flexible Working Request."
2. Include: the change you're requesting, proposed start date, how it would affect your work, and how any impact on the team could be managed.
3. HR will acknowledge your request within 2 working days.
4. A meeting will be arranged with your manager and HR within 28 days.
5. A formal decision will be given within 3 months of your request.

The company can only decline a flexible working request for one of 8 business reasons (e.g., inability to recruit cover, impact on quality or performance). The decision must be explained in writing.

You have the right to appeal a rejected request — raise an HR ticket to do so within 1 month of the decision.`,
  },

  // ─── General (10 articles) ────────────────────────────────────────────────
  {
    title: "How do I book a meeting room?",
    type: "general",
    tags: "meeting room,booking,calendar,office,reserve",
    content: `Meeting rooms can be booked through Outlook or the room booking system.

Via Outlook (recommended):
1. Open a new Calendar event and set your meeting time.
2. Click "Add Rooms" (or "Location") in the event details.
3. Type the room name (e.g., "Neptune," "Mars") to search available rooms.
4. The system shows you which rooms are free at that time.
5. Select a room — it will appear as a location and be auto-accepted if available.
6. Send your meeting invite as normal.

Via the Room Booking System (for longer bookings or recurring):
1. Go to rooms.company.com (or via the intranet > Facilities > Room Booking).
2. Select the floor/location and date.
3. Browse available rooms and their capacity/facilities (projector, video conferencing, etc.).
4. Click "Book" and fill in your meeting details.

Tips:
- Book rooms only for the time you actually need them. Cancel promptly if plans change — others are waiting.
- Most rooms have a screen at the door showing the day's bookings.
- Some rooms require catering orders in advance — contact facilities@company.com.

If you need a room for an all-day event or large meeting (20+ people), email facilities@company.com in advance to check availability.`,
  },
  {
    title: "What is the visitor and guest policy at the office?",
    type: "general",
    tags: "visitor,guest,reception,sign in,building access",
    content: `Visitors are welcome but must be registered and accompanied at all times for security reasons.

Before the visit:
1. Register your visitor in advance by emailing reception@company.com with: visitor's full name, company, purpose of visit, and estimated arrival time.
2. Or register via the Visitor Management System on the intranet.

On the day:
- Greet your visitor at reception — they should not be left waiting alone.
- The visitor will sign in at reception and be issued a visitor pass (coloured differently from staff passes).
- Reception will call or message you when your visitor arrives.

During the visit:
- Your visitor must wear their pass visibly at all times.
- Visitors may NOT access server rooms, finance areas, or any area marked "Staff Only."
- You are responsible for your visitor's conduct while on site.

After the visit:
- Ensure your visitor returns their pass at reception and signs out before leaving.
- If a visitor loses their pass, report it to reception immediately.

Contractors/regular visitors:
- Regular contractors have their own access arrangements — contact facilities@company.com to set up long-term access.

Security concerns: If you see an unaccompanied person without a pass, politely ask if they need help and notify reception or security.`,
  },
  {
    title: "What are the company IT security guidelines every employee must follow?",
    type: "general",
    tags: "security,it policy,password,data,guidelines",
    content: `Every employee is responsible for protecting the company's data and systems. These are mandatory requirements, not suggestions.

Passwords:
- Use a unique, strong password for each work account (minimum 12 characters, mix of types).
- Use a password manager (IT-approved ones: LastPass, 1Password).
- Never write passwords down or share them.
- Change your password immediately if you suspect it's been compromised.

Device security:
- Lock your computer when you step away (Windows: Win+L, Mac: Cmd+Ctrl+Q).
- Enable full disk encryption (BitLocker on Windows, FileVault on Mac) — IT can help.
- Never leave your laptop unattended in public places.
- Don't plug in unknown USB drives — they can contain malware.

Data handling:
- Store work files on OneDrive/SharePoint, not locally.
- Never send sensitive data via personal email or messaging apps.
- Follow GDPR rules: don't share personal data unnecessarily.
- Report data breaches immediately to it-security@company.com and raise an urgent IT ticket.

Phishing and social engineering:
- Never click links in unexpected emails — go directly to websites.
- Be suspicious of anyone calling and asking for passwords or system access.
- When in doubt, don't click — forward to it-security@company.com.

Consequences: Violation of IT security policy can result in disciplinary action up to and including dismissal.`,
  },
  {
    title: "How do I book travel and accommodation for a business trip?",
    type: "general",
    tags: "travel,business trip,hotel,flights,booking,expenses",
    content: `All business travel must be booked through the company's approved travel system to be eligible for reimbursement.

Booking process:
1. Get manager approval before booking. Send a brief email outlining: destination, dates, purpose, and estimated cost.
2. Once approved, log into the Travel Portal (intranet > Finance > Travel Booking).
3. Search for flights, trains, or hotels using the portal — it shows company-negotiated rates.
4. Book the most cost-effective option that is practical for the trip.

Booking guidelines:
- Flights: Economy class for trips under 5 hours. Business class requires Director approval.
- Hotels: Use pre-approved hotels where available. Daily limit is £150 per night in UK, £200 internationally.
- Rail: Book in advance (minimum 48 hours) to get the lowest fares. Use standard class.

Per diem (daily allowances):
- UK trips: £25/day for meals and incidentals.
- International trips: Rates vary by country — check the Travel Policy document on the intranet.

Out-of-pocket expenses during travel:
- Keep all receipts and submit via the expense system within 30 days of returning.
- Receipts over £10 are required. No receipt = no reimbursement.

Raise an HR ticket if you need to discuss travel arrangements that fall outside these guidelines.`,
  },
  {
    title: "How do I get a building access pass or report a lost pass?",
    type: "general",
    tags: "access pass,badge,id card,lost,security",
    content: `Your access pass gives you entry to the building and relevant areas based on your role.

Getting your pass (new joiners):
- Your pass is ready at reception on your first day.
- Bring a government-issued photo ID (passport or driving licence) to collect it.
- Your pass is programmed for the areas you need access to. Contact IT or Facilities if you need access to additional areas.

Replacing a damaged or faulty pass:
1. Raise a General ticket titled "Access Pass Replacement."
2. Return your old pass to reception.
3. A new pass will be issued within 1 business day.

Lost or stolen pass:
1. Report it immediately to reception (in person or call ext. 100).
2. Raise an urgent General ticket titled "URGENT: Lost/Stolen Access Pass."
3. Your old pass will be deactivated instantly.
4. A temporary pass will be issued while a permanent replacement is processed (1–2 business days).

Do not lend your pass to anyone — it is tied to your identity and building access log. If someone uses your pass, you are accountable for their access.

Leaving the company: Return your pass to HR on your last day. Unreturned passes may be charged against final salary.`,
  },
  {
    title: "What is the data protection and GDPR policy?",
    type: "general",
    tags: "gdpr,data protection,privacy,personal data,compliance",
    content: `As a company, we handle personal data about employees, customers, and partners. All staff must understand their data protection responsibilities.

What counts as personal data:
- Any information that identifies a living person: name, email, phone number, IP address, location data, medical information, etc.

Your responsibilities:
1. Collect only the data you need — don't gather personal data "just in case."
2. Store it securely — use company systems (OneDrive/SharePoint), not personal devices or USBs.
3. Keep it only as long as necessary — if you no longer need data, delete it properly.
4. Share it only when necessary, only with people who need it, and only via secure channels.
5. Never transfer personal data outside the UK/EU without proper safeguards.

Data subject rights: Individuals have the right to:
- Access their data (Subject Access Request)
- Correct inaccurate data
- Delete their data (in some circumstances)
- Object to processing

If someone makes a data request, forward it to dataprotection@company.com within 24 hours — there are strict deadlines.

Data breaches: If you accidentally share, lose, or expose personal data:
1. Raise an URGENT IT ticket immediately.
2. Email dataprotection@company.com with details.
3. Do not attempt to investigate it yourself.

Violations of GDPR can result in significant fines for the company and disciplinary action for the individual.`,
  },
  {
    title: "How do I set up voicemail on my work phone?",
    type: "general",
    tags: "voicemail,phone,setup,desk phone,extension",
    content: `Setting up voicemail takes less than 5 minutes and ensures you never miss an important message.

Desk phones (IP phones):
1. Press the "Messages" or voicemail button on your desk phone.
2. You'll be prompted to set a PIN (4–8 digits). Choose something memorable but not obvious.
3. Record your greeting: state your name and that you'll call back. Example: "Hi, you've reached [Name] at [Company]. I'm unavailable right now. Please leave your name, number, and a brief message and I'll return your call as soon as possible."
4. Press # to save.

To retrieve messages:
- Press the Messages button.
- Enter your PIN.
- Follow the prompts to listen, save, or delete messages.

Mobile/softphone (Microsoft Teams):
1. In Teams, go to Calls > Voicemail.
2. Click "Configure Voicemail."
3. You can set up a text greeting or record an audio message.
4. Voicemails appear in your Teams Calls tab and can also be forwarded to email.

Tips:
- Check voicemail daily.
- Update your greeting when you're on leave to indicate when you'll return.
- Set a different out-of-office greeting before going on holiday.

Raise an IT ticket if you're having trouble setting up or accessing voicemail.`,
  },
  {
    title: "How do I order office supplies?",
    type: "general",
    tags: "office supplies,stationery,order,procurement,request",
    content: `Office supplies are managed by the Facilities team. There are two ways to request them:

For standard supplies (pens, paper, folders, printer cartridges, etc.):
1. Check the supplies cupboard on your floor first — many items are kept in stock.
2. If something is running low or out of stock, email facilities@company.com with: item name, quantity needed, and your floor/department.
3. Standard items are restocked within 2 business days.

For non-standard or larger requests:
1. Raise a General ticket titled "Office Supply Request."
2. Include: item description, quantity, and business justification.
3. Requests over £50 require manager approval (include manager's name in the ticket).
4. Delivery is typically within 5–7 business days depending on the supplier.

Desk equipment (ergonomic items, headsets, etc.):
- These are IT/HR requests, not standard office supplies.
- Raise an IT ticket for equipment requests.

Printer paper: Stored in the printer rooms on each floor. If running low, email facilities@company.com.

Company purchasing cards: Only designated budget holders have purchasing authority. Do not purchase office supplies yourself and claim expenses — this is against procurement policy (unless pre-approved in writing by your manager and Facilities).`,
  },
  {
    title: "What should I do on my first day? — New Employee Checklist",
    type: "general",
    tags: "new joiner,onboarding,first day,induction,checklist",
    content: `Welcome to the company! Here's everything you need to do in your first week.

Day 1 morning:
- Arrive at reception and ask for your manager.
- Collect your access pass (bring photo ID).
- You'll be taken to your desk and introduced to your immediate team.
- Your laptop will be set up waiting for you.

First day setup checklist:
✓ Log into your computer with the credentials emailed to your personal email before you started.
✓ Change your password on first login.
✓ Set up Microsoft Authenticator for 2FA (IT will guide you).
✓ Set up Microsoft Outlook with your company email.
✓ Log into Microsoft Teams — join your team channel.
✓ Review and sign your employee contract (HR will send a DocuSign link).
✓ Complete mandatory online training modules (Data Protection, IT Security, Health & Safety) — found in the Training Portal.

First week:
- Meet with HR to complete your onboarding paperwork (payroll details, right to work check).
- Have a 1-on-1 with your manager to understand your role and initial goals.
- Book intro calls with key colleagues and stakeholders.
- Explore the intranet — it has everything from policies to the menu in the canteen.

IT setup issues: Raise an IT ticket. For HR paperwork: raise an HR ticket.

Don't hesitate to ask questions — everyone was new once!`,
  },
  {
    title: "How do I access and use the company intranet?",
    type: "general",
    tags: "intranet,portal,company,resources,information",
    content: `The company intranet is the central hub for all internal information, tools, and resources.

Accessing the intranet:
- URL: intranet.company.com
- Log in with your company Single Sign-On (SSO) — same credentials as your computer login.
- Works on company-managed devices automatically.
- Accessible from home with SSO login (no VPN needed for the intranet itself).

What you'll find on the intranet:
- HR Portal: Leave booking, payslips, personal details, expense claims.
- IT Portal: Software downloads, hardware requests, password reset.
- Company Policies: HR policies, IT security, expenses, travel.
- Room Booking: Book meeting rooms company-wide.
- News & Announcements: Latest company news, events, and updates.
- People Directory: Find any colleague's contact details, role, and team.
- Training Portal: Mandatory and optional training modules.
- Benefits Portal: Healthcare, pension, gym discounts, and other perks.

Can't find something? Use the search bar at the top of the intranet — it indexes all pages and documents.

Access issues:
- If a page shows "Access Denied," raise an IT ticket requesting access to that intranet section.
- If you're on a personal device and can't log in, try accessing via the company VPN first.

The intranet is updated regularly. Check the "What's New" section on the homepage weekly.`,
  },
];

async function main() {
  console.log("🗂️  KB Seed — clearing existing articles...");

  // Delete existing KB articles
  const deleted = await prisma.kbArticle.deleteMany();
  console.log(`   Deleted ${deleted.count} existing articles.`);

  // Find an admin user to attribute authorship
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin", active: true },
    select: { id: true, name: true },
  });

  if (!adminUser) {
    console.error("❌ No admin user found. Run the main seed first: npm run seed");
    process.exit(1);
  }

  console.log(`   Using admin: ${adminUser.name} (${adminUser.id})`);
  console.log(`\n📝 Seeding ${FAQ_ARTICLES.length} FAQ articles...\n`);

  let created = 0;
  for (const article of FAQ_ARTICLES) {
    await prisma.kbArticle.create({
      data: {
        title: article.title,
        content: article.content.trim(),
        type: article.type,
        tags: article.tags,
        published: true,
        authorId: adminUser.id,
        views: Math.floor(Math.random() * 80) + 5, // seed with realistic view counts
      },
    });
    created++;
    console.log(`   ✅ [${article.type}] ${article.title}`);
  }

  console.log(`\n✅ KB seeded with ${created} articles.`);
  console.log(`   IT: ${FAQ_ARTICLES.filter((a) => a.type === "IT").length} articles`);
  console.log(`   HR: ${FAQ_ARTICLES.filter((a) => a.type === "HR").length} articles`);
  console.log(`   General: ${FAQ_ARTICLES.filter((a) => a.type === "general").length} articles`);
}

main()
  .catch((e) => {
    console.error("❌ KB seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
