import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  input,
  effect,
  computed,
  runInInjectionContext,
  inject,
  Injector
} from '@angular/core';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

Chart.register(...registerables);

export interface PremiumHistoryPoint {
  propertyValue: number;
  annualPremium: number;
}

@Component({
  selector: 'app-premium-history-chart',
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas #premiumCanvas></canvas>
   </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 350px;
  }`]
})



export class PremiumHistoryChartComponent
  implements AfterViewInit {

  @ViewChild('premiumCanvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  annualPremium = input.required<number>();

  riskScore = input.required<number>();

  private chart?: Chart;

  private injector = inject(Injector);

  ngAfterViewInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.renderChart();
      });
    });
  }


  private renderChart(): void {

    if (!this.canvas) {
      return;
    }

    const data = computed(() =>
      this.generatePremiumHistory(
        this.riskScore()
      )
    );
    const historyData = data()

    this.chart?.destroy();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: historyData.map(
          d => `£${(d.propertyValue / 1000).toFixed(0)}k`
        ),
        datasets: [
          {
            label: 'Annual Premium (£)',
            data: historyData.map(
              d => d.annualPremium
            )
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };

    this.chart = new Chart(
      this.canvas.nativeElement,
      config
    );
  }

  private generatePremiumHistory(riskScore: number): PremiumHistoryPoint[] {

    const result: PremiumHistoryPoint[] = [];

    const basePremium = 350;

    const riskMultiplier =
      1 + this.riskScore() / 100;

    for (
      let value = 100000;
      value <= 1000000;
      value += 100000
    ) {

      const coverageLoadFactor =
        value / 500000;

      const premium =
        basePremium *
        riskMultiplier *
        coverageLoadFactor;

      result.push({
        propertyValue: value,
        annualPremium: Math.round(premium)
      });
    }

    return result;
  }
}