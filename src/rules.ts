export interface Rules {
    [key: string]: any
}

export interface BaseRules extends Rules {
    /**
     * Используемая строка как еденица отступа в коде
     * */
    tab: string

    /**
     * Использования максимально компактного кода (без использования преобразований в AST)
     * */
    minify: boolean
}
