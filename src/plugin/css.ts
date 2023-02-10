import { type Target } from '../target'
import { type BaseRules, type Rules } from '../rules'
import { type Cogen } from '../cogen'
import { type LineBuilder } from '../builder'

interface CssTarget extends Target {
  content: Target[]
}

interface CssRuleTarget extends Target {
  selector: string | string[]

  content: Target[]

  description?: string | Target
}

interface CssAtRuleTarget extends Target {
  name: string

  rule: string

  content: Target[]

  description?: string | Target
}

interface CssFieldTarget extends Target {
  name: string

  content: string

  __isFirst?: boolean

  description?: string | Target
}

interface CssCommentTarget extends Target {
  content: string
}

interface CssRules extends BaseRules {
  newLineBeforeRuleOpenBracket: boolean
  spaceBeforeRuleOpenBracket: boolean
  spaceBeforeFieldColon: boolean
  spaceAfterFieldColon: boolean
  nextLineAfterRule: boolean
  separateSelectorsByNewLines: boolean
  clearEmptyLines: boolean
  spaceBeforeCommentContentStart: boolean
  spaceAfterCommentContentStart: boolean
}

export default function CssPlugin(cogen: Cogen): void {
  cogen.extendRules({
    css: {
      tab: '  ',
      minify: false,
      newLineBeforeRuleOpenBracket: false,
      spaceBeforeRuleOpenBracket: true,
      spaceBeforeFieldColon: false,
      spaceAfterFieldColon: true,
      nextLineAfterRule: true,
      separateSelectorsByNewLines: true,
      clearEmptyLines: true,
      spaceBeforeCommentContentStart: true,
      spaceAfterCommentContentStart: true
    }
  })

  cogen.addTransformers({
    css: {
      _(builder: LineBuilder, target: CssTarget, rules: Rules) {
        builder
          .pushTab(rules.css.tab)
          .doForTailAndHead(target.content, (itemTarget, isHead) => {
            cogen.runFor(itemTarget, rules.css)
            if (!isHead) {
              builder
                .nextLine()
                .nextLineIf(rules.css.nextLineAfterRule)
            }
          })
          .popTab()
      },

      rule(builder: LineBuilder, target: CssRuleTarget, rules: CssRules) {
        if (target.description) {
          if (cogen.isTarget(target.description)) {
            cogen.runFor(target.description as Target)
            builder.nextLine()
          } else {
            cogen.runFor({
              __type: 'css:comment',
              content: target.description as string
            })
            builder.nextLine()
          }
        }

        if (typeof target.selector === 'string') {
          builder.add(target.selector)
        } else {
          builder.doForTailAndHead(target.selector, (selector, isHead) => {
            builder
              .add(selector)
            if (!isHead) {
              builder
                .add(',')
                .nextLineIf(rules.separateSelectorsByNewLines)
            }
          })
        }

        if (rules.newLineBeforeRuleOpenBracket) {
          builder.nextLine()
        } else if (rules.spaceBeforeRuleOpenBracket) {
          builder.addWs(' ')
        }
        builder
          .add('{')
          .levelUp()
          .doForTailAndHead(target.content, (itemTarget, isHead, index) => {
            const infectedData = {
              ...itemTarget,
              __isFirst: index === 0
            }
            cogen.runFor(infectedData)
            builder.add(';').nextLineIf(!isHead)
          })
          .levelDown()
          .add('}')
      },

      field(builder: LineBuilder, target: CssFieldTarget, rules: CssRules) {
        if (target.description) {
          if (!target.__isFirst) {
            builder
              .clearLineIf(rules.clearEmptyLines)
              .nextLine()
          }

          if (cogen.isTarget(target.description)) {
            cogen.runFor(target.description as Target)
            builder.nextLine()
          } else {
            cogen.runFor({
              __type: 'css:comment',
              content: target.description as string
            })
            builder.nextLine()
          }
        }

        builder
          .add(target.name)
          .addWsIf(rules.spaceBeforeFieldColon, ' ')
          .add(':')
          .addWsIf(rules.spaceAfterFieldColon, ' ')
          .add(target.content)
      },

      atRule(builder: LineBuilder, target: CssAtRuleTarget, rules: CssRules) {
        if (target.description) {
          if (cogen.isTarget(target.description)) {
            cogen.runFor(target.description as Target)
            builder.nextLine()
          } else {
            cogen.runFor({
              __type: 'css:comment',
              content: target.description as string
            })
            builder.nextLine()
          }
        }

        builder
          .add('@')
          .add(target.name)
          .add(' ')
          .addIf(Boolean(target.rule), target.rule)

        if (!target.content?.length) {
          builder.add(';')
          return
        }

        if (rules.newLineBeforeRuleOpenBracket) {
          builder.nextLine()
        } else if (rules.spaceBeforeRuleOpenBracket) {
          builder.addWs(' ')
        }
        builder
          .add('{')
          .levelUp()
          .doForTailAndHead(target.content, (itemTarget, isHead) => {
            cogen.runFor(itemTarget)
            builder
              .nextLineIf(!isHead && rules.nextLineAfterRule, !rules.clearEmptyLines)
              .nextLineIf(!isHead)
          })
          .levelDown()
          .add('}')
      },

      comment(builder: LineBuilder, target: CssCommentTarget, rules: CssRules) {
        builder
          .add('/*')
          .addWsIf(rules.spaceBeforeCommentContentStart)
          .add(target.content)
          .addWsIf(rules.spaceAfterCommentContentStart)
          .add('*/')
      }
    }
  })
}
