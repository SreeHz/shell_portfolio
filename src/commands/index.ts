import type { Command } from "../types";
import { about } from "./about";
import { awards } from "./awards";
import { banner } from "./banner";
import { blog } from "./blog";
import { clear } from "./clear";
import { contact } from "./contact";
import { education } from "./education";
import { experience } from "./experience";
import { help } from "./help";
import { projectsCommand } from "./projects";
import { resume } from "./resume";
import { skills } from "./skills";
import { socials } from "./socials";
import { theme } from "./theme";
import { whoami, pwd, uname, date, uptime, echo, ls, neofetch } from "./unix";
import { sudoCommand, aptCommand, rmCommand, rebootCommand } from "./jokes";

const list: Command[] = [
  help,
  about,
  projectsCommand,
  skills,
  experience,
  education,
  awards,
  blog,
  contact,
  socials,
  resume,
  theme,
  banner,
  clear,
  whoami,
  pwd,
  uname,
  date,
  uptime,
  echo,
  ls,
  neofetch,
  sudoCommand,
  aptCommand,
  rmCommand,
  rebootCommand,
];

export const commands: ReadonlyMap<string, Command> = new Map(
  list.map((command) => [command.name, command]),
);
