import type { Command } from "../types";
import { help } from "./help";
import { clear } from "./clear";

// Register new commands here — one module per command.
const list: Command[] = [help, clear];

export const commands: ReadonlyMap<string, Command> = new Map(
  list.map((command) => [command.name, command]),
);
