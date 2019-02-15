// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(require('markdown-it-container'), 'spoiler', {

    validate: function(params) {
      return params.trim().match(/^spoiler\s+(.*)$/);
    },

    render: function (tokens, idx) {
      var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<details><summary>' + m[1] + '</summary>\n';

      } else {
        // closing tag
        return '</details>\n';
      }
    }
  });
};

// console.log(md.render('::: spoiler click me\n*content*\n:::\n'));

// Output:
//
// <details><summary>click me</summary>
// <p><em>content</em></p>
// </details>
