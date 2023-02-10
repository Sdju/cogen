import { describe, expect, it } from 'vitest'
import { Cogen } from '../../src'
import CssPlugin from '../../src/plugin/css'

describe('CSS generation', () => {
  it('simple test', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:rule',
          selector: 'body',
          content: [
            {
              __type: 'css:field',
              name: 'margin',
              content: '0'
            },
            {
              __type: 'css:field',
              name: 'min-height',
              content: '100vh'
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`body {
  margin: 0;
  min-height: 100vh;
}`)
  })

  it('multiple rules', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:rule',
          selector: 'body',
          content: [
            {
              __type: 'css:field',
              name: 'margin',
              content: '0'
            },
            {
              __type: 'css:field',
              name: 'min-height',
              content: '100vh'
            }
          ]
        },
        {
          __type: 'css:rule',
          selector: '.red > .green',
          content: [
            {
              __type: 'css:field',
              name: 'color',
              content: 'green'
            },
            {
              __type: 'css:field',
              name: 'background',
              content: 'red'
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`body {
  margin: 0;
  min-height: 100vh;
}

.red > .green {
  color: green;
  background: red;
}`)
  })

  it('multiple selectors', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:rule',
          selector: [
            'body',
            '.page',
            '.page--block'
          ],
          content: [
            {
              __type: 'css:field',
              name: 'margin',
              content: '0'
            },
            {
              __type: 'css:field',
              name: 'min-height',
              content: '100vh'
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`body,
.page,
.page--block {
  margin: 0;
  min-height: 100vh;
}`)
  })

  it('at rules', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:atRule',
          name: 'media',
          rule: 'all and (min-width: 563px)',
          content: [
            {
              __type: 'css:rule',
              selector: '.body',
              content: [
                {
                  __type: 'css:field',
                  name: 'margin',
                  content: '0'
                },
                {
                  __type: 'css:field',
                  name: 'min-height',
                  content: '100vh'
                }
              ]
            },
            {
              __type: 'css:rule',
              selector: '.body--light',
              content: [
                {
                  __type: 'css:field',
                  name: 'background',
                  content: 'white'
                }
              ]
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`@media all and (min-width: 563px) {
  .body {
    margin: 0;
    min-height: 100vh;
  }

  .body--light {
    background: white;
  }
}`)
  })

  it('comment', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:comment',
          content: 'Test'
        },

        {
          __type: 'css:rule',
          selector: 'body',
          content: [
            {
              __type: 'css:field',
              name: 'margin',
              content: '0'
            },
            {
              __type: 'css:field',
              name: 'min-height',
              content: '100vh'
            }
          ]
        }
      ]
    }, {})
    expect(result).eq(`/* Test */

body {
  margin: 0;
  min-height: 100vh;
}`)
  })

  it('descriptions', () => {
    const cogen = new Cogen()
    cogen.use(CssPlugin)
    const result = cogen.generateBy({
      __type: 'css',
      content: [
        {
          __type: 'css:rule',
          selector: 'body',
          description: 'My Block',
          content: [
            {
              __type: 'css:field',
              name: 'margin',
              description: 'margin',
              content: '0'
            },
            {
              __type: 'css:field',
              name: 'min-height',
              description: 'min-height',
              content: '100vh'
            }
          ]
        },

        {
          __type: 'css:atRule',
          description: 'includes',
          name: 'include',
          rule: "'src/includes.css'"
        }
      ]
    }, {})
    expect(result).eq(`/* My Block */
body {
  /* margin */
  margin: 0;

  /* min-height */
  min-height: 100vh;
}

/* includes */
@include 'src/includes.css';`)
  })
})
