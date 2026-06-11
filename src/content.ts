import profileJson from "../content/profile.json";
import projectsJson from "../content/projects.json";

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  details: string[];
}

export interface Social {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  githubUser: string;
  about: string[];
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  awards: string[];
  socials: Social[];
}

export interface Project {
  name: string;
  title: string;
  description: string;
  tech: string[];
  repo?: string;
  live?: string;
  details?: string[];
}

export const profile: Profile = profileJson;
export const projects: Project[] = projectsJson;
