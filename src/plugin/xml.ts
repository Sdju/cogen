import { type Cogen } from '../cogen'
import { type Target } from '../target'
import { type Rules } from '../rules'

interface XmlRules extends Rules {
  tab: string
  newLineBeforeOpenTag: boolean
  newLineAfterOpenTag: boolean
  newLineBeforeCloseTag: boolean
  newLineAfterCloseTag: boolean
  spaceBeforeTagName: boolean
  spaceSpaceAfterTagName: boolean
  spaceBeforeAttributeEqualSign: boolean
  spaceAfterAttributeEqualSign: boolean
  spaceBeforeSelfclosedClose: boolean
  spaceBeforeTagClose: boolean
  selfclosedEmptyTags: boolean
}

interface XmlTarget extends Target {
  content: Target[]
}

interface XmlTagTarget extends Target {
  name: string
  attributes?: Record<string, string | boolean>
  content?: Target[]
}

interface XmlContentTarget extends Target {
  content: string
}

export default function xmlLoader (cogen: Cogen): void {
  cogen.extendRules({
    xml: {
      tab: '    ',
      newLineBeforeOpenTag: false,
      newLineAfterOpenTag: true,
      newLineBeforeCloseTag: true,
      newLineAfterCloseTag: true,
      spaceBeforeAttributeEqualSign: false,
      spaceAfterAttributeEqualSign: false,
      spaceBeforeSelfclosedClose: true,
      spaceBeforeTagClose: false,
      selfclosedEmptyTags: true
    }
  })

  cogen.addTransformers({
    xml: {
      _ () {
        cogen.builder
          .pushTab(cogen.rules.xml.tab)
          .doForTailAndHead(
            cogen.popTarget<XmlTarget>().content,
            (target) => {
              cogen.runFor(target)
            }
          )
          .popTab()
      },

      tag () {
        const builder = cogen.builder
        const rules = cogen.rules.xml as XmlRules
        const target = cogen.target as XmlTagTarget
        const attributes = target.attributes && Object.entries(target.attributes)
        const hasAttributes = Boolean(attributes?.length)
        const hasContent = Boolean(target.content?.length)

        builder
          .nextLineIf(rules.newLineBeforeOpenTag)
          .add('<')
          .addWsIf(rules.spaceSpaceAfterTagName, ' ')
          .add(target.name)
          .addIf(hasAttributes, ' ')
          .doForTailAndHead(attributes, ([name, value], isHead) => {
            if (typeof value === 'boolean') {
              builder.add(name)
            } else {
              builder
                .add(name)
                .addWsIf(rules.spaceBeforeAttributeEqualSign, ' ')
                .add('=')
                .addWsIf(rules.spaceAfterAttributeEqualSign, ' ')
                .add(`"${value}"`)
            }
            if (!isHead) {
              builder.add(' ')
            }
          })
        if (!hasContent && rules.selfclosedEmptyTags) {
          builder
            .addWsIf(rules.spaceBeforeSelfclosedClose, ' ')
            .add('/>')
            .nextLineIf(rules.newLineAfterCloseTag)
          return
        }
        builder
          .addWsIf(rules.spaceBeforeTagClose, ' ')
          .add('>')
          .levelUp(rules.newLineAfterOpenTag)
          .doForTailAndHead(target.content, (target, isHead) => {
            cogen.runFor(target)
          })
          .levelDown(rules.newLineBeforeCloseTag)
          .add('</')
          .addWsIf(rules.spaceBeforeTagName, ' ')
          .add(target.name)
          .addWsIf(rules.spaceAfterTagName, ' ')
          .add('>')
      },

      content () {
        cogen.builder.add((cogen.target as XmlContentTarget).content)
      }
    }
  })
}
