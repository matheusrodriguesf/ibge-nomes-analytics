import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

type ChartDatum = {
  name: string;
  total: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChild('chartContainer', { static: true })
  private chartContainer?: ElementRef<HTMLDivElement>;

  private readonly chartData: ChartDatum[] = [
    { name: 'Ana', total: 120 },
    { name: 'João', total: 95 },
    { name: 'Maria', total: 140 },
    { name: 'Pedro', total: 80 },
    { name: 'Lucas', total: 110 },
  ];

  ngAfterViewInit(): void {
    this.renderChart();
  }

  private renderChart(): void {
    const container = this.chartContainer?.nativeElement;

    if (!container) {
      return;
    }

    const width = 680;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')
      .attr('role', 'img')
      .attr('aria-label', 'Gráfico de barras com frequência de nomes');

    const x = d3
      .scaleBand<string>()
      .domain(this.chartData.map((item) => item.name))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const maxValue = d3.max(this.chartData, (item: ChartDatum) => item.total) ?? 0;

    const y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(5));

    svg
      .append('g')
      .selectAll('rect')
      .data<ChartDatum>(this.chartData)
      .join('rect')
      .attr('x', (item: ChartDatum) => x(item.name) ?? 0)
      .attr('y', (item: ChartDatum) => y(item.total))
      .attr('width', x.bandwidth())
      .attr('height', (item: ChartDatum) => y(0) - y(item.total))
      .attr('fill', 'currentColor');
  }
}
