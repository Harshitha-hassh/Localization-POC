import { Injectable } from '@angular/core';
/**
 * Query class that contains expressions for type T
 * @export
 * @class Query - Class that contains expressions for type T
 * @template T generic type
 */

export class Query<T> {

    // Filters  - default as return true
    private _query: ((x: T) => boolean);

    constructor() {
        this.and(null);
    }

    public and(expression: NonNullable<(data: T) => boolean>): Query<any> {
        var priorexpression = this._query;
        // include latest expression
        if (expression) {
            this._query = (x: T) => {
                if (typeof priorexpression == 'function') {
                    return priorexpression(x) && expression(x);
                }
                else {
                    return expression(x);
                }
            }
        }

        return this;
    }

    public apply(data: NonNullable<T[]>): T[] {
        var matches: T[] = [];
        if (this._query && data) {
            matches = data.filter(this._query);
        }
        return matches;
    }

}