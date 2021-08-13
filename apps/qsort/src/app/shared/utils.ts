export function flatten<T>(list: T[]): T[] {
    const flattenedArray = list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
    return flattenedArray as T[];
}

export const truncate = (value: string, limit: number) => {
    const trail = '...';
    return value.length > limit ? value.substring(0, limit) + trail : value;
};

export const getbaseUrl = (): string => {
    const pathArray = window.location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + '//' + host;
};

export const baseUrl = (url: string): string => {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + '//' + host;
};
// tslint:disable-next-line:no-unused-expression
export function getWordFinder(word: string) {
    return `\\b(${word})\\b`;             // finish remembering the match
}

function onlyUnique(value: any, index: any, self: string | any[]) {
    return self.indexOf(value) === index;
}

export function getUnique<T>(arr: T[]): T[] {
    return arr.filter(onlyUnique);
}

export function groupBy<T, K>(list: T[], getKey: (item: T) => K) {
    const map = new Map<K, T[]>();
    list.forEach((item) => {
        const key = getKey(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return Array.from(map);
}

export function capitalize(s: any) {
    if (typeof s !== 'string') {
        return '';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function sort<T, K>(list: T[], getKey: (item: T) => K, desc = false) {
    list.sort((a: T, b: T) => {
        const valueA = getKey(a);
        const valueB = getKey(b);
        if (valueA < valueB) {
            return !desc ? -1 : 1;
        } else if (valueA > valueB) {
            return !desc ? 1 : -1;
        } else {
            return 0;
        }
    });
    return list;
}


export interface Dictionary<T> {
    [Key: string]: T;
}

export const combine = <T>(list1: Array<T>, list2: Array<T>) => {
    if (list1) {
        if (list2) {
            return list1.concat(list2);
        }
        return list1;
    }
    return null;
};

export class Guid {
    private value: string = this.empty;
    public static newGuid(): Guid {
        return new Guid('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = (c == 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }));
    }
    public static get empty(): string {
        return '00000000-0000-0000-0000-000000000000';
    }
    public get empty(): string {
        return Guid.empty;
    }
    public static isValid(str: string): boolean {
        const validRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return validRegex.test(str);
    }

    constructor(value?: string) {
        if (value) {
            if (Guid.isValid(value)) {
                this.value = value;
            }
        }
    }
    public toString() {
        return this.value;
    }

    public toJSON(): string {
        return this.value;
    }
}