import { Component, OnInit, ViewEncapsulation, ViewChild, Input, AfterViewInit, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';


@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartBarComponent implements OnInit , AfterViewInit , OnDestroy {
  chart: any;
  input: any;
  // chartData:any;
  id: string;
  @Input('inputData')
  set inputval(val) {
    if (val) {
      this.id = val.id;
      this.input = val;
      if (this.chart) {
        const chartData = val.chartData;
        const series = [];
        chartData.forEach(e => {
          series.push(e.value);
        });
        ApexCharts.exec(this.id, 'updateOptions', {
          xaxis: {
            categories: val.x_categories,
            title: {
              text: val.captions.x_label
            },
          },
          series: [
            {
              data: series // actual data
            },
          ],
          tooltip: {
            enabled: true,
            followCursor: true,
            onDatasetHover: {
              highlightDataSeries: true
            },
            custom({ series, seriesIndex, dataPointIndex }) {
              if (val.id == 'bar_chart1') {
                return (
                  '<div class="tooltip_container">' +
                  '<div class="tooltip_header">' +
                  '<span>' +
                  series[seriesIndex][dataPointIndex] +
                  '%' +
                  '</span>' +
                  '</div>' +
                  '<div *ngFor="let item of booked;let i=index">' +
                  '<div class="tooltip_content_booked">' + val.captions.booked + ' : ' + chartData[dataPointIndex].booked +
                  '</div>' +
                  '<div class="tooltip_content_available">' + val.captions.avail + ' : ' + chartData[dataPointIndex].avail +
                  '</div>' +
                  '</div>' +
                  '</div>'
                );
              } else if (val.id == 'bar_chart2') {
                return (
                  '<div class="tooltip_container">' +
                  '<div class="tooltip_header">' +
                  '<span>' +
                  series[seriesIndex][dataPointIndex] +
                  '%' +
                  '</span>' +
                  '</div>' +
                  '<div *ngFor="let item of booked;let i=index">' +
                  '<div class="tooltip_content_booked">' + val.captions.booked + ' : ' + chartData[dataPointIndex].booked +
                  '</div>' +
                  '<div class="tooltip_content_available">' + val.captions.avail + ' : ' + chartData[dataPointIndex].avail +
                  '</div>' +
                  '</div>' +
                  '</div>'
                );
              } else if (val.id == 'bar_chart3') {
                return (
                  '<div class="item_barchart_div">' +
                  val.captions.returnItems + ' : ' +
                  chartData[dataPointIndex].items +
                  '</div>'
                );
              }
            }
          },
        });
      }
    }
  }

  options: any;
  @ViewChild('barChart') barChart;
  constructor() { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    if (this.input && this.barChart) {
      this.drawChart(this.input.chartData,
        this.input.x_categories,
        this.input.chartHeight,
        this.input.captions,
        this.input.customStyles, this.input.id);
    }
  }

  drawChart(chartData, xcategories, chartHeight, captions, customStyles, id) {
    const series = [];
    chartData.forEach(e => {
      series.push(e.value);
    });
    this.options = {
      chart: {
        id,
        height: chartHeight,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false
        },
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: false
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: 'rounded',
          columnWidth: customStyles.columnWidth,
          // barHeight: '70%',
          distributed: false,
          colors: {
            ranges: [{
              color: customStyles.hoverColor,
              opacity: 1
            }],
            //backgroundBarColors: customStyles.backgroundBarColors,
            backgroundBarOpacity: customStyles.backgroundBarOpacity,
          },
        },
      },
      series: [
        {
          data: series // actual data
        },
      ],
      xaxis: {
        categories: xcategories,
        title: {
          text: captions.x_label
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false
        }
      },
      states: {
        normal: {
          filter: {
            type: 'none',
            value: 0,
          }
        },
        hover: {
          filter: {
            type: 'none',
            value: 0,
          }
        },
        active: {
          allowMultipleDataPointsSelection: true,
          filter: {
            type: 'none',
            value: 0,
          }
        },
      },
      yaxis: {
        seriesName: captions.y_label,
        tickAmount: 4,
        min: 0, // function(min){return min},
        // max: function (maxRev) { return maxRev },
        max(maxRev) {
          const conversion = (maxRev + (10 - (maxRev % 10)));
          const powOf = conversion.toString().length - 1;
          return conversion + Math.pow(10, powOf);
        },
        decimalsInFloat: 0,
        title: {
          text: captions.y_label,

        }
      },


      tooltip: {
        enabled: true,
        followCursor: true,
        onDatasetHover: {
          highlightDataSeries: true
        },
        custom({ series, seriesIndex, dataPointIndex }) {
          if (id == 'bar_chart1') {
            return (
              '<div class="tooltip_container">' +
              '<div class="tooltip_header">' +
              '<span>' +
              series[seriesIndex][dataPointIndex] +
              '%' +
              '</span>' +
              '</div>' +
              '<div *ngFor="let item of booked;let i=index">' +
              '<div class="tooltip_content_booked">' + captions.booked + ' : ' + chartData[dataPointIndex].booked +
              '</div>' +
              '<div class="tooltip_content_available">' + captions.avail + ' : ' + chartData[dataPointIndex].avail +
              '</div>' +
              '</div>' +
              '</div>'
            );
          } else if (id == 'bar_chart2') {
            return (
              '<div class="tooltip_container">' +
              '<div class="tooltip_header">' +
              '<span>' +
              series[seriesIndex][dataPointIndex] +
              '%' +
              '</span>' +
              '</div>' +
              '<div *ngFor="let item of booked;let i=index">' +
              '<div class="tooltip_content_booked">' + captions.booked + ' : ' + chartData[dataPointIndex].booked +
              '</div>' +
              '<div class="tooltip_content_available">' + captions.avail + ' : ' + chartData[dataPointIndex].avail +
              '</div>' +
              '</div>' +
              '</div>'
            );
          } else if (id == 'bar_chart3') {
            return (
              '<div class="item_barchart_div">' +
              captions.returnItems + ' : ' +
              chartData[dataPointIndex].items +
              '</div>'
            );
          }
        }
      },
      fill: {
        colors: customStyles.fillColor,
        opacity: 1
      },
    };

    this.chart = new ApexCharts(this.barChart.nativeElement.childNodes[0], this.options);
    this.chart.render();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

}

