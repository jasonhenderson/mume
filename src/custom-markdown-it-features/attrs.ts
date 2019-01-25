// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
let MarkdownItAttrs = require("markdown-it-attrs");

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(MarkdownItAttrs);

  // md.renderer.rules.attrs = tokenizeVideoLink(theMd, theOptions);
  // md.inline.ruler.before('emphasis', 'videoLink', videoEmbed(theMd, 'videoLink', theOptions))
};
