export const GreenChart = 'hsl(142.56deg 71% 65%)';
export const RedChart = 'hsl(0deg 71% 65%)';
export const GrayChart = '#E0E0E0';
export const BlueChart = 'hsl(208deg 100% 35%)';

export const LightChartColors = [
  'hsl(190, 70%, 75%)',   // Light Teal
  'hsl(280, 60%, 85%)',   // Light Purple
  'hsl(60, 75%, 80%)',    // Light Yellow
  'hsl(160, 65%, 75%)',   // Light Green-Blue
  'hsl(330, 70%, 85%)',   // Light Pink
  'hsl(220, 65%, 80%)',   // Light Blue
  'hsl(100, 60%, 85%)',   // Light Yellow-Green
  'hsl(350, 65%, 80%)',   // Light Red-Pink
  'hsl(25, 85%, 80%)',    // Light Orange
  'hsl(120, 55%, 75%)'    // Light Green
];

export const ChartColors = {
  backgroundColor: [GreenChart, RedChart],
  pieDonutColors: LightChartColors

  //   hoverBackgroundColor: ['#4CAF50', '#F44336'],
  //   borderColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
  //   hoverBorderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
};

export const ChartViewSettings = {
  hoverOffset: 20,
  borderWidth: 0.5,
  borderJoinStyle: 'round',
  hoverBorderColor: 'transparent',
}

export const BaseChartAnimation = {
  duration: 1500,
  easing: 'easeOutBounce',
  delay: 200,
  animateScale: true,
};

export const ChartDoughnutAnimation = {
  animateRotate: true,
  ...BaseChartAnimation,
};

export const ChartBarAnimation = {
  animateRotate: false,
  ...BaseChartAnimation,
};

export const ChartLineAnimation = {
  tension: 0.4, // "Curve" effect for the line chart (makes the line smoother)
  ...BaseChartAnimation,
};

export const TooltipChart = {
  enabled: true,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  titleColor: '#333',
  font: { // Changed from titleFont to font
    family: "'Heebo', sans-serif",
    size: 14,
    weight: 'bold',
  },
  bodyColor: '#666',
  bodyFont: { // Kept bodyFont as it is a valid property for body text
    family: "'Heebo', sans-serif",
    size: 12,
    
  },

  boxWidth: 6,
  boxHeight: 6,

  borderColor: 'rgba(0, 0, 0, 0.1)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 6,
  displayColors: true,
  usePointStyle: true,
  rtl: true,

};

export const ChartDefaultSettings = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.8,

  interaction: {
    mode: 'index',
    intersect: false,
  },
  hover: {
    mode: 'nearest',
    intersect: true,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#666',
        font: {
          size: 12
        }
      }
    },
    x: {
      grid: {
        display: true
      },
      ticks: {
        color: '#666',
        font: {
          size: 12
        }
      }
    }
  },

  elements: {
    line: {
      tension: 0.4,
      borderWidth: 1
    },
    point: {
      radius: 2,
      hoverRadius: 4,

      backgroundColor: 'rgb(36, 127, 225)',
      borderColor: 'white',
      borderWidth: 1
    }
  },
  layout: {
    padding: {
      top: 10,
      right: 10,
      bottom: 80,
      left: 0
    }
  },


  devicePixelRatio: window.devicePixelRatio || 1,
  locale: 'he-IL',
};




export function createLinearGradient(
  chart: any,
  colorTop: string,
  colorBottom: string
): CanvasGradient | string {
  const ctx = chart?.ctx;
  const area = chart?.chartArea;

  if (!ctx || !area) {
    // fallback if chart is not ready yet
    return colorTop;
  }

  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);

  return gradient;
}


// export const ChartColorSets = {
//     incomeVsExpense: {
//       backgroundColor: [GreenChart, RedChart],
//       hoverBackgroundColor: ['#4CAF50', '#F44336'],
//       borderColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
//       hoverBorderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
//     },
//     balanceChart: {
//       backgroundColor: [BlueChart, GrayChart],
//       hoverBackgroundColor: ['#1976D2', '#BDBDBD'],
//       borderColor: ['rgba(33, 150, 243, 0.2)', 'rgba(158, 158, 158, 0.2)'],
//       hoverBorderColor: ['rgba(33, 150, 243, 1)', 'rgba(158, 158, 158, 1)'],
//     }
//   };
