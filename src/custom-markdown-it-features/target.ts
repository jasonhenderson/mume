// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {

// Remember old renderer, if overridden, or proxy to default renderer
  var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    var aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };

  // md.use(iterator, 'url_new_win', 'link_open', function (tokens, idx) {
  //     var aIndex = tokens[idx].attrIndex('target');
  //
  //     if (aIndex < 0) {
  //       tokens[idx].attrPush(['target', '_blank']);
  //     } else {
  //       tokens[idx].attrs[aIndex][1] = '_blank';
  //     }
  //   });
};
