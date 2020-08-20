import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-chart-donut',
  templateUrl: './chart-donut.component.html',
  styleUrls: ['./chart-donut.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartDonutComponent implements OnInit {
  chart:any;
  @Input() inputData;
  constructor() { }

  ngOnInit() { 
    // console.log("inputData ",this.inputData);
    this.drawChart();
  }
    
  drawChart() {
    var options = {
      chart: {
        type: 'donut',
        height: this.inputData.Chartheight,
        width: "100%"
      },
      colors: this.inputData.customStyles.colors,
      series: this.inputData.series,
      labels: [this.inputData.captions.inactiveCourses, this.inputData.captions.activeCourses],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false
      },
      states:{
        active: {
          allowMultipleDataPointsSelection: true,
          filter: {
              type: 'none'
          }
      },
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            background: 'transparent',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                color: this.inputData.customStyles.labelColor,
                offsetY: 3
              },
              value: {
                show: true,
                fontSize: '16px',
                color: this.inputData.customStyles.labelColor,
                offsetY: -35,
                formatter: function (val) {
                  return val
                }
              },
              total: {
                show: true,
                label: this.inputData.captions.courses,
                color: this.inputData.customStyles.labelColor,
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0)
                }
              }
            }
          },
        }
      }
    }
    this.chart = new ApexCharts(document.querySelector("#chart"),options);
    this.chart.render();
    // this.chart.resetSeries();

  }
  ngOnDestroy(){
    if(this.chart)
    this.chart.destroy();    
  }
}




