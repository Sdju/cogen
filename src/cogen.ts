import type { BaseRules, Rules } from './rules'
import type { Target } from './target'
import { LineBuilder } from './builder'
import { mergeDeep } from './utils'

type Plugin = (cogen: Cogen) => void

type Transformer = () => void

interface TransformerDescription {
  [key: string]: Transformer | TransformerDescription
}

export class Cogen {
  public rules: Rules = Cogen.DEFAULT_RULES

  public target: Target = { __type: 'error:noTarget' }
  public builder: LineBuilder = new LineBuilder(this.rules as BaseRules)

  public use (plugin: Plugin): Cogen {
    plugin(this)
    return this
  }

  public pushBuilder (): Cogen {
    this.builderStack.push(this.builder)
    this.builder = new LineBuilder(this.rules as BaseRules)
    return this
  }

  public popBuilder (): Cogen {
    this.builder = this.builderStack.pop() as LineBuilder
    return this
  }

  public pushTarget<T extends Target>(target: T): Cogen {
    this.targetStack.push(this.target)
    this.target = target
    return this
  }

  public popTarget<T extends Target>(): T {
    const target = this.target
    this.target = this.targetStack.pop() as Target
    return target as T
  }

  public pushRules (rules: Rules): Cogen {
    this.rulesStack.push(this.rules)
    this.rules = mergeDeep({}, this.rules, rules) as Rules
    return this
  }

  public extendRules (rules: Rules): Cogen {
    this.rules = mergeDeep(this.rules, rules) as Rules
    return this
  }

  public popRules (): Cogen {
    this.rules = this.rulesStack.pop() as Rules
    return this
  }

  /**
     * Добавление произвольного генератора
     *
     * Особое имя для трансформатора: _ - ознгачает корень без постфикса
     * @Example addTransformers({
     *     css: {
     *         _() {
     *             ...
     *         }
     *
     *         selector() {
     *
     *         }
     *     },
     *     json: {
     *         _() {
     *             ...
     *         }
     *
     *         object() {
     *
     *         }
     *     }
     * })
     * Создаст 4 трансформатора css и css:selector, json и json:object
     * */
  public addTransformers (transformers: TransformerDescription, prefix: string = ''): Cogen {
    Object.entries(transformers).forEach(([name, transformer]) => {
      if (typeof transformer === 'object') {
        this.addTransformers(transformer, `${prefix}${name}:`)
        return
      }

      if (name === '_') {
        this.transformers[prefix.slice(0, -1)] = transformer
        return
      }
      this.transformers[prefix + name] = transformer
    })
    return this
  }

  /**
     * Выполяет трансформацию для текущего источника
     * */
  public run (): Cogen {
    const transformer = this.transformers[this.target.__type] as Transformer | undefined
    if (!transformer) {
      throw new Error(`Unresolved transformer type "${this.target.__type}"`)
    }
    transformer()
    return this
  }

  /**
     * Пытается выполнить трансформацию для указанного источника
     * */
  public runFor (target: Target): Cogen {
    this.pushTarget(target)
    this.run()
    this.popTarget()
    return this
  }

  /**
     * Выполяет генерацию кода с указанным контентом и правилами генерации
     * */
  public generateBy<T extends Target>(content: T, rules: Rules): string {
    this.pushRules(rules)
    this.pushTarget(content)
    this.pushBuilder()
    this.run()
    const result = this.builder.build()
    this.popBuilder()
    this.popRules()
    this.popTarget()
    return result
  }

  public static DEFAULT_RULES: BaseRules = {
    tab: '  ',
    minify: false
  }

  protected rulesStack: Rules[] = []
  protected targetStack: Target[] = []
  protected builderStack: LineBuilder[] = []
  public transformers: Record<string, Transformer> = {}
}
