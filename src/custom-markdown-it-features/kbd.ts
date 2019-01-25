// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
let Kbd = require("markdown-it-kbd");

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(Kbd);
};
