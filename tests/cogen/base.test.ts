import { describe, it, expect } from 'vitest'
import {Cogen} from '../../src';

describe('Base methods of Cogen', () => {
    it('addTransformers', () => {
        const cogen = new Cogen()
        const transformers = {
            css: {
                _() {},
                selector() {},

                rule: {
                    _() {},

                    selector() {}
                }
            },
            json: {
                _() {},
                object() {}
            }
        }
        cogen.addTransformers(transformers)
        expect(cogen.transformers).toEqual({
            css: transformers.css._,
            'css:rule': transformers.css.rule._,
            'css:rule:selector': transformers.css.rule.selector,
            'css:selector': transformers.css.selector,
            json: transformers.json._,
            'json:object': transformers.json.object,
        })
    })
})