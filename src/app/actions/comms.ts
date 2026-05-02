"use server";

import fs from "fs/promises";
import path from "path";

export async function getLatestComms() {
  try {
    const filePath = path.join(process.cwd(), "COMMS.md");
    const content = await fs.readFile(filePath, "utf-8");
    
    // Simple parser to find the latest Backend -> Frontend message
    const sections = content.split("## Backend → Frontend");
    if (sections.length < 2) return null;
    
    const backendSection = sections[1].split("## Frontend → Backend")[0];
    const messages = backendSection.split("###").filter(m => m.trim().length > 0);
    
    if (messages.length === 0) return null;
    
    const latestMessage = messages[0].trim();
    const dateLine = latestMessage.split("\n")[0];
    
    return {
      date: dateLine,
      content: latestMessage,
      hash: Buffer.from(latestMessage).toString('base64').slice(0, 10) // Simple hash to track changes
    };
  } catch (error) {
    console.error("Failed to read COMMS.md", error);
    return null;
  }
}
