// quote.chart.ts
import Chart from 'chart.js/auto';

let chartInstance: Chart | null = null;

export function renderChart(canvas: HTMLCanvasElement) {

  // destroy old chart (prevents memory leaks)
  if (chartInstance) {
    chartInstance.destroy();
  }

  const values: number[] = [];
  const premiums: number[] = [];

  for (let v = 100000; v <= 1000000; v += 100000) {
    values.push(v);
    premiums.push(v * 0.002);
  }

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: values.map(v => `£${v / 1000}k`),
      datasets: [{
        label: 'Premium vs Property Value',
        data: premiums
      }]
    },
    options: {
      responsive: true
    }
  });
}