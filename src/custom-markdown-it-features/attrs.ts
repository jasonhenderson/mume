// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
import MarkdownItAttrs from  "markdown-it-attrs";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(MarkdownItAttrs);
};
