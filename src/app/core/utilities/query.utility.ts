import { Injectable } from '@angular/core';
/**
 * Query class that contains expressions for type T
 * @export
 * @class Query - Class that contains expressions for type T
 * @template T generic type
 */

export class Query<T> {

    // Filters  - default as return true
    private query: ((x: T) => boolean);

    constructor() {
        this.and(null);
    }

    public and(expression: NonNullable<(data: T) => boolean>): Query<any> {
        const priorexpression = this.query;
        // include latest expression
        if (expression) {
            this.query = (x: T) => {
                if (typeof priorexpression == 'function') {
                    return priorexpression(x) && expression(x);
                } else {
                    return expression(x);
                }
            }
        }

        return this;
    }

    public apply(data: NonNullable<T[]>): T[] {
        let matches: T[] = [];
        if (this.query && data) {
            matches = data.filter(this.query);
        }
        return matches;
    }

}
