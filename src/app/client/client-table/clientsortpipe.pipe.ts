import { Pipe, PipeTransform } from '@angular/core';
import { Utilities } from '../../shared/utilities/utilities';

@Pipe({
  name: 'clientsortpipe'
})
export class ClientsortpipePipe implements PipeTransform {
  constructor(private utils: Utilities) {

  }
  transform(inputArray: any[string], sortType?: string, defaultColHeader?: any, sortColumn?: string, sortColumnDatatype?: string): any[] {
      if (!inputArray) return [];
      if (sortColumn != null)
          defaultColHeader = sortColumn;
      if (!defaultColHeader) return inputArray;
      if (!sortType) return inputArray;
      if (inputArray.every(x => x[defaultColHeader] == '')) return inputArray;
      let utils: Utilities = this.utils;
      if (sortType == 'asc') {
          return inputArray.sort(function (row1, row2) {
              let firstRowValue;
              let secondRowValue;
              let rowDataType = 'string';
              if (sortColumnDatatype != null)
                  rowDataType = sortColumnDatatype;
              else if (typeof row1[defaultColHeader] !== 'undefined' || typeof row2[defaultColHeader] !== 'undefined')
                  rowDataType = typeof (row1[defaultColHeader]);
              if (defaultColHeader == 'dateOfBirth' || defaultColHeader == 'lastVisitedDate') {
                firstRowValue = row1[defaultColHeader] ? utils.getDate(row1[defaultColHeader]).getTime() : 0;
                secondRowValue = row2[defaultColHeader] ? utils.getDate(row2[defaultColHeader]).getTime() : 0;
              }
              else if (rowDataType == 'string') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
                  if (firstRowValue != null)
                      firstRowValue = firstRowValue.toLowerCase();
                  if (secondRowValue != null)
                      secondRowValue = secondRowValue.toLowerCase();
              }
              else if (rowDataType == 'number') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              }
              else if (rowDataType == 'boolean') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              }
              else if (rowDataType == 'object' && defaultColHeader == 'client') {
                  firstRowValue = row1[defaultColHeader].name;
                  secondRowValue = row2[defaultColHeader].name;
              }
              else {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              }
              if (firstRowValue == null) firstRowValue = '';
              if (secondRowValue == null) secondRowValue = '';
              if (firstRowValue < secondRowValue) {
                  return -1;
              } else if (firstRowValue > secondRowValue) {
                  return 1;
              } else {
                  return 0;
              }
          });
      }
      else if (sortType == 'desc') {
          return inputArray.sort(function (row1, row2) {
              let firstRowValue;
              let secondRowValue;
              let rowDataType = 'string';
              if (sortColumnDatatype != null)
                  rowDataType = sortColumnDatatype;
              else if (typeof row1[defaultColHeader] !== 'undefined' || typeof row2[defaultColHeader] !== 'undefined')
                  rowDataType = typeof (row1[defaultColHeader]);
                 if (defaultColHeader == 'dateOfBirth' || defaultColHeader == 'lastVisitedDate') {
                    firstRowValue = row1[defaultColHeader] ? utils.getDate(row1[defaultColHeader]).getTime() : 0;
                    secondRowValue = row2[defaultColHeader] ? utils.getDate(row2[defaultColHeader]).getTime() : 0;
                 }
                 else if (rowDataType == 'string') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
                  if (firstRowValue != null)
                      firstRowValue = firstRowValue.toLowerCase();
                  if (secondRowValue != null)
                      secondRowValue = secondRowValue.toLowerCase();
              }
              else if (rowDataType == 'number') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              } else if (rowDataType == 'boolean') {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              }
              else if (rowDataType == 'object' && defaultColHeader == 'client') {
                  firstRowValue = row1[defaultColHeader].name;
                  secondRowValue = row2[defaultColHeader].name;
              }
              else {
                  firstRowValue = row1[defaultColHeader];
                  secondRowValue = row2[defaultColHeader];
              }
              if (firstRowValue == null) firstRowValue = '';
              if (secondRowValue == null) secondRowValue = '';
              if (firstRowValue < secondRowValue) {
                  return 1;
              } else if (firstRowValue > secondRowValue) {
                  return -1;
              } else {
                  return 0;
              }
          });
      }


  }

}
