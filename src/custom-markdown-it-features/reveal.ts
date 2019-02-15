// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
const CustomBlock = require('markdown-it-custom-block');

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(CustomBlock, {
    slide (args) {
      if (!args) return '';
      args = args.split(',');
      switch(args[0]) {
        case "click":
          return ` <!-- .element: class="fragment" data-fragment-index="${args[1]}" -->`;
        default:
          return '';
      }
    }
  });
};
