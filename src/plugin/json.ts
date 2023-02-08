import {Cogen} from '../cogen';
import {Target} from '../target';
import {Rules} from '../rules';

interface JsonRules extends Rules {
    tab: string,
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
    fields: Record<string, Target>
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
            _() {
                cogen.builder.pushTab(cogen.rules.json.tab)
                cogen.runFor(cogen.popTarget<JsonTarget>().content)
                cogen.builder.popTab()
            },

            object() {
                const builder = cogen.builder
                const rules = cogen.rules.json as JsonRules
                const content = cogen.target as JsonObjectTarget
                const fields = Object.entries(content.fields)

                if ((fields.length === 0) && rules.singleLineEmptyObject) {
                    builder.add('{}')
                    return
                }

                builder
                    .nextLineIf(rules.newLineBeforeOpenBracket)
                    .add('{')
                    .levelUpIf(rules.newLineAfterOpenBracket)
                    .doForTailAndHead(Object.entries(content.fields), ([fieldName, fieldTarget], isHead) => {
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

            array() {
                const builder = cogen.builder
                const rules = cogen.rules.json as JsonRules
                const target = cogen.target as JsonArrayTarget

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

            number() {
                const value = String((cogen.target as JsonNumberTarget).content)
                cogen.builder.add(value)
            },

            string() {
                const value = (cogen.target as JsonStringTarget).content
                cogen.builder.add(JSON.stringify(value))
            }
        }
    })
}