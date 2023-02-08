import { describe, it, expect } from 'vitest'
import {LineBuilder} from '../../src/builder';

// The two tests marked with concurrent will be run in parallel
describe('LineBuilder', () => {
    it('basic usage', () => {
        const builder = new LineBuilder({
            tab: '  ',
            minify: false
        })

        builder
            .add('let')
            .add(' ')
            .add('a')
            .addWs(' ')
            .add('=')
            .addWs(' ')
            .add('1')
        expect(builder.build()).eq('let a = 1')
    })

    it('levels', () => {
        const builder = new LineBuilder({
            tab: '  ',
            minify: false
        })
        builder
            .add('if (a === 1) {')
            .levelUp()
            .add('for (;;) {')
            .levelUp()
            .add('return')
            .levelDown()
            .add('}')
            .levelDown()
            .add('}')
        expect(builder.build()).eq(`if (a === 1) {
  for (;;) {
    return
  }
}`)
    })

    it('alignment', () => {
        const builder = new LineBuilder({
            tab: '  ',
            minify: false
        })
        builder
            .add('let ')
            .saveAlignment()
            .add('a = 1')
            .nextLine()
            .add('b = 2')
            .nextLine()
            .add('c = 3')
            .dropAlignment()
            .nextLine()
            .add('const d = 4')
        expect(builder.build()).eq(`let a = 1
    b = 2
    c = 3
const d = 4`)
    })

    it('doForTailAndHead', () => {
        const builder = new LineBuilder({
            tab: '  ',
            minify: false
        })
        const result = builder.doForTailAndHead([1, 2, 3], (value, isHead) => {
            builder.add(String(value))
            if (!isHead) {
                builder.add(', ')
            }
        }).build()
        expect(result, '1, 2, 3')
    })
})
