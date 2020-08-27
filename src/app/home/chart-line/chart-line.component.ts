import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, OnChanges } from '@angular/core';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-chart-line',
  templateUrl: './chart-line.component.html',
  styleUrls: ['./chart-line.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartLineComponent implements OnInit , OnDestroy , OnChanges {

  @Input() captionsLabel: any;
  @Input() categories: any[] = [];
  @Input() content: any[] = [];
  @Input() updateLineChartData: any;
  @Input() customStyles: any;
  update = false;
  chart: any;

  value: any = [];
  constructor() { }
  ngOnInit() {

  }

  draw(content, captionsLabel, categories, customStyles) {

    const options = {
      chart: {
        id: 'lineAreaChart',
        type: customStyles.type,
        height: customStyles.chartHeight,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 3,
        colors: customStyles.strokeColors,
        curve: 'smooth',
        lineCap: 'round'
      },
      series: [
        {
          name: 'series1',
          data: this.value
        }
      ],
      fill: {
        colors: customStyles.fillColor,
        opacity: 0.9,
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.5
        }
      },
      markers: {
        size: 0,
        colors: customStyles.fillColor,
        shape: 'circle',
        radius: 2
      },
      grid: {
        show: true,
        borderColor: customStyles.borderColor,
        strokeDashArray: 0,
        position: 'back',
        row: {
          opacity: 0.5
        },
        column: {
          opacity: 0.5
        },
        xaxis: {
          lines: { show: true }
        },
        yaxis: {
          lines: { show: true }
        }
      },

      tooltip: {
        enabled: true,
        followCursor: true,
        onDatasetHover: {
          highlightDataSeries: true
        },
        custom({ series, seriesIndex, dataPointIndex }) {
          return (
            '<div class="tooltip_container">' +
            '<div class="tooltip_header">' +
            '<span>' +
            series[seriesIndex][dataPointIndex] +
            '%' +
            '</span>' +
            '</div>' +
            '<div *ngFor="let item of booked;let i=index">' +
            '<div class="tooltip_content_booked">' + captionsLabel.booked + ': ' + content[dataPointIndex].Booked +
            '</div>' +
            '<div class="tooltip_content_available">' + captionsLabel.avail + ': ' + content[dataPointIndex].Available +
            '</div>' +
            '</div>' +
            '</div>'
          );
        }
      },
      xaxis: {
        categories,
        title: {
          text: captionsLabel.date,
          style: {
            fontSize: '15px'
          }
        },
        tooltip: {
          enabled: false
        } ,
        labels: {
          style: {
            fontSize: '10px'
          }
        },

        axisTicks: {
          show: false
        }
      },
      yaxis: [{
        show: true,
        showAlways: true,
        seriesName: 'Booking',
        tickAmount: 5,
        min: 0,
        max: 100,
        // max: function (maxRev) {
        //   return (maxRev + (10-(maxRev % 10))) },
        axisBorder: {
          colors: customStyles.borderColor,
          show: true,
          offsetX: 0,
          offsetY: 0,
          opacity: 0.5
        },
        title: {
          text: captionsLabel.booking
        },
        labels: {
          formatter(val, index) {
            return val + '%';
          }
        }
      }, {
        show: true,
        opposite: true,
        forceNiceScale: false,
        axisBorder: {
          colors: customStyles.borderColor,
          show: true,
        },
        labels: {
          show: false
        }
      }]
    };
    if (customStyles.type == 'line') {
      delete options.fill;
    }
    this.chart = new ApexCharts(document.querySelector('#linechart'), options);
    this.chart.render();
    this.chart.resetSeries();
  }
  ngOnChanges() {
    if (this.updateLineChartData && this.update) {
      this.updateConfig(this.updateLineChartData[0], this.updateLineChartData[1]);
    } else {
      this.content.forEach(element => {
        this.value.push(element.value);
      });
      this.draw(this.content, this.captionsLabel, this.categories, this.customStyles);
      this.update = true;
    }
  }

  updateConfig(data, captionsLabel) {
    this.value = [];
    data.forEach(e => {
      this.value.push(e.value);
    });
    this.updateChart(data, captionsLabel);
  }

  updateChart(data, captionsLabel) {
    ApexCharts.exec('lineAreaChart', 'updateOptions', {
      xaxis: {
        categories: this.categories

      },
      series: [
        {
          data: this.value
        }
      ],
      tooltip: {
        custom({ series, seriesIndex, dataPointIndex }) {
          return (
            '<div class="tooltip_container">' +
            '<div class="tooltip_header">' +
            '<span>' +
            series[seriesIndex][dataPointIndex] +
            '%' +
            '</span>' +
            '</div>' +
            '<div *ngFor="let item of booked;let i=index">' +
            '<div class="tooltip_content_booked">' + captionsLabel.booked + ': ' + data[dataPointIndex].Booked +
            '</div>' +
            '<div class="tooltip_content_available">' + captionsLabel.avail + ': ' + data[dataPointIndex].Available +
            '</div>' +
            '</div>' +
            '</div>'
          );
        }
      }
    });
  }
  ngOnDestroy() {
    if (this.chart) {
    this.chart.destroy();
    }
  }
}


