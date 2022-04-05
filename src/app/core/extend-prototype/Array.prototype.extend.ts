
interface Array<T> {

    /**
     * returns maximum of given number array
     * @returns {number}
     * @memberof Array
     */
    max(): number;
    /**
     * Removes duplicates from the given array. The optional keyFn allows to specify
     * how elements are checked for equalness by returning a unique string for each.
     * @param {((t: T) => string | number)} [keyFn] filter function that returns unique key
     * @returns {T[]} 
     * @memberof Array
     */
    distinct(keyFn?: (t: T) => string | number): T[];

    /**The flat() method creates a new array with all sub-array elements concatenated 
     * into it recursively up to the specified depth */
    flat(): Array<T>;
}




(function () {

    Array.prototype.max = function (): number {
        let _this = this ? this : [];
        return _this.length > 0 ? Math.max(..._this) : 0;
    }


    Array.prototype.distinct = function <T>(keyFn?: (t: T) => string | number): T[] {
        if (!keyFn) {
            return this.filter((x: T, i: number, a: T[]) => a.indexOf(x) == i);
        }

        const seen: { [key: string]: boolean; } = Object.create(null);

        return this.filter((elem: T) => {
            const key = keyFn(elem);
            if (seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        });

    }


})();