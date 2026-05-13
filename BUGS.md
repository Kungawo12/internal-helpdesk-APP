# 🐛 Bug Finder Report

> **Generated:** Tuesday, 12 May 2026 at 14:49 UTC
> **Files Scanned:** 71
> **Scan Duration:** 157s
> **Models Used:** GPT-4o (critical files) + GPT-4o-mini (all other files)

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 19 |
| 🟡 Medium | 2 |
| 🟢 Low | 0 |
| **Total** | **21** |

> **Instructions for Tenzin & Senior Engineer:**
> Review each issue below. Mark resolved ones with ~~strikethrough~~ or delete the entry.
> Do NOT auto-fix — each fix must be verified and approved before implementation.

---

## 🟠 High Severity (19)

### 1. 🟠 Authorization Bypass for Ticket Access

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/route.ts` |
| **Line** | 19-52 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The current implementation allows users to access tickets based on their role without verifying if they have the right to view specific tickets. For example, an "it_staff" can view all IT and Software tickets, and an "hr_staff" can view all HR tickets, regardless of whether they should have access to those specific tickets. This could lead to unauthorized access to sensitive information.

**Fix:** Implement a more granular access control mechanism that checks if the user should have access to each specific ticket, possibly by adding additional checks on ticket ownership or department membership.

---
### 2. 🟠 Potential SQL Injection via Unvalidated Input

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/route.ts` |
| **Line** | 11-13 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The `id` parameter is directly used in the Prisma query without validation or sanitization. Although Prisma ORM generally protects against SQL injection, it is a good practice to validate and sanitize inputs to prevent any unexpected behavior or vulnerabilities that might arise from future changes or bugs in the ORM.

**Fix:** Implement input validation to ensure that `id` is a valid UUID or integer, depending on your database schema. This can be done using a validation library or custom logic to check the format before using it in the query.

---
### 3. 🟠 Missing input validation for ticket ID

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/resolve/route.ts` |
| **Line** | 10-12 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The ticket ID is extracted from the URL parameters without any validation. This could allow an attacker to manipulate the ID and potentially access or modify tickets they should not have access to. This is particularly concerning if the ID format is predictable or if there are no additional checks to ensure the user is authorized to access the specific ticket.

**Fix:** Validate the ticket ID format before using it in the database query. Ensure that the user is authorized to access the ticket by checking their permissions against the ticket's ownership or assigned staff.

---
### 4. 🟠 Missing Input Validation on Ticket ID and Assignee ID

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/assign/route.ts` |
| **Line** | 13-16, 18 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The `ticketId` and `assigneeId` are directly used in database queries without validation. This can lead to potential SQL injection-like attacks if the Prisma ORM is not properly handling malicious inputs. Additionally, if `ticketId` or `assigneeId` are not valid UUIDs, the database queries could fail or behave unexpectedly.

**Fix:** Validate `ticketId` and `assigneeId` to ensure they are valid UUIDs before using them in database queries. This can be done using a library like `validator` to check the format of the IDs.

---
### 5. 🟠 Missing Authorization Check for Ticket Access

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/comments/route.ts` |
| **Line** | 10-12, 43-45 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The current implementation does not verify if the user has permission to access the specified ticket. This allows any authenticated user to view or comment on any ticket's comments, potentially exposing sensitive information or allowing unauthorized actions. The `GET` and `POST` methods should ensure that the user is either the creator of the ticket or has a role that permits access to the ticket.

**Fix:** Implement a check to verify that the user is authorized to access the ticket by confirming they are the ticket's creator or have an appropriate role. This can be done by querying the ticket's creator and comparing it with the session user ID or checking the user's role.

---
### 6. 🟠 Missing Input Validation for User ID

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/admin-portal/users/[id]/route.ts` |
| **Line** | 9, 36 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The `id` parameter extracted from `params` is used directly in database queries without validation. This could lead to potential SQL injection-like attacks if the Prisma client is not properly configured to handle such cases. Although Prisma generally protects against SQL injection, it's a good practice to validate and sanitize input to prevent any unexpected behavior or future vulnerabilities.

**Fix:** Implement input validation to ensure that the `id` is a valid UUID or matches the expected format for user IDs before using it in database operations.

---
### 7. 🟠 Lack of Authorization Check on Ticket Access

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/ai/copilot/route.ts` |
| **Line** | 14-28 |
| **Scan Type** | Deep (GPT-4o) |

**Description:** The current implementation allows any staff member to access any ticket details without verifying if they are authorized to view that specific ticket. This could lead to unauthorized access to sensitive ticket information by staff members who should not have access to certain tickets, violating privacy and confidentiality policies.

**Fix:** Implement a check to ensure that the staff member accessing the ticket has the necessary permissions. This could involve checking if the staff member is the creator, assignee, or has explicit permission to view the ticket.

---
### 8. 🟠 Incomplete Promise Handling

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/admin/stats/route.ts` |
| **Line** | 47 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `Promise.all` call for fetching ticket counts is incomplete, as it is cut off at the `count` method for "priority". This results in a syntax error and prevents the function from executing properly, leading to a failure in retrieving statistics.

**Fix:** Complete the `Promise.all` call by adding the missing ticket count queries for the remaining priorities and ensure the function compiles correctly.

---
### 9. 🟠 Incomplete code in analytics route

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/admin-portal/analytics/route.ts` |
| **Line** | 64 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The code appears to be incomplete, as it ends abruptly with a variable declaration (`const b`) without any further logic or return statement. This will lead to a syntax error and prevent the function from executing properly.

**Fix:** Complete the logic for calculating the SLA breach rate and ensure the function returns a valid response.

---
### 10. 🟠 Incomplete Error Handling in PATCH

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/admin-portal/sla-policies/[id]/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The PATCH function has an incomplete error handling section where it checks for conflicts in SLA policies. The error message is cut off, which can lead to confusion and lack of clarity for the API user when a conflict occurs.

**Fix:** Complete the error message string to provide a full explanation of the conflict, ensuring it conveys the necessary information to the user.

---
### 11. 🟠 Potential SQL Injection in DELETE Route

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/admin-portal/tickets/[id]/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `id` parameter used in the `prisma.ticket.delete` method is directly taken from the request parameters without validation or sanitization. This could lead to SQL injection attacks if an attacker crafts a malicious `id` value.

**Fix:** Validate and sanitize the `id` parameter before using it in the database query, ensuring it conforms to expected formats (e.g., UUID).

---
### 12. 🟠 Missing date initialization in SLA check

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `slaResolutionDue` query for at-risk tickets is incomplete and lacks a proper date initialization, which will lead to a runtime error. This can prevent the function from executing correctly and may cause the application to fail silently.

**Fix:** Ensure the `new Date()` constructor is called correctly to create a valid date object for the `slaResolutionDue` check.

---
### 13. 🟠 Incomplete Code

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/reports/summary/route.ts` |
| **Line** | 50 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The function `GET` is incomplete and lacks a return statement for the final response. This will lead to a runtime error when the function is called, as it does not return a valid response object.

**Fix:** Complete the function by adding a return statement that sends the constructed response object, including the calculated metrics.

---
### 14. 🟠 Incomplete error handling in POST request

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/ticket-templates/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The catch block in the POST function is incomplete and does not return a response when an error occurs. This can lead to unhandled promise rejections and the client not receiving any feedback about the failure.

**Fix:** Complete the catch block by returning a response similar to the one in the GET function, e.g., `return Response.json({ error: "Failed to create template" }, { status: 500 });`.

---
### 15. 🟠 Potential Denial of Service via Unhandled Promise Rejections

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/escalate/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The code contains multiple asynchronous operations (e.g., logging and notifying) that do not handle promise rejections properly. If any of these promises fail, it could lead to unhandled promise rejections, potentially crashing the server or causing unexpected behavior.

**Fix:** Use `await` for the asynchronous calls or handle the promise rejections properly with `.catch()` to ensure that errors are logged and do not go unhandled.

---
### 16. 🟠 Potential XSS vulnerability in file upload

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 60-70 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `addFiles` function allows users to upload files without validating their content. If a malicious user uploads a file containing executable scripts or harmful content, it could lead to XSS attacks when the file is processed or displayed. This could compromise the security of the application and its users.

**Fix:** Implement file type validation and sanitization to ensure that only safe file types are accepted and that any content is properly escaped before rendering.

---
### 17. 🟠 Missing error handling for fetch requests

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/manager/page.tsx` |
| **Line** | 20-30 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The fetch requests for staff, workload, and report data do not handle errors. If any of these requests fail, the application will not provide feedback to the user or handle the error gracefully, potentially leading to a poor user experience.

**Fix:** Add error handling for each fetch request using `.catch()` or a `try-catch` block to manage errors and provide user feedback.

---
### 18. 🟠 Incomplete Error Handling in API Calls

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 40-41 |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The error handling for the API call in the `ProfilePage` component does not account for the case where the response is not OK, potentially leading to an unhandled error state. This could expose sensitive information or lead to a poor user experience.

**Fix:** Ensure that the error handling logic captures all potential errors and provides a user-friendly message without exposing sensitive data.

---
### 19. 🟠 Incomplete API Call

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `fetchAttachments` function is incomplete and does not have a closing statement or error handling. This can lead to runtime errors and unhandled promise rejections when trying to fetch attachments.

**Fix:** Complete the `fetchAttachments` function by adding the necessary logic to handle the response and errors, and ensure it is properly invoked in the component.

---
## 🟡 Medium Severity (2)

### 1. 🟡 Missing validation for `condUnassigned`

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/automation-rules/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `condUnassigned` field is accepted without validation, which could lead to unexpected values being stored in the database. This could potentially cause issues when the data is used in automation rules.

**Fix:** Add validation to ensure `condUnassigned` is a boolean value before processing it.

---
### 2. 🟡 Inconsistent Response Object Usage

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/staff/workload/route.ts` |
| **Line** | unknown |
| **Scan Type** | Fast (GPT-4o-mini) |

**Description:** The `Response` object is used instead of `NextResponse` in the workload API, which may lead to unexpected behavior in Next.js applications. This inconsistency can cause issues with response handling and middleware integration.

**Fix:** Replace `Response.json` with `NextResponse.json` to maintain consistency with the Next.js framework.

---

---
*Report generated by Bug Finder — run `npm run bug-finder` to refresh.*

---

## 🔍 Watchdog Scan — 12 May 2026, 14:53 UTC
> **Triggered by change in:** `src/app/api/public/stats/route.ts`

### 1. 🟡 Potential Date Handling Issue

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/public/stats/route.ts` |
| **Line** | 20-21 |

**Description:** The calculation of average resolution time relies on the assumption that `updatedAt` and `createdAt` are valid Date objects. If either of these fields is null or undefined, it will lead to a runtime error when calling `getTime()`. This could result in the API returning an error instead of a valid response.

**Fix:** Ensure that both `updatedAt` and `createdAt` are valid Date objects before performing calculations. You can add a check to skip any tickets that do not have these fields set.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:53 UTC
> **Triggered by change in:** `src/app/api/tickets/route.ts`

### 1. 🟠 Authorization bypass for ticket access

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/route.ts` |
| **Line** | 18-53 |

**Description:** The current implementation allows users to access tickets based on their role but does not verify if the user is authorized to view specific tickets. For example, an "it_staff" member can access all IT and Software tickets, regardless of whether they should have access to specific tickets. This could lead to unauthorized access to sensitive ticket information.

**Fix:** Implement additional checks to ensure that users can only access tickets they are authorized to view. For instance, verify that "it_staff" members can only access tickets assigned to them or their department, and ensure that "hr_staff" can only access HR tickets they are authorized to view.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:53 UTC
> **Triggered by change in:** `src/app/dashboard/create/page.tsx`

### 1. 🔴 Incomplete Ticket Submission Logic

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 1-60 (incomplete code) |

**Description:** The `handleSubmit` function is incomplete, which means that the ticket submission logic is not fully implemented. This could lead to the application failing to create tickets, leaving users unable to submit their requests. Additionally, any error handling or user feedback mechanisms for the submission process are likely missing.

**Fix:** Complete the `handleSubmit` function by implementing the ticket creation logic and ensure that appropriate error handling and user feedback are included.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/dashboard/layout.tsx`

### 1. 🟠 Missing error handling for fetch requests

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/layout.tsx` |
| **Line** | 12-13 |

**Description:** The fetchNotifications function does not handle errors when the fetch request fails. If the API endpoint is down or returns an error, the application will not inform the user or handle the state appropriately, which could lead to a poor user experience.

**Fix:** Add error handling to the fetchNotifications function to catch any errors during the fetch and update the state or notify the user accordingly.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🔴 Insecure API Endpoint Usage

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 45-46 |

**Description:** The application directly uses user input (ticket IDs) in the API endpoint without any validation or sanitization. This could lead to security vulnerabilities such as SQL injection or unauthorized access if the API is not properly secured.

**Fix:** Implement input validation and sanitization for the ticket IDs before using them in the API calls. Additionally, ensure that the API has proper authentication and authorization checks in place.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🟠 Incomplete function definition

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 1-40 (incomplete function) |

**Description:** The `handlePostComment` function is incomplete and ends abruptly, which will lead to a syntax error when the code is executed. This will prevent the component from functioning properly, especially the comment posting feature.

**Fix:** Complete the `handlePostComment` function by ensuring it properly handles the final logic, including setting `isPostingComment` to false and any necessary cleanup or state updates.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/api/public/stats/route.ts`

### 1. 🟠 Missing error handling for database operations

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/public/stats/route.ts` |
| **Line** | 12-22 |

**Description:** The code does not handle potential errors that may arise from database operations, such as connection issues or query failures. If any of the `prisma` calls fail, the catch block will execute, but it will not provide any information about the error, making debugging difficult.

**Fix:** Implement specific error handling for each database operation to log or return meaningful error messages, which can help in diagnosing issues when they occur.

---
### 2. 🟡 Potential incorrect calculation of average resolution time

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/public/stats/route.ts` |
| **Line** | 17-20 |

**Description:** The calculation of average resolution time assumes that `updatedAt` is equivalent to `resolvedAt`, which may not always be true. If the `updatedAt` field is updated for reasons other than resolution, the average resolution time could be skewed.

**Fix:** Consider adding a separate field for resolution time or ensure that the logic accurately reflects the resolution process, possibly by checking for a specific status change or event.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/api/tickets/route.ts`

### 1. 🟠 Authorization Bypass for Ticket Access

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/route.ts` |
| **Line** | 19-52 |

**Description:** The current implementation allows users with the role "it_staff" or "hr_staff" to access tickets based on type without verifying if they should have access to specific tickets. This could lead to unauthorized access to sensitive ticket information that should be restricted to certain users or departments.

**Fix:** Implement additional checks to ensure that users can only access tickets they are authorized to view, potentially by checking against department or team membership or by adding more granular access control rules.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:54 UTC
> **Triggered by change in:** `src/app/dashboard/create/page.tsx`

### 1. 🔴 Incomplete ticket creation logic

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 1-1 |

**Description:** The `handleSubmit` function is incomplete and does not include the logic for creating a ticket after the fetch call. This can lead to the form not functioning as intended, resulting in user frustration and potential data loss.

**Fix:** Complete the `handleSubmit` function by adding the logic to handle the response from the ticket creation API and any subsequent actions, such as redirecting the user or displaying success/error messages.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:55 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential Null Reference on Session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 27 |

**Description:** The code accesses `session.user.role` without checking if `session` or `session.user` is null or undefined. If the session is not available, this will throw a runtime error, potentially breaking the application for users who are not authenticated.

**Fix:** Add a check to ensure `session` and `session.user` are defined before accessing `role`. For example, use optional chaining: `const role = session?.user?.role || "guest";`.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:55 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🟠 Incomplete JSX rendering

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 1-50 |

**Description:** The JSX rendering is incomplete, as the return statement is cut off, which will lead to a syntax error when the component is rendered. This can cause the entire page to fail to load, resulting in a poor user experience.

**Fix:** Ensure that the return statement is completed with the necessary JSX elements, including any closing tags and additional content that should be rendered.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:55 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🔴 Incomplete function implementation

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 109-110 |

**Description:** The `handlePostComment` function is incomplete and ends abruptly without closing the function. This will lead to a syntax error and prevent the component from rendering properly. The application will crash when trying to execute this function.

**Fix:** Complete the `handlePostComment` function by ensuring it has a proper closing brace and any necessary logic to reset the state after posting a comment.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:55 UTC
> **Triggered by change in:** `src/components/landing/PeopleMarquee.tsx`

### 1. 🟠 Incomplete JSX in Detail Card

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/components/landing/PeopleMarquee.tsx` |
| **Line** | 60-61 |

**Description:** The JSX for the Detail Card (Back) is incomplete, which will lead to a syntax error during compilation. This will prevent the component from rendering correctly, resulting in a broken UI.

**Fix:** Complete the JSX structure for the Detail Card by ensuring all elements are properly closed and the component returns a valid JSX structure.

---

---

## 🔍 Watchdog Scan — 12 May 2026, 14:55 UTC
> **Triggered by change in:** `src/components/tickets/AiCopilotPanel.tsx`

### 1. 🟠 Improper role check logic

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/components/tickets/AiCopilotPanel.tsx` |
| **Line** | 15 |

**Description:** The role check logic incorrectly evaluates the condition for user roles. The current condition checks if the role is not equal to "it_staff", "hr_staff", and "admin" separately, which will always return true for any role that is not "admin". This means that users with "it_staff" or "hr_staff" roles will not be able to access the component.

**Fix:** Change the condition to use logical OR (`||`) correctly by checking if the role is equal to any of the allowed roles: `if (role !== "it_staff" && role !== "hr_staff" && role !== "admin")`. Alternatively, use an array to check if the role is included in the allowed roles.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:03 UTC
> **Triggered by change in:** `src/app/dashboard/layout.tsx`

### 1. 🟠 Insecure API Fetch

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/layout.tsx` |
| **Line** | 10-11 |

**Description:** The fetch call to "/api/notifications" does not include any authentication or authorization checks, which could allow unauthorized users to access notification data. This could lead to sensitive information exposure if the notifications contain private user data.

**Fix:** Ensure that the API endpoint checks for user authentication and authorization before returning notification data. Use server-side session validation to restrict access.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:03 UTC
> **Triggered by change in:** `src/app/dashboard/layout.tsx`

### 1. 🟠 Insecure API Fetch

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/layout.tsx` |
| **Line** | 10-11 |

**Description:** The `fetchNotifications` function makes a call to the `/api/notifications` endpoint without any authentication or authorization checks. This could allow unauthorized users to access notification data, leading to potential data leaks or exposure of sensitive information.

**Fix:** Ensure that the API endpoint is secured by implementing authentication checks on the server-side and returning appropriate error responses for unauthorized access.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:04 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential null reference on session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 32 |

**Description:** The code accesses `session.user.role` without checking if `session` or `session.user` is null or undefined. If the session is not available, this will lead to a runtime error and crash the component.

**Fix:** Add a null check for `session` and `session.user` before accessing `role`, or provide a fallback value to prevent the error.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:04 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential null reference for session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 26 |

**Description:** The code assumes that `session` will always be defined when accessing `session.user.role`. If the session is null or undefined, this will lead to a runtime error. This can happen if the user is not authenticated or if there is an issue with the session retrieval.

**Fix:** Add a check to ensure `session` is defined before accessing `session.user.role`. You can use optional chaining (e.g., `session?.user?.role`) or a conditional statement to handle the case when the session is not available.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:05 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🟠 Incomplete code causing potential runtime error

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 1-40 |

**Description:** The code snippet is incomplete, cutting off in the middle of the JSX return statement. This can lead to a runtime error when the component is rendered, as it does not return valid JSX. The incomplete code can cause the application to crash or behave unexpectedly.

**Fix:** Ensure that the entire component is properly defined and that the return statement is complete, including all necessary JSX elements and closing tags.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:05 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🟠 Insecure API Call

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 46-48 |

**Description:** The `handleBulkClose` function makes a PATCH request to the API without any authentication or authorization checks. This could allow unauthorized users to close tickets, leading to potential data integrity issues and abuse of the system.

**Fix:** Implement authentication and authorization checks on the server-side API endpoint to ensure that only authorized users can perform actions like closing tickets.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:06 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🔴 Insecure API endpoint usage

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 49-50 |

**Description:** The application directly uses the `fetch` API to call an endpoint for resolving tickets without any authentication or authorization checks. This could allow unauthorized users to manipulate ticket statuses, leading to potential data integrity issues and abuse of the system.

**Fix:** Implement authentication and authorization checks on the API endpoints to ensure that only authorized users can perform actions like resolving tickets. Additionally, consider using a library for handling API requests that includes these security measures.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:07 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🟠 Incomplete function definition

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 107-108 |

**Description:** The `handlePostComment` function is incomplete and does not properly handle the case when the response is not okay. This can lead to unhandled errors and a poor user experience when posting comments fails.

**Fix:** Complete the `handlePostComment` function by adding error handling for the case when `res.ok` is false, and ensure to reset the `isPostingComment` state in the `finally` block.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:07 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🟠 Missing error handling for fetch requests

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 53-54, 78-79, 92-93 |

**Description:** The fetch requests for attachments, comments, and audit logs do not handle errors properly. If the fetch fails (e.g., network issues, server errors), the application will not inform the user or take any corrective action, leading to a poor user experience.

**Fix:** Implement error handling for each fetch request by updating the state to reflect the error and displaying an appropriate message to the user.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:08 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🟠 Incomplete API request handling

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 1-60 |

**Description:** The `handlePostComment` function is incomplete, which means that if a user attempts to post a comment, the request will not be sent, and the application will not handle the response or any potential errors. This can lead to a poor user experience and confusion, as users may think their comment was submitted when it was not.

**Fix:** Complete the `handlePostComment` function by adding the necessary logic to handle the API request and response, including error handling and updating the state accordingly.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:10 UTC
> **Triggered by change in:** `src/app/dashboard/create/page.tsx`

### 1. 🔴 Incomplete ticket creation logic

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 83-85 |

**Description:** The `handleSubmit` function is incomplete and does not include the logic to handle the ticket creation process fully. This can lead to the application failing silently without creating a ticket when the form is submitted.

**Fix:** Complete the `handleSubmit` function by ensuring that the ticket creation logic is fully implemented, including handling the response and potential errors from the API call.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:11 UTC
> **Triggered by change in:** `src/app/dashboard/create/page.tsx`

### 1. 🟠 Incomplete error handling in file upload

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 83-84 |

**Description:** The `addFiles` function does not handle errors that may occur during the file reading process. If the FileReader encounters an error, the user will not be notified, which can lead to confusion about whether the file was uploaded successfully or not.

**Fix:** Implement error handling in the FileReader's `onerror` event to set an error state that can be displayed to the user.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:12 UTC
> **Triggered by change in:** `src/app/dashboard/kb/page.tsx`

### 1. 🟠 Missing error handling for article fetch

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 51-52 |

**Description:** The `fetchArticleDetail` function does not handle the case where the fetch request fails (i.e., `res.ok` is false). If the fetch fails, `selectedArticle` will remain null, and the user will not receive any feedback about the error, potentially leading to confusion.

**Fix:** Add error handling logic to notify the user or log the error when the fetch fails, similar to how it's done in the `fetchArticles` function.

---
### 2. 🟡 Potential for infinite loop in useEffect

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 36-37 |

**Description:** The `useEffect` that fetches articles does not include `page` in its dependency array. If `page` is updated elsewhere in the component, the articles will not be fetched again, potentially leading to stale data being displayed.

**Fix:** Include `page` in the dependency array of the `useEffect` that calls `fetchArticles` to ensure articles are fetched whenever the page changes.

---
### 3. 🟡 Incorrect type handling for filterType

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 10 |

**Description:** The `filterType` state is initialized as a string with the value "All", but it is later used in a conditional check against specific string literals ("IT", "HR", "general"). This could lead to unexpected behavior if the filterType is set to an unsupported value.

**Fix:** Change the type of `filterType` to a union type that includes "All" along with the other types, or handle the unsupported value case explicitly in the logic.

---
### 4. 🟢 Missing key prop in mapped elements

| Field | Value |
|-------|-------|
| **Severity** | `LOW` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 75 |

**Description:** When mapping over `selectedArticle.tags`, the key prop is set to `tag`, which may not be unique if tags can have the same name. This can lead to rendering issues and performance problems in React.

**Fix:** Use a unique identifier for the key prop, such as the index of the tag in the array or a combination of the tag name and its index.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:13 UTC
> **Triggered by change in:** `src/app/page.tsx`

### 1. 🟠 Incomplete CSS class name

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/page.tsx` |
| **Line** | 82 |

**Description:** The CSS class name for the button in the navbar is incomplete, ending with 'dark:bord' which likely should be 'dark:border'. This will cause a runtime error as the class name is not valid, leading to potential layout issues or styling not being applied correctly.

**Fix:** Complete the class name by changing 'dark:bord' to 'dark:border' to ensure the button styles are applied correctly.

---
### 2. 🟡 Missing error handling for fetch

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/page.tsx` |
| **Line** | 50-54 |

**Description:** The fetch call to the API does not handle cases where the response is not successful (e.g., 404 or 500 errors). This could lead to the application using stale fallback data without informing the user of the issue.

**Fix:** Add a check for the response status before calling `r.json()`, and handle errors appropriately, possibly by updating the UI to inform the user that the data could not be fetched.

---
### 3. 🟡 Potential memory leak with setInterval

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/page.tsx` |
| **Line** | 66-69 |

**Description:** The `setInterval` function is set up to change the active card every 3 seconds, but if the component unmounts before the interval is cleared, it could lead to a memory leak or unexpected behavior.

**Fix:** Ensure that the interval is cleared in the cleanup function of the `useEffect` to prevent any potential memory leaks.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:15 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential Null Reference on Session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 28 |

**Description:** The code accesses `session.user.role` without checking if `session` or `session.user` is null or undefined. If the user is not authenticated, this could lead to a runtime error when trying to access `role`, causing the application to crash.

**Fix:** Add a null check for `session` and `session.user` before accessing `role`, or provide a fallback value to ensure the application does not crash.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:16 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential Null Reference on Session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 26 |

**Description:** The code accesses `session.user.role` without checking if `session` or `session.user` is null or undefined. If the user is not authenticated, this will lead to a runtime error, causing the application to crash.

**Fix:** Add a null check for `session` and `session.user` before accessing `role`, or provide a fallback value to prevent the application from crashing.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:27 UTC
> **Triggered by change in:** `src/app/dashboard/ticket/[id]/page.tsx`

### 1. 🟠 Incomplete function definition

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/ticket/[id]/page.tsx` |
| **Line** | 83 |

**Description:** The function `handleStatusChange` is defined but not fully implemented, leading to potential runtime errors if this function is called. This can cause the application to crash or behave unexpectedly when attempting to change the status of a ticket.

**Fix:** Complete the implementation of the `handleStatusChange` function to ensure it handles status changes correctly, or remove the function if it is not needed.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:27 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential Null Reference on Session

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 10-11 |

**Description:** The code accesses `session.user.role` and `session.user.name` without checking if `session` or `session.user` is null or undefined. If the session is not available, this will lead to a runtime error, causing the application to crash.

**Fix:** Add a null check for `session` and `session.user` before accessing their properties, or provide a fallback value to prevent the application from crashing.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:27 UTC
> **Triggered by change in:** `src/app/dashboard/staff/page.tsx`

### 1. 🔴 Insecure API Endpoint Usage

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/staff/page.tsx` |
| **Line** | 30-31 |

**Description:** The application uses the `fetch` API to send requests to the `/api/tickets/${id}/resolve` endpoint without any authentication or authorization checks. This could allow unauthorized users to manipulate ticket statuses, leading to potential data integrity issues and unauthorized access to sensitive information.

**Fix:** Implement authentication and authorization checks on the API endpoint to ensure that only authorized users can perform actions like resolving tickets.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:27 UTC
> **Triggered by change in:** `src/app/api/tickets/[id]/comments/route.ts`

### 1. 🟠 Potential CSRF vulnerability in comment posting

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/comments/route.ts` |
| **Line** | 58-59 |

**Description:** The POST endpoint for adding comments does not include any CSRF protection mechanisms. This could allow an attacker to trick an authenticated user into making unwanted requests to this endpoint, potentially posting comments without the user's consent. This is especially concerning for actions that can be performed by users with elevated privileges, such as staff or admins.

**Fix:** Implement CSRF protection by including a CSRF token in the request headers and validating it on the server side before processing the request.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:28 UTC
> **Triggered by change in:** `src/app/dashboard/create/page.tsx`

### 1. 🔴 Incomplete handleSubmit function

| Field | Value |
|-------|-------|
| **Severity** | `CRITICAL` |
| **File** | `src/app/dashboard/create/page.tsx` |
| **Line** | 83-84 |

**Description:** The handleSubmit function is incomplete and does not include any logic for processing the form submission, such as validating inputs, sending data to an API, or handling responses. This could lead to the form being submitted without any action taken, resulting in a poor user experience.

**Fix:** Complete the handleSubmit function by adding logic to validate the form data, send it to the appropriate API endpoint, and handle the response or any errors that may occur.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:28 UTC
> **Triggered by change in:** `src/app/api/tickets/[id]/assign/route.ts`

### 1. 🟠 Authorization bypass via role check

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/tickets/[id]/assign/route.ts` |
| **Line** | 13-17 |

**Description:** The current role check only verifies if the user is an "admin". This allows any user with the "admin" role to assign tickets, potentially bypassing more granular permission checks. If the "admin" role is too broad or misconfigured, unauthorized users could exploit this to assign tickets inappropriately.

**Fix:** Implement a more granular permission check that verifies if the user has specific permissions to assign tickets, possibly by checking against a list of allowed actions for the user's role.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:28 UTC
> **Triggered by change in:** `src/app/dashboard/page.tsx`

### 1. 🟠 Potential session data access issue

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/page.tsx` |
| **Line** | 10-11 |

**Description:** The code accesses `session?.user?.role` without checking if `session` is defined. If the session is null or undefined (e.g., user is not authenticated), this could lead to unexpected behavior or errors when trying to access `role`.

**Fix:** Add a check to ensure `session` is defined before accessing `session.user.role`, or provide a fallback value.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:28 UTC
> **Triggered by change in:** `src/app/api/cron/sla-check/route.ts`

### 1. 🟠 Missing error handling for email sending

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | 83-84 |

**Description:** The `sendSlaBreachEmail` function does not handle errors when sending emails. If an error occurs during the email sending process, it will be silently ignored, which can lead to undetected failures in notifying managers about SLA breaches.

**Fix:** Implement error handling within the `sendSlaBreachEmail` function to log or handle errors appropriately, ensuring that any issues with sending emails are reported or retried.

---
### 2. 🟡 Potential exposure of sensitive information in logs

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | 60-61 |

**Description:** The `logAudit` function is called with sensitive information such as ticket IDs and actions. If the audit logs are not properly secured, this could lead to exposure of sensitive information to unauthorized users.

**Fix:** Ensure that the audit logs are secured and access-controlled, and consider redacting sensitive information before logging, if necessary.

---
### 3. 🟡 Inefficient database queries for already notified tickets

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | 54-55 |

**Description:** The code checks for already notified tickets by querying the database for each at-risk ticket individually. This can lead to performance issues due to multiple database calls, especially if there are many at-risk tickets.

**Fix:** Optimize the query by fetching all relevant audit logs in a single query before the loop, and then checking against that list to determine if notifications should be sent.

---
### 4. 🟡 Lack of validation for CRON_SECRET

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | 7-8 |

**Description:** The code checks for the presence of the `CRON_SECRET` in the request headers but does not validate if the environment variable is set. If `CRON_SECRET` is undefined, the authorization check will always fail, potentially leading to confusion during debugging.

**Fix:** Add a validation step to ensure that `process.env.CRON_SECRET` is defined before performing the authorization check, and log an error if it is not set.

---
### 5. 🟠 Potential race condition in updating tickets

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/api/cron/sla-check/route.ts` |
| **Line** | 30-31 |

**Description:** The code updates the `slaBreached` status for tickets that have breached SLA resolution time without ensuring that no other process is updating the same tickets concurrently. This could lead to inconsistent states if multiple instances of this function run simultaneously.

**Fix:** Implement a locking mechanism or use database transactions to ensure that updates to the same tickets are handled safely and consistently.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:31 UTC
> **Triggered by change in:** `src/components/tickets/AiCopilotPanel.tsx`

### 1. 🟠 Improper role check logic

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/components/tickets/AiCopilotPanel.tsx` |
| **Line** | 15 |

**Description:** The role check logic incorrectly evaluates the user's role. The condition `role !== "it_staff" && role !== "hr_staff" && role !== "admin"` will return true if the role is any value other than the specified ones, including falsy values like `undefined`. This could lead to unauthorized users being able to access the AI Copilot functionality.

**Fix:** Change the condition to check if the role is one of the allowed roles using an array or a set, e.g., `if (!["it_staff", "hr_staff", "admin"].includes(role)) return null;`.

---

---

## 🔍 Watchdog Scan — 13 May 2026, 14:32 UTC
> **Triggered by change in:** `src/app/dashboard/kb/page.tsx`

### 1. 🟠 Missing error handling for fetch failures

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 36-38 |

**Description:** The fetchArticles function does not handle the case where the fetch request fails (i.e., when res.ok is false). This could lead to the articles state being set to an empty array without any user feedback, making it difficult to diagnose issues with data retrieval.

**Fix:** Add an error handling mechanism to provide feedback to the user when the fetch fails, such as setting an error state and displaying an error message in the UI.

---
### 2. 🟠 Potential null reference on selectedArticle type

| Field | Value |
|-------|-------|
| **Severity** | `HIGH` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 97 |

**Description:** The code assumes that selectedArticle will always have a type property when rendering the component. If selectedArticle is null or undefined, this will lead to a runtime error when trying to access selectedArticle.type.

**Fix:** Add a conditional check to ensure selectedArticle is not null before accessing its properties, or provide a fallback value.

---
### 3. 🟡 Uncontrolled component for search query

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 20 |

**Description:** The search query is not being controlled properly as there is no input field for the user to modify it. This could lead to confusion as the user may not know how to change the search query, and it may not reflect in the UI.

**Fix:** Implement an input field for the search query and bind its value to the searchQuery state to ensure it is controlled.

---
### 4. 🟡 Missing dependency in useEffect for articleId

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 56 |

**Description:** The useEffect that fetches article details based on the articleId does not include articleId as a dependency. This means that if the articleId changes, the effect will not re-run, potentially leading to stale data being displayed.

**Fix:** Add articleId to the dependency array of the useEffect to ensure it re-runs whenever articleId changes.

---
### 5. 🟡 Inconsistent handling of filterType

| Field | Value |
|-------|-------|
| **Severity** | `MEDIUM` |
| **File** | `src/app/dashboard/kb/page.tsx` |
| **Line** | 30 |

**Description:** The filterType state is initialized to "All", but the fetchArticles function does not handle the case where "All" is selected. This could lead to confusion as it may not fetch any articles when "All" is selected.

**Fix:** Modify the fetchArticles function to handle the "All" case appropriately, ensuring that all articles are fetched when this filter is selected.

---
