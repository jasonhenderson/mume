// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(require('markdown-it-container'), 'nav', {

    validate: function(params) {
      return params.trim().match(/^nav\s+(.*)$/);
    },

    render: function (tokens, idx) {
      var m = tokens[idx].info.trim().match(/^nav\s+(.*)$/);
      global.console.log("nav matches: ", m)
      return '<div>' + m[1] + '</div>\n'
      // if (tokens[idx].nesting === 1) {
      //   // opening tag
      //   return '<details><summary>' + m[1] + '</summary>\n';
      //
      // } else {
      //   // closing tag
      //   return '</details>\n';
      // }
    }
  });
};

// console.log(md.render('::: spoiler click me\n*content*\n:::\n'));

// Output:
//
// <details><summary>click me</summary>
// <p><em>content</em></p>
// </details>
