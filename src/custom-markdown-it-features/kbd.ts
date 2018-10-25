// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
import { KbdPlugin } from "markdown-it-kbd";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(KbdPlugin);
};
