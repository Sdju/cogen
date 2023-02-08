import {describe, expect, it} from 'vitest';
import {Cogen} from '../../src';
import jsonPlugin from '../../src/plugin/json';

describe('JSON generation', () => {
    it('simple test', () => {
        const cogen = new Cogen()
        cogen.use(jsonPlugin)
        const result = cogen.generateBy({
            __type: 'json',
            content: {
                    __type: 'json:object',
                    fields: {
                        a: {
                            __type: 'json:string',
                            content: 'test'
                        },
                        b: {
                            __type: 'json:string',
                            content: 'well'
                        },
                        c: {
                            __type: 'json:number',
                            content: 52
                        }
                    }
            }
        }, {})
        expect(result).eq(`{
  "a": "test",
  "b": "well",
  "c": 52
}`)
    })

    it('array test', () => {
        const cogen = new Cogen()
        cogen.use(jsonPlugin)
        const result = cogen.generateBy({
            __type: 'json',
            content: {
                __type: 'json:array',
                content: [
                    {
                        __type: 'json:number',
                        content: 56
                    },
                    {
                        __type: 'json:number',
                        content: '112'
                    },
                    {
                        __type: 'json:array',
                        content: []
                    },
                    {
                        __type: 'json:array',
                        content: [
                            {
                                __type: 'json:string',
                                content: 'hello'
                            }
                        ]
                    },
                    {
                        __type: 'json:object',
                        fields: {}
                    },
                ]
            }
        }, {
            json: {
                tab: '    '
            }
        })

        expect(result).eq(`[
    56,
    112,
    [],
    [
        "hello"
    ],
    {}
]`)
    })
})