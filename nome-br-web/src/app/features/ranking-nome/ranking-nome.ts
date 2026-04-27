import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { CensoNomeService } from '../../services/censo.nome.service';
import { RankingNomeItem } from '../../models/resultado-nome-ranking';
import {
  PaginatedTable,
  PaginatedTableColumn,
  TableValue,
} from '../../shared/components/paginated-table/paginated-table';
import { PageEvent } from '@angular/material/paginator';

type ChartDatum = {
  name: string;
  total: number;
  rank: number;
};

@Component({
  selector: 'app-ranking-nome',
  standalone: true,
  templateUrl: './ranking-nome.html',
  styleUrl: './ranking-nome.scss',
  imports: [PaginatedTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingNomeComponent {

  private readonly numberFormatter = new Intl.NumberFormat('pt-BR');

  private readonly barChartContainer = viewChild<ElementRef<HTMLDivElement>>('barChartContainer');
  private readonly donutChartContainer = viewChild<ElementRef<HTMLDivElement>>('donutChartContainer');

  private chartData: ChartDatum[] = [];

  readonly columns: PaginatedTableColumn[] = [
    { key: 'ranking', header: 'Ranking', align: 'end' },
    { key: 'nome', header: 'Nome' },
    { key: 'frequencia', header: 'Frequência', align: 'end' },
  ];
  readonly pageSizeOptions: number[] = [5, 10, 25, 100];

  pageSize = 10;
  pageIndex = 0;
  topNomes: RankingNomeItem[] = [];
  tableData: Record<string, TableValue>[] = [];
  pagedTableData: Record<string, TableValue>[] = [];

  private readonly censoNomeService = inject(CensoNomeService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    afterNextRender(() => {
      void this.loadRankingNome();
    });
  }

  private async loadRankingNome(): Promise<void> {
    const rankingResponse = await this.censoNomeService.getRankingNome();
    const [primeiro] = Array.isArray(rankingResponse) ? rankingResponse : [];
    const resultado = Array.isArray(primeiro?.resultado) ? primeiro.resultado : [];
    this.topNomes = resultado;
    this.tableData = resultado.map((item: RankingNomeItem) => ({
      ranking: item.ranking,
      nome: item.nome,
      frequencia: item.frequencia,
    }));
    this.chartData = [...resultado]
      .sort((first: RankingNomeItem, second: RankingNomeItem) => first.ranking - second.ranking)
      .slice(0, 10)
      .map((item: RankingNomeItem) => ({
        name: item.nome,
        total: item.frequencia,
        rank: item.ranking,
      }));
    this.pageIndex = 0;
    this.updatePagedData();
    this.changeDetectorRef.detectChanges();
    this.renderCharts();

  }
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  get primeiroNome(): string {
    return this.topNomes[0]?.nome ?? '—';
  }

  get primeiraFrequencia(): string {
    return this.formatNumber(this.topNomes[0]?.frequencia ?? 0);
  }

  formatNumber(value: number): string {
    return this.numberFormatter.format(value);
  }

  private updatePagedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTableData = this.tableData.slice(startIndex, endIndex);
  }

  private renderCharts(): void {
    const barContainer = this.barChartContainer()?.nativeElement;
    const donutContainer = this.donutChartContainer()?.nativeElement;

    if (!barContainer || !donutContainer || this.chartData.length === 0) {
      return;
    }

    d3.select(barContainer).selectAll('*').remove();
    d3.select(donutContainer).selectAll('*').remove();

    this.renderBarChart(barContainer);
    this.renderDonutChart(donutContainer);
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

  private renderBarChart(container: HTMLDivElement): void {
    const width = 760;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 60, left: 70 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    const x = d3
      .scaleBand<string>()
      .domain(this.chartData.map((item: ChartDatum) => item.name))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.chartData, (item: ChartDatum) => item.total) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format('.2s')));

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    svg
      .append('g')
      .selectAll('rect')
      .data<ChartDatum>(this.chartData)
      .join('rect')
      .attr('x', (item: ChartDatum) => x(item.name) ?? 0)
      .attr('y', (item: ChartDatum) => y(item.total))
      .attr('width', x.bandwidth())
      .attr('height', (item: ChartDatum) => y(0) - y(item.total))
      .attr('fill', 'currentColor')
      .attr('fill-opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, item: ChartDatum) => {
        const absoluteX = rect.left + event.offsetX + window.scrollX;
        const absoluteY = rect.top + event.offsetY + window.scrollY;
        const tooltipText = `<strong>${item.name}</strong><br/>Ranking: #${item.rank}<br/>Frequência: ${d3.format(',d')(item.total)}`;
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
      .text('Top 10 nomes (ranking)');
  }

  private renderDonutChart(container: HTMLDivElement): void {
    const width = 420;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 20;

    const pie = d3
      .pie<ChartDatum>()
      .sort(null)
      .value((item: ChartDatum) => item.total);

    const arc = d3
      .arc<d3.PieArcDatum<ChartDatum>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const pieData = pie(this.chartData.slice(0, 5));

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    const palette = d3.scaleLinear<number, number>().domain([0, pieData.length - 1]).range([0.35, 0.95]);

    const chartGroup = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    chartGroup
      .selectAll('path')
      .data(pieData)
      .join('path')
      .attr('d', arc)
      .attr('fill', 'currentColor')
      .attr('fill-opacity', (_datum: d3.PieArcDatum<ChartDatum>, index: number) => palette(index))
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, datum: d3.PieArcDatum<ChartDatum>) => {
        const absoluteX = rect.left + event.offsetX + window.scrollX;
        const absoluteY = rect.top + event.offsetY + window.scrollY;
        const tooltipText = `<strong>${datum.data.name}</strong><br/>Ranking: #${datum.data.rank}<br/>Frequência: ${d3.format(',d')(datum.data.total)}`;
        this.showTooltip(tooltip, absoluteX, absoluteY, tooltipText);
      })
      .on('mouseleave', () => {
        this.hideTooltip(tooltip);
      });

    const labelArc = d3
      .arc<d3.PieArcDatum<ChartDatum>>()
      .innerRadius(radius * 0.78)
      .outerRadius(radius * 0.78);

    chartGroup
      .selectAll('text')
      .data(pieData)
      .join('text')
      .attr('transform', (datum: d3.PieArcDatum<ChartDatum>) => {
        const position = labelArc.centroid(datum);
        return `translate(${position[0]}, ${position[1]})`;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .text((datum: d3.PieArcDatum<ChartDatum>) => datum.data.name);
  }
}
