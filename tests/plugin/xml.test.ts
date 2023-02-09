import { describe, expect, it } from 'vitest'
import { Cogen } from '../../src'
import xmlLoader from '../../src/plugin/xml'

describe('XML generation', () => {
  it('simple test', () => {
    const cogen = new Cogen()
    cogen.use(xmlLoader)
    const result = cogen.generateBy({
      __type: 'xml',
      content: [
        {
          __type: 'xml:tag',
          name: 'abcd',
          content: [
            {
              __type: 'xml:tag',
              name: 'hello',
              attributes: {
                target: 'world'
              }
            },
            {
              __type: 'xml:tag',
              name: 'product',
              content: [
                {
                  __type: 'xml:tag',
                  name: 'product-image',
                  attributes: {
                    src: '/bla/bla',
                    'lazy-load': true
                  }
                },
                {
                  __type: 'xml:tag',
                  name: 'product-name',
                  content: [
                    {
                      __type: 'xml:content',
                      content: 'box'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`<abcd>
    <hello target="world" />
    <product>
        <product-image src="/bla/bla" lazy-load />
        <product-name>
            box
        </product-name>
    </product>
</abcd>`)
  })
})
