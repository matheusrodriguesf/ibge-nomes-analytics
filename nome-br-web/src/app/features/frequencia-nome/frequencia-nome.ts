import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { CensoNomeService } from '../../services/censo.nome.service';
import { FrequenciaNome } from '../../models/resultado-nome-frequencia';

@Component({
  selector: 'app-frequencia-nome',
  standalone: true,
  templateUrl: './frequencia-nome.html',
  styleUrl: './frequencia-nome.scss',
})
export class FrequenciaNomeComponent implements AfterViewInit {
  @ViewChild('timelineChartContainer', { static: true })
  private timelineContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('areaChartContainer', { static: true })
  private areaContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('barTimeChartContainer', { static: true })
  private barTimeContainer?: ElementRef<HTMLDivElement>;

  private frequenciaData: FrequenciaNome[] = [];
  readonly nomeAtual = 'JOAO';
  private readonly censoNomeService = inject(CensoNomeService);

  ngAfterViewInit(): void {
    void this.loadFrequenciaNome();
  }

  private async loadFrequenciaNome(): Promise<void> {
    const response = await this.censoNomeService.getFrequenciaNome(this.nomeAtual);
    this.frequenciaData = response[0]?.resultados ?? [];
    this.renderCharts();
  }

  private renderCharts(): void {
    const timelineContainer = this.timelineContainer?.nativeElement;
    const areaContainer = this.areaContainer?.nativeElement;
    const barTimeContainer = this.barTimeContainer?.nativeElement;

    if (
      !timelineContainer ||
      !areaContainer ||
      !barTimeContainer ||
      this.frequenciaData.length === 0
    ) {
      return;
    }

    d3.select(timelineContainer).selectAll('*').remove();
    d3.select(areaContainer).selectAll('*').remove();
    d3.select(barTimeContainer).selectAll('*').remove();

    this.renderTimelineChart(timelineContainer);
    this.renderAreaChart(areaContainer);
    this.renderBarTimeChart(barTimeContainer);
  }

  private createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
    return d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background-color', '#000')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('font-family', 'monospace')
      .style('pointer-events', 'none')
      .style('z-index', '9999')
      .style('max-width', '200px')
      .style('text-align', 'left')
      .style('opacity', '0')
      .style('transition', 'opacity 0.2s')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
  }

  private showTooltip(
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    x: number,
    y: number,
    text: string
  ): void {
    tooltip
      .style('left', `${x + 10}px`)
      .style('top', `${y + 10}px`)
      .html(text)
      .style('opacity', '1');
  }

  private hideTooltip(tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>): void {
    tooltip.style('opacity', '0');
  }

  private renderTimelineChart(container: HTMLDivElement): void {
    const width = 760;
    const height = 340;
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    const x = d3
      .scalePoint<string>()
      .domain(this.frequenciaData.map((item: FrequenciaNome) => item.periodo))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.frequenciaData, (item: FrequenciaNome) => item.frequencia) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineGenerator = d3
      .line<FrequenciaNome>()
      .x((item: FrequenciaNome) => x(item.periodo) ?? 0)
      .y((item: FrequenciaNome) => y(item.frequencia));

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')));

    svg
      .append('path')
      .datum(this.frequenciaData)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    svg
      .append('g')
      .selectAll('circle')
      .data<FrequenciaNome>(this.frequenciaData)
      .join('circle')
      .attr('cx', (item: FrequenciaNome) => x(item.periodo) ?? 0)
      .attr('cy', (item: FrequenciaNome) => y(item.frequencia))
      .attr('r', 5)
      .attr('fill', 'currentColor')
      .attr('fill-opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, item: FrequenciaNome) => {
        const absoluteX = rect.left + event.offsetX + window.scrollX;
        const absoluteY = rect.top + event.offsetY + window.scrollY;
        const labels = item.periodo.split(',');
        const periodLabel = labels.length > 1 ? `${labels[0]}-${labels[1]}` : labels[0];
        const tooltipText = `<strong>Período:</strong> ${periodLabel}<br/><strong>Frequência:</strong> ${d3.format(',d')(item.frequencia)}`;
        this.showTooltip(tooltip, absoluteX, absoluteY, tooltipText);
      })
      .on('mouseleave', () => {
        this.hideTooltip(tooltip);
      });

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Evolução temporal');
  }

  private renderAreaChart(container: HTMLDivElement): void {
    const width = 760;
    const height = 340;
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    const x = d3
      .scalePoint<string>()
      .domain(this.frequenciaData.map((item: FrequenciaNome) => item.periodo))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.frequenciaData, (item: FrequenciaNome) => item.frequencia) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const areaGenerator = d3
      .area<FrequenciaNome>()
      .x((item: FrequenciaNome) => x(item.periodo) ?? 0)
      .y0(height - margin.bottom)
      .y1((item: FrequenciaNome) => y(item.frequencia));

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')));

    svg
      .append('path')
      .datum(this.frequenciaData)
      .attr('fill', 'currentColor')
      .attr('fill-opacity', 0.3)
      .attr('d', areaGenerator);

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    svg
      .append('g')
      .selectAll('rect')
      .data<FrequenciaNome>(this.frequenciaData)
      .join('rect')
      .attr('x', (item: FrequenciaNome) => (x(item.periodo) ?? 0) - 8)
      .attr('y', margin.top)
      .attr('width', 16)
      .attr('height', height - margin.bottom - margin.top)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, item: FrequenciaNome) => {
        const absoluteX = rect.left + event.offsetX + window.scrollX;
        const absoluteY = rect.top + event.offsetY + window.scrollY;
        const labels = item.periodo.split(',');
        const periodLabel = labels.length > 1 ? `${labels[0]}-${labels[1]}` : labels[0];
        const tooltipText = `<strong>Período:</strong> ${periodLabel}<br/><strong>Frequência:</strong> ${d3.format(',d')(item.frequencia)}`;
        this.showTooltip(tooltip, absoluteX, absoluteY, tooltipText);
      })
      .on('mouseleave', () => {
        this.hideTooltip(tooltip);
      });

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Área - Frequência acumulada');
  }

  private renderBarTimeChart(container: HTMLDivElement): void {
    const width = 760;
    const height = 340;
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    const x = d3
      .scaleBand<string>()
      .domain(this.frequenciaData.map((item: FrequenciaNome) => item.periodo))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.frequenciaData, (item: FrequenciaNome) => item.frequencia) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')));

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    svg
      .append('g')
      .selectAll('rect')
      .data<FrequenciaNome>(this.frequenciaData)
      .join('rect')
      .attr('x', (item: FrequenciaNome) => x(item.periodo) ?? 0)
      .attr('y', (item: FrequenciaNome) => y(item.frequencia))
      .attr('width', x.bandwidth())
      .attr('height', (item: FrequenciaNome) => y(0) - y(item.frequencia))
      .attr('fill', 'currentColor')
      .attr('fill-opacity', 0.75)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, item: FrequenciaNome) => {
        const absoluteX = rect.left + event.offsetX + window.scrollX;
        const absoluteY = rect.top + event.offsetY + window.scrollY;
        const labels = item.periodo.split(',');
        const periodLabel = labels.length > 1 ? `${labels[0]}-${labels[1]}` : labels[0];
        const tooltipText = `<strong>Período:</strong> ${periodLabel}<br/><strong>Frequência:</strong> ${d3.format(',d')(item.frequencia)}`;
        this.showTooltip(tooltip, absoluteX, absoluteY, tooltipText);
      })
      .on('mouseleave', () => {
        this.hideTooltip(tooltip);
      });

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Barras - Por período');
  }
}
