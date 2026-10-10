export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Internship";

export interface DemoJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experience: string;
  compensation: string;
  postedLabel: string;
  summary: string;
  skills: string[];
  recommended: boolean;
  recommendationReason?: string;
}

export const demoJobs: DemoJob[] = [
  {
    id: "demo-frontend-engineer",
    title: "Frontend Engineer",
    company: "Northstar Labs",
    location: "Bengaluru",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "1–3 years",
    compensation: "₹8–12 LPA",
    postedLabel: "Recently added · Demo",
    summary:
      "Build responsive product experiences with modern React and TypeScript, working closely with design and backend teams.",
    skills: ["React", "TypeScript", "Next.js", "CSS"],
    recommended: true,
    recommendationReason:
      "A sample recommendation based on frontend development skills.",
  },
  {
    id: "demo-software-intern",
    title: "Software Engineer Intern",
    company: "Orbit Systems",
    location: "Hyderabad",
    workMode: "Hybrid",
    employmentType: "Internship",
    experience: "Students and freshers",
    compensation: "₹12k–20k/month",
    postedLabel: "Recently added · Demo",
    summary:
      "Contribute to application features, learn code review practices, and collaborate with engineers on small product releases.",
    skills: ["Python", "Git", "SQL", "Problem solving"],
    recommended: true,
    recommendationReason:
      "A sample opportunity suited to an early-career developer.",
  },
  {
    id: "demo-data-analyst",
    title: "Junior Data Analyst",
    company: "Metric Grove",
    location: "Remote",
    workMode: "Remote",
    employmentType: "Full-time",
    experience: "0–2 years",
    compensation: "₹5–8 LPA",
    postedLabel: "Recently added · Demo",
    summary:
      "Help turn business data into useful reporting through exploratory analysis, dashboards, and clear communication.",
    skills: ["SQL", "Python", "Excel", "Power BI"],
    recommended: false,
  },
  {
    id: "demo-ml-engineer",
    title: "Machine Learning Engineer",
    company: "ModelForge",
    location: "Pune",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "1–3 years",
    compensation: "₹10–16 LPA",
    postedLabel: "Recently added · Demo",
    summary:
      "Prototype machine learning workflows, evaluate model performance, and work with engineers to deliver reproducible pipelines.",
    skills: ["Python", "Machine Learning", "Pandas", "SQL"],
    recommended: true,
    recommendationReason:
      "A sample recommendation for candidates exploring applied AI.",
  },
  {
    id: "demo-backend-engineer",
    title: "Backend Developer",
    company: "Cloudrail",
    location: "Delhi NCR",
    workMode: "On-site",
    employmentType: "Full-time",
    experience: "1–3 years",
    compensation: "₹7–11 LPA",
    postedLabel: "Recently added · Demo",
    summary:
      "Develop and maintain APIs, work with relational databases, and improve service reliability and test coverage.",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    recommended: false,
  },
  {
    id: "demo-product-design",
    title: "Product Design Intern",
    company: "Canvas & Co.",
    location: "Remote",
    workMode: "Remote",
    employmentType: "Internship",
    experience: "Students and freshers",
    compensation: "₹10k–18k/month",
    postedLabel: "Recently added · Demo",
    summary:
      "Explore product problems, create interface prototypes, and help refine user flows with feedback from the design team.",
    skills: ["Figma", "Wireframing", "Prototyping", "UI design"],
    recommended: false,
  },
];

export const careerTips = [
  {
    category: "RESUME",
    title: "Make your impact measurable",
    description:
      "Describe the problem you solved, the action you took, and the result whenever you can support it with evidence.",
    readTime: "3 min read",
  },
  {
    category: "INTERVIEWS",
    title: "Structure behavioural answers",
    description:
      "Use the situation, task, action, and result format to keep your examples clear and specific.",
    readTime: "4 min read",
  },
  {
    category: "JOB SEARCH",
    title: "Tailor your applications",
    description:
      "Prioritize the experience and skills most relevant to the role instead of sending the same generic resume everywhere.",
    readTime: "2 min read",
  },
];