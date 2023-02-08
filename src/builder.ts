import {BaseRules, Rules} from './rules';
import {Cogen} from './cogen';

/**
 * Класс для генерации нашего кода более императивным путем
 * Имеет высокоуровневые абстрации для отступов и форматирования так же сам собирает строки из кусочков
 * * */
export class LineBuilder {
    /**
     * Набор имующихся строк у билдера
     * */
    lines: string[][] = []

    line: string[] = []

    /**
     * Хранение смещений при переходе между строками
     * */
    shiftStack: string[] = ['']

    /**
     * Хранение текущего смещения
     * */
    shift: string = ''

    /**
     * Хранение набора отступов стеком
     * */
    tabStack: string[] = ['']
    tab: string = ''

    /**
     * Набор правил для генерации кода, например используемый символ для отступа
     * */
    rules: BaseRules

    constructor(rules: BaseRules) {
        this.rules = rules
        this.tab = rules.tab
    }

    /**
     * Добавление некоторой части к строке
     * */
    add(part: string): LineBuilder {
        this.line.push(part)
        return this
    }

    /**
     * Аналогично lineBuilder.add, но игнорируется при минификации
     * */
    addWs(part: string): LineBuilder {
        if (!this.rules.minify) {
            this.line.push(part)
        }
        return this
    }

    /**
     * Аналогично lineBuilder.add, но только в случае выполнении condition
     * */
    addIf(condition: boolean, part: string) {
        if (condition) {
            this.line.push(part)
        }
        return this
    }

    /**
     * Аналогично lineBuilder.addWs и lineBuilder.addIf одновременно
     * */
    addWsIf(condition: boolean, part: string): LineBuilder {
        if (!this.rules.minify && condition) {
            this.line.push(part)
        }
        return this
    }

    /**
     * Добавляет отступ в стек отступов
     * */
    pushTab(tab: string): LineBuilder {
        if (this.rules.minify) {
            return this
        }
        this.tabStack.push(this.tab)
        this.tab = tab
        return this
    }

    /**
     * Переходит к предыдущему отступу в стеке отступов
     * */
    popTab(): LineBuilder {
        if (this.rules.minify) {
            return this
        }
        this.tab = this.tabStack.pop() as string
        return this
    }


    /**
     * Пересобирает текущие части строки как единую строку
     * */
    joinLine(): string {
        const string = this.line.join('')
        this.line = [string]
        return string
    }

    /**
     * Переходим на следующую строку с возможность сохранения смещения или его обнулением
     * */
    nextLine(withShift: boolean = true): LineBuilder {
        if (this.rules.minify) {
            return this
        }
        this.lines.push(this.line)
        this.line = withShift ? [this.shift] : ['']
        return this
    }

    nextLineIf(condition: boolean, withShift: boolean = true): LineBuilder {
        if (condition) {
            this.nextLine(withShift)
        }
        return this
    }

    /**
     * Увеличиваем отступ с возможностью перехода сразу на следующую строку
     * */
    levelUp(toNext: boolean = true): LineBuilder {
        if (this.rules.minify) {
            return this
        }

        this.shiftStack.push(this.shift)
        this.shift = this.shift + this.tab
        if (toNext) {
            this.nextLine()
        }
        return this
    }

    levelUpIf(condition: boolean, toNext: boolean = true): LineBuilder {
        if (condition) {
            this.levelUp(toNext)
        }
        return this
    }

    /**
     * Уменьшаем отступ с возможностью перехода сразу на следующую строку
     * */
    levelDown(toNext: boolean = true): LineBuilder {
        if (this.rules.minify) {
            return this
        }

        const prevShift = this.shift
        this.shift = this.shiftStack.pop() as string

        if (toNext) {
            this.nextLine()
            return this
        }

        const string = this.joinLine();
        if (string === prevShift) {
            this.line = [this.shift]
        }
        return this
    }

    /**
     * Сохраняем текущее положение как смещение для последующих строк напр
     *
     * let a = 1,
     *     b = 2,
     *     c = 3;
     * */
    saveAlignment(): LineBuilder {
        if (this.rules.minify) {
            return this
        }

        this.shiftStack.push(this.shift)
        this.shift += ' '.repeat(this.joinLine().length)
        return this
    }

    dropAlignment(): LineBuilder {
        if (this.rules.minify) {
            return this
        }

        this.shift = this.shiftStack.pop() as string
        return this
    }

    /**
     * Собираем все части в готовый код
     * */
    build(): string {
        const newLine = this.rules.minify ? '' : '\n'
        return [...this.lines, this.line]
            .map(parts => parts.join(''))
            .join(newLine)
    }

    doForTailAndHead<T, R extends Function = (element: T, isHead: boolean) => void >(
        target: T[],
        callback: R
    ): LineBuilder
    doForTailAndHead<
        T,
        R extends Function = (element: T, isHead: boolean) => void,
    >(
        target: T[],
        tailCallback: R,
        headCallback: R = tailCallback
    ): LineBuilder {
        target.slice(0, -1).forEach((value) => {
            tailCallback(value, false)
        })
        const lastElement = target[target.length - 1]
        if (lastElement) {
            headCallback(lastElement, true)
        }
        return this
    }
}