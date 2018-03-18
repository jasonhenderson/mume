import * as cheerio from "cheerio"
import * as fs from "fs"
import * as path from "path"

import { compileLaTeX } from "./code-chunk"
import { CodeChunkData } from "./code-chunk-data"
import { parseAttributes } from "./lib/attributes";
import computeChecksum from './lib/compute-checksum';
import { svgElementToPNGFile } from "./magick"
import * as plantumlAPI from "./puml"
import * as utility from "./utility"
import * as vegaAPI from "./vega"
import * as vegaLiteAPI from "./vega-lite"

const Viz = require(path.resolve(utility.extensionDirectoryPath, './dependencies/viz/viz.js'))

export async function processGraphs(text:string,
{fileDirectoryPath, projectDirectoryPath, imageDirectoryPath, imageFilePrefix, useRelativeFilePath, codeChunksData, graphsCache}:
{fileDirectoryPath:string, projectDirectoryPath:string, imageDirectoryPath:string, imageFilePrefix:string, useRelativeFilePath:boolean, codeChunksData: {[key:string]: CodeChunkData}, graphsCache:{[key:string]:string}})
:Promise<{outputString:string, imagePaths: string[]}> {
  let lines = text.split('\n')
  const codes:Array<{start:number, end:number, content:string, options:object, optionsStr:string}> = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (trimmedLine.match(/^```(.+)\"?cmd\"?[:=]/) || // code chunk
        trimmedLine.match(/^```(puml|plantuml|dot|viz|mermaid|vega|vega\-lite|ditaa)/)) { // graphs
      const numOfSpacesAhead = line.match(/^\s*/).length
      let j = i + 1
      let content = ''
      while (j < lines.length) {
        if (lines[j].trim() == '```' && lines[j].match(/^\s*/).length == numOfSpacesAhead) {
          let options = {},
              optionsStr = '',
              optionsMatch
          if (optionsMatch = trimmedLine.match(/\{(.+)\}$/)) {
            try {
              options = parseAttributes(optionsMatch[0])
              optionsStr = optionsMatch[1]
            } catch(error) {
              options = {}
            }
          }

          codes.push({
            start: i,
            end: j,
            content,
            options,
            optionsStr
          })
          i = j
          break
        }
        content += (lines[j]+'\n')
        j += 1
      }
    } else if (trimmedLine.match(/^```\S/)) { // remove {...} after ```lang
      const indexOfFirstSpace = line.indexOf(' ', line.indexOf('```'))
      if (indexOfFirstSpace > 0)
        lines[i] = line.slice(0, indexOfFirstSpace)
    } else if (!trimmedLine) {
      lines[i] = '  '
    }

    i += 1
  }

  if (!imageFilePrefix)
    imageFilePrefix = (Math.random().toString(36).substr(2, 9) + '_')

  imageFilePrefix = imageFilePrefix.replace(/[\/&]/g, '_ss_')
  imageFilePrefix = encodeURIComponent(imageFilePrefix)

  let imgCount = 0

  const asyncFunctions = [],
        imagePaths = []

  let currentCodeChunk:CodeChunkData = null
  for (let key in codeChunksData) { // get the first code chunk.
    if (!codeChunksData[key].prev) {
      currentCodeChunk = codeChunksData[key]
      break
    }
  }

  function clearCodeBlock(lines:string[], start:number, end:number) {
    let i = start
    while (i <= end) {
      lines[i] = ''
      i += 1
    }
  }

  async function convertSVGToPNGFile(outFileName='', svg:string, lines:string[], start:number, end:number, modifyCodeBlock:boolean) {
    if (!outFileName)
      outFileName = imageFilePrefix+imgCount+'.png'

    const pngFilePath = path.resolve(imageDirectoryPath, outFileName)
    await svgElementToPNGFile(svg, pngFilePath)
    let displayPNGFilePath
    if (useRelativeFilePath) {
      displayPNGFilePath = path.relative(fileDirectoryPath, pngFilePath) + '?' + Math.random()
    } else {
      displayPNGFilePath = '/' + path.relative(projectDirectoryPath, pngFilePath) + '?' + Math.random()
    }
    displayPNGFilePath = displayPNGFilePath.replace(/\\/g, '/') // fix windows path error.

    imgCount++

    if (modifyCodeBlock) {
      clearCodeBlock(lines, start, end)
      lines[end] += '\n' + `![](${displayPNGFilePath})  `
    }

    imagePaths.push(pngFilePath)
    return displayPNGFilePath
  }

  for (let i = 0; i < codes.length; i++) {
    const codeData = codes[i]
    const {start, end, content, options, optionsStr} = codeData
    const def = lines[start].trim().slice(3).trim()

    if (options['code_block']) {
      // Do Nothing
    } else if (def.match(/^(puml|plantuml)/)) {
      try {
        const checksum = computeChecksum(optionsStr + content)
        let svg
        if (!(svg = graphsCache[checksum])) { // check whether in cache
          svg = await plantumlAPI.render(content, fileDirectoryPath)
        }
        await convertSVGToPNGFile(options['filename'], svg, lines, start, end, true)
      } catch(error) {
        clearCodeBlock(lines, start, end)
        lines[end] += `\n` + `\`\`\`\n${error}\n\`\`\`  \n`
      }
    } else if (def.match(/^(viz|dot)/)) {
      try {
        const checksum = computeChecksum(optionsStr + content)
        let svg
        if (!(svg = graphsCache[checksum])) {
          const config = Object.assign({}, options, { engine: "dot" });
          svg = Viz(content, config)
          svg = svg.replace(/xlink:href/g, "href").replace("<a", "<a class='.webkit-svg-link'");
        }
        await convertSVGToPNGFile(options['filename'], svg, lines, start, end, true)
      } catch(error) {
        clearCodeBlock(lines, start, end)
        lines[end] += `\n` + `\`\`\`\n${error}\n\`\`\`  \n`
      }
    } else if (def.match(/^vega\-lite/)) { // vega-lite
      try {
        const checksum = computeChecksum(optionsStr + content)
        let svg
        if (!(svg = graphsCache[checksum])) {
          svg = await vegaLiteAPI.toSVG(content, fileDirectoryPath)
        }
        await convertSVGToPNGFile(options['filename'], svg, lines, start, end, true)
      } catch(error) {
        clearCodeBlock(lines, start, end)
        lines[end] += `\n` + `\`\`\`\n${error}\n\`\`\`  \n`
      }
    } else if (def.match(/^vega/)) { // vega
      try {
        const checksum = computeChecksum(optionsStr + content)
        let svg
        if (!(svg = graphsCache[checksum])) {
          svg = await vegaAPI.toSVG(content, fileDirectoryPath)
        }
        await convertSVGToPNGFile(options['filename'], svg, lines, start, end, true)
      } catch(error) {
        clearCodeBlock(lines, start, end)
        lines[end] += `\n` + `\`\`\`\n${error}\n\`\`\`  \n`
      }
    } else if (def.match(/^mermaid/))  {
      // do nothing as it doesn't work well...
      /*
      try {
        const pngFilePath = path.resolve(imageDirectoryPath, imageFilePrefix+imgCount+'.png')
        imgCount++
        await mermaidToPNG(content, pngFilePath)

        let displayPNGFilePath
        if (useRelativeFilePath) {
          displayPNGFilePath = path.relative(fileDirectoryPath, pngFilePath) + '?' + Math.random()
        } else {
          displayPNGFilePath = '/' + path.relative(projectDirectoryPath, pngFilePath) + '?' + Math.random()
        }
        clearCodeBlock(lines, start, end)

        lines[end] += '\n' + `![](${displayPNGFilePath})  `

        imagePaths.push(pngFilePath)
      } catch(error) {
        clearCodeBlock(lines, start, end)
        lines[end] += `\n` + `\`\`\`\n${error}\n\`\`\`  \n`
      }
      */
    } else if (currentCodeChunk) { // code chunk
      if (currentCodeChunk.normalizedInfo.attributes['hide']) { // remove code block
        clearCodeBlock(lines, start, end)
      } else { // remove {...} after ```lang
        const line = lines[start]
        const indexOfFirstSpace = line.indexOf(' ', line.indexOf('```'))
        lines[start] = line.slice(0, indexOfFirstSpace)
      }

      if (currentCodeChunk.result) { // append result
        let result = currentCodeChunk.result
        const attributes = currentCodeChunk.normalizedInfo.attributes
        if (attributes['output'] === 'html' || attributes['matplotlib']) { // check svg and convert it to png
          const $ = cheerio.load(currentCodeChunk.result, {xmlMode: true}) // xmlMode here is necessary...
          const svg = $('svg')
          if (svg.length === 1) {
            const pngFilePath = (await convertSVGToPNGFile(attributes['filename'], $.html('svg'), lines, start, end, false)).replace(/\\/g, '/')
            result = `![](${pngFilePath})  \n`
          }
        } else if (attributes['cmd'].match(/^(la)?tex$/)) { // for latex, need to run it again to generate svg file in currect directory.
          result = await compileLaTeX(content, fileDirectoryPath, Object.assign({}, attributes, {latex_svg_dir: imageDirectoryPath}))
        } else if (currentCodeChunk.normalizedInfo.attributes['output'] === 'markdown') {
          result = currentCodeChunk.plainResult
        } else if (!attributes['output'] || attributes['output'] === 'text') {
          result = `\n\`\`\`\n${currentCodeChunk.plainResult}\`\`\`\n`
        }

        lines[end] += ('\n' + result)
      }
      currentCodeChunk = codeChunksData[currentCodeChunk.next]
    }
  }

  await Promise.all(asyncFunctions)

  const outputString = lines.filter((line)=> line).join('\n')
  return {outputString, imagePaths}
}
