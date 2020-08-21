import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import ApexCharts from 'apexcharts';


@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartBarComponent implements OnInit {
  chart:any;
  input :any;
  chartData:any;
  id:string;
  @Input('inputData')
  set inputval(val) {
    if(val){
      this.id = val.id;
      this.input = val;
      if(this.chart){
        this.chartData = val.chartData;
        let series = [];
        this.chartData.forEach(e => {
          series.push(e.value);
        })
        ApexCharts.exec(this.id, "updateOptions", {
          xaxis: {
            categories: val.x_categories
          },
          series: [
            {          
              data: series //actual data
            },
          ]
        });
      }
    }
  }

  options:any;
  @ViewChild('barChart', { static: false }) barChart;
  constructor() { }

  ngOnInit() {
    
  }
  ngAfterViewInit() {
    if(this.input && this.barChart){
      this.drawChart(this.input.chartData, 
        this.input.x_categories,
        this.input.chartHeight,
        this.input.captions,
        this.input.customStyles);
    }
  }
  
  drawChart(chartData, x_categories,chartHeight,captions,customStyles) {
    this.chartData = chartData;
    let series = [];
    this.chartData.forEach(e => {
      series.push(e.value);
    })
    this.options = {
      chart: {
        id: this.id, //'bar_chart',
        height: chartHeight,
        type: "bar",
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
              opacity:1
            }],
            backgroundBarColors: customStyles.backgroundBarColors,
            backgroundBarOpacity: customStyles.backgroundBarOpacity,            
          },
        },
      },
      series: [
        {          
          data: series //actual data
        },
      ],
      xaxis: {
        categories: x_categories,
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
        min: 0, //function(min){return min},
        // max: function (maxRev) { return maxRev },
        max: function (maxRev) {
          let conversion = (maxRev+ (10-(maxRev % 10)))
          let powOf = conversion.toString().length -1;          
          return  conversion+Math.pow(10,powOf)          
        },
        decimalsInFloat:0,
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
        custom: function ({ series, seriesIndex, dataPointIndex }) {
          return (
            '<div class="bar_tooltip_container">' +
            '<div class="bar_tooltip_header">' +
            "<span>" +
            captions.currencySymbol + series[seriesIndex][dataPointIndex] +
            "</span>" +
            "</div>" +
            '<div class="bar_tooltip_content">' +
            captions.NoOfTransactions+' : '+
            this.chartData[dataPointIndex].transactions +
            "</div>" +
            "</div>"
          );
        }
      },
      fill: {
        colors: customStyles.fillColor,
        opacity: 1
      },
    };

    this.chart = new ApexCharts( this.barChart.nativeElement.childNodes[0], this.options);
    this.chart.render();
  }

  ngOnDestroy(){
    if(this.chart)
    this.chart.destroy();    
  }

}

