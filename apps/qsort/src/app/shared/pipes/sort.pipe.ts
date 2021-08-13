import { Pipe, PipeTransform } from '@angular/core';
import { sort } from './../utils';

@Pipe({
  name: 'sort'
})
export class ArraySortPipe implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return sort(array, (item) => item[field]);
  }
}

