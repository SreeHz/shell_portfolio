import type { Command } from "../types";
import { about } from "./about";
import { awards } from "./awards";
import { banner } from "./banner";
import { clear } from "./clear";
import { contact } from "./contact";
import { education } from "./education";
import { experience } from "./experience";
import { help } from "./help";
import { projectsCommand } from "./projects";
import { resume } from "./resume";
import { skills } from "./skills";
import { socials } from "./socials";

// Register new commands here — one module per command.
const list: Command[] = [
  help,
  about,
  projectsCommand,
  skills,
  experience,
  education,
  awards,
  contact,
  socials,
  resume,
  banner,
  clear,
];

export const commands: ReadonlyMap<string, Command> = new Map(
  list.map((command) => [command.name, command]),
);
