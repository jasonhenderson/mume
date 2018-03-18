// tslint:disable-next-line no-implicit-dependencies
import { MarkdownIt } from "markdown-it";
import { MarkdownEngineConfig } from "../markdown-engine-config";
import { VideoLinkPlugin } from "markdown-it-video";

export default (md: MarkdownIt, config: MarkdownEngineConfig) => {
  md.use(VideoLinkPlugin, {
      youtube: { width: 640, height: 390 },
      vimeo: { width: 500, height: 281 },
      vine: { width: 600, height: 600, embed: 'simple' },
      prezi: { width: 550, height: 400 }
    }
  );
};
