import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import ApexCharts from 'apexcharts';


@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartBarComponent implements OnInit {
  chart:any;
  constructor() { }

  ngOnInit() {

  }
  callBarChart(chartData, x_categories,chartHeight,captions,customStyles) {
    let chartAlreadyExist = document.getElementById("#barChart");
    if (chartAlreadyExist) {
      chartAlreadyExist.style.display = 'none';
      let createDiv = document.createElement('div');
      createDiv.setAttribute("id", "barChart");
    }
    let chartTimer = setTimeout(() => {
      this.drawChart(chartData, x_categories,chartHeight,captions,customStyles)
      clearTimeout(chartTimer);
    }, 1);
  }

  drawChart(chartData, x_categories,chartHeight,captions,customStyles) {
    let series = [];
    chartData.forEach(e => {
      series.push(e.value);
    })
    var options = {
      chart: {
        id: 'bar_chart',
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
            chartData[dataPointIndex].transactions +
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
    this.chart = new ApexCharts(document.querySelector("#barChart"), options);
    this.chart.render();
    this.chart.resetSeries();
  }

  ngOnDestroy(){
    if(this.chart)
    this.chart.destroy();    
  }

}

