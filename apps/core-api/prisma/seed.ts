import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type TaskSeed = {
  code: string;
  category: string;
  name: string;
  expected_deliverable: string;
};

/** Fixed task menu from docs/CMINDS_CONTEXT.md §9 */
const TASKS: TaskSeed[] = [
  {
    code: "G-01",
    category: "Management & Coordination",
    name: "Hiring a campaign coordinator",
    expected_deliverable:
      "Signed contract and documentation of the selection process",
  },
  {
    code: "G-02",
    category: "Management & Coordination",
    name: "Coordination team meeting",
    expected_deliverable: "Attendance list and minutes with agreed actions",
  },
  {
    code: "G-03",
    category: "Management & Coordination",
    name: "Development of a work plan",
    expected_deliverable:
      "Approved plan with schedule and defined milestones",
  },
  {
    code: "G-04",
    category: "Management & Coordination",
    name: "Progress report to the platform",
    expected_deliverable: "Monthly or bimonthly report as agreed",
  },
  {
    code: "C-01",
    category: "Community Participation",
    name: "Community assembly or meeting",
    expected_deliverable:
      "Attendance list, minutes, and photographic record",
  },
  {
    code: "C-02",
    category: "Community Participation",
    name: "Training workshop for the community",
    expected_deliverable:
      "Attendance list, materials distributed, and evaluation",
  },
  {
    code: "C-03",
    category: "Community Participation",
    name: "Community consultation or survey",
    expected_deliverable: "Response database and analysis of results",
  },
  {
    code: "C-04",
    category: "Community Participation",
    name: "Formal community agreement",
    expected_deliverable:
      "Document signed by community leaders or assembly",
  },
  {
    code: "I-01",
    category: "Advocacy & Policy",
    name: "Meeting with local authorities",
    expected_deliverable: "Minutes or summary with commitments obtained",
  },
  {
    code: "I-02",
    category: "Advocacy & Policy",
    name: "Travel to the capital for meetings with government authorities",
    expected_deliverable:
      "Trip report, contacts made, and agreements reached",
  },
  {
    code: "I-03",
    category: "Advocacy & Policy",
    name: "Presentation before a government body",
    expected_deliverable: "Presentation used and record of the session",
  },
  {
    code: "I-04",
    category: "Advocacy & Policy",
    name: "Submission of formal letter or proposal to government",
    expected_deliverable:
      "Copy of the letter and acknowledgment of receipt",
  },
  {
    code: "I-05",
    category: "Advocacy & Policy",
    name: "Participation in a public hearing",
    expected_deliverable:
      "Record of participation and contribution presented",
  },
  {
    code: "D-01",
    category: "Information Production",
    name: "Marine or coastal ecosystem monitoring",
    expected_deliverable:
      "Dataset with records and documented methodology",
  },
  {
    code: "D-02",
    category: "Information Production",
    name: "Participatory mapping",
    expected_deliverable:
      "Digital or printed map validated by the community",
  },
  {
    code: "D-03",
    category: "Information Production",
    name: "Systematization of traditional knowledge",
    expected_deliverable: "Document or report of local knowledge",
  },
  {
    code: "D-04",
    category: "Information Production",
    name: "Technical proposal for a protected area or OECM",
    expected_deliverable:
      "Draft with coordinates, justification, and management plan",
  },
  {
    code: "K-01",
    category: "Communications & Visibility",
    name: "Local communications campaign",
    expected_deliverable: "Content produced and reach metrics",
  },
  {
    code: "K-02",
    category: "Communications & Visibility",
    name: "Production of outreach materials",
    expected_deliverable: "Printed or digital materials delivered",
  },
  {
    code: "K-03",
    category: "Communications & Visibility",
    name: "Media coverage or press release",
    expected_deliverable: "Link or clipping of the publication obtained",
  },
  {
    code: "X-01",
    category: "Custom",
    name: "Custom Task",
    expected_deliverable: "Deliverable defined in the contract",
  },
];

async function main(): Promise<void> {
  await prisma.allowedEmailDomain.upsert({
    where: { domain: "trustlesswork.com" },
    create: { domain: "trustlesswork.com", is_active: true },
    update: { is_active: true },
  });

  for (const task of TASKS) {
    await prisma.task.upsert({
      where: { code: task.code },
      create: {
        code: task.code,
        category: task.category,
        name: task.name,
        expected_deliverable: task.expected_deliverable,
        is_active: true,
      },
      update: {
        category: task.category,
        name: task.name,
        expected_deliverable: task.expected_deliverable,
        is_active: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
