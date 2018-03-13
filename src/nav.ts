import * as uslug from "uslug"

/**
 *  eg:
 * Haha [A](www.a.com) xxx [B](www.b.com)
 *  should become
 * Haha A xxx B
 *
 * check issue #41
 */

function sanitizeContent(content) {
  let output = ''
  let offset = 0

  // test ![...](...)
  // test [...](...)
  // <a name="myAnchor"></a>Anchor Header
  // test [^footnote]
  let r = /\!?\[([^\]]*)\]\(([^)]*)\)|<([^>]*)>([^<]*)<\/([^>]*)>|\[\^([^\]]*)\]/g
  let match = null
  while (match = r.exec(content)) {
    output += content.slice(offset, match.index)
    offset = match.index + match[0].length

    if (match[0][0] === '<')
      output += match[4]
    else if (match[0][0] === '[' && match[0][1] === '^')  //  # footnote
      output += ''
    else if (match[0][0] !== '!')
      output += match[1]
    else // image
      output += match[0]
  }

  output += content.slice(offset, content.length)
  return output
}

/**
 *  ordered: boolean
 *  depthFrom: number, default 1
 *  depthTo: number, default 6
 *  tab: string, default `\t`
 */
export interface navOption {
  back: boolean
  maps: string[]
}

/**
 *
 * @param opt:navOption =
 * @param tokens = [{content:string, level:number, id:optional|string }]
 * @return {content, array}
 */
export function nav(opt: navOption) {

  const back = opt.back
  const maps = opt.maps || []

  const output = []

  if (back) {
    output.push('[Back](function goBack(\)){window.history.back(\));}goBack(\));')
  }

  for (let i = 0; i < maps.length; i++) {
    output.push(`'[Roadmap](function goToMap()){window.location.href=\'${sanitizeContent(maps[i])}\';}goToMap());'`)
  }

  return {
    content: output.join(' '),
    array: output
  }
}
