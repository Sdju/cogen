import { type Cogen } from '../cogen'
import { type Target } from '../target'
import { type Rules } from '../rules'
import { type LineBuilder } from '../builder'

interface JsonRules extends Rules {
  tab: string
  newLineBeforeOpenBracket: boolean
  newLineAfterOpenBracket: boolean
  newLineBeforeCloseBracket: boolean
  backspaceBeforeColon: boolean
  backspaceAfterColor: boolean
  newLineAfterField: boolean
  singleLineEmptyArray: boolean
  singleLineEmptyObject: boolean
}

interface JsonTarget extends Target {
  content: Target
}

interface JsonNumberTarget extends Target {
  content: number | string
}

interface JsonStringTarget extends Target {
  content: string
}

interface JsonObjectTarget extends Target {
  content: Record<string, Target>
}

interface JsonArrayTarget extends Target {
  content: Target[]
}

export default function jsonPlugin(cogen: Cogen): void {
  cogen.extendRules({
    json: {
      tab: '  ',
      newLineBeforeOpenBracket: false,
      newLineAfterOpenBracket: true,
      newLineBeforeCloseBracket: true,
      newLineAfterCloseBracket: true,
      newLineAfterField: true,
      backspaceBeforeColon: false,
      backspaceAfterColor: true,
      singleLineEmptyArray: true,
      singleLineEmptyObject: true
    }
  })

  cogen.addTransformers({
    json: {
      _(builder: LineBuilder, target: JsonTarget, rules: Rules) {
        cogen.runFor(target.content, rules.json)
      },

      object(builder: LineBuilder, target: JsonObjectTarget, rules: JsonRules) {
        const fields = Object.entries(target.content)

        if ((fields.length === 0) && rules.singleLineEmptyObject) {
          builder.add('{}')
          return
        }

        builder
          .nextLineIf(rules.newLineBeforeOpenBracket)
          .add('{')
          .levelUpIf(rules.newLineAfterOpenBracket)
          .doForTailAndHead(fields, ([fieldName, fieldTarget], isHead) => {
            builder
              .add(`"${fieldName}"`)
              .addWsIf(rules.backspaceBeforeColon, ' ')
              .add(':')
              .addWsIf(rules.backspaceAfterColor, ' ')
            cogen.runFor(fieldTarget)
            if (!isHead) {
              builder
                .add(',')
                .nextLineIf(rules.newLineAfterField)
            }
          })
          .levelDown(rules.newLineBeforeCloseBracket)
          .add('}')
      },

      array(builder: LineBuilder, target: JsonArrayTarget, rules: JsonRules) {
        if ((target.content.length === 0) && rules.singleLineEmptyArray) {
          builder.add('[]')
          return
        }

        builder
          .nextLineIf(rules.newLineBeforeOpenBracket)
          .add('[')
          .levelUpIf(rules.newLineAfterOpenBracket)
          .doForTailAndHead(target.content, (item, isHead) => {
            cogen.runFor(item)
            if (!isHead) {
              builder
                .add(',')
                .nextLineIf(rules.newLineAfterField)
            }
          })
          .levelDown(rules.newLineBeforeCloseBracket)
          .add(']')
      },

      number(builder: LineBuilder, target: JsonNumberTarget) {
        const value = String(target.content)
        builder.add(value)
      },

      string(builder: LineBuilder, target: JsonStringTarget) {
        cogen.builder.add(JSON.stringify(target.content))
      }
    }
  })
}
