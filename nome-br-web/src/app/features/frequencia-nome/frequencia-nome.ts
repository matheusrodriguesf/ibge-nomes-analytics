import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as d3 from 'd3';
import { CensoNomeService } from '../../services/censo.nome.service';
import { FrequenciaNome } from '../../models/resultado-nome-frequencia';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent } from '@angular/material/paginator';
import {
  PaginatedTable,
  PaginatedTableColumn,
  TableValue,
} from '../../shared/components/paginated-table/paginated-table';
import { LocalidadeService } from '../../services/localidade.service';
import { SelectEstadoItem } from '../../models/select-estado-item';
import { SelectDistritoItem } from '../../models/select-distrito-item';

@Component({
  selector: 'app-frequencia-nome',
  templateUrl: './frequencia-nome.html',
  styleUrl: './frequencia-nome.scss',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    PaginatedTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequenciaNomeComponent {
  private readonly timelineContainer = viewChild<ElementRef<HTMLDivElement>>('timelineChartContainer');

  private readonly numberFormatter = new Intl.NumberFormat('pt-BR');

  private frequenciaData: FrequenciaNome[] = [];
  private municipiosRequestId = 0;

  readonly searchForm = new FormGroup({
    nome: new FormControl('', { nonNullable: true }),
    estadoId: new FormControl<number | null>(null),
    municipioId: new FormControl<number | null>({ value: null, disabled: true }),
  });

  readonly columns: PaginatedTableColumn[] = [
    {
      key: 'periodo',
      header: 'Período',
      formatter: (row) => this.formatPeriodo(String(row['periodo'])),
    },
    {
      key: 'frequencia',
      header: 'Frequência',
      align: 'end',
      formatter: (row) => this.numberFormatter.format(row['frequencia'] as number),
    },
  ];
  readonly pageSizeOptions: number[] = [5, 10, 25];

  tableData: Record<string, TableValue>[] = [];
  pagedTableData: Record<string, TableValue>[] = [];
  pageSize = 10;
  pageIndex = 0;
  nomeAtual = '';
  estados: SelectEstadoItem[] = [];
  municipios: SelectDistritoItem[] = [];

  private readonly censoNomeService = inject(CensoNomeService);
  private readonly localidadeService = inject(LocalidadeService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.searchForm.controls.estadoId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((estadoId) => {
        void this.onEstadoChange(estadoId);
      });

    void this.loadEstados();

    afterNextRender(() => {
      if (this.searchForm.controls.nome.value) {
        void this.onSearch();
      }
    });
  }

  async onSearch(): Promise<void> {
    const nomeNormalizado = this.searchForm.controls.nome.value.trim().toUpperCase();

    if (!nomeNormalizado) {
      return;
    }

    this.nomeAtual = nomeNormalizado;
    this.searchForm.controls.nome.setValue(nomeNormalizado, { emitEvent: false });
    await this.loadFrequenciaNome();
  }

  get localidadeAtual(): string {
    const municipioSelecionado = this.municipios.find(
      (municipio) => municipio.ibge === this.searchForm.controls.municipioId.value
    );

    if (municipioSelecionado) {
      return municipioSelecionado.nome;
    }

    const estadoSelecionado = this.estados.find(
      (estado) => estado.id === this.searchForm.controls.estadoId.value
    );

    return estadoSelecionado ? `${estadoSelecionado.nome} (${estadoSelecionado.sigla})` : 'Brasil';
  }

  get periodoPico(): string {
    if (!this.frequenciaData.length) return '—';
    const pico = this.frequenciaData.reduce((max, item) =>
      item.frequencia > max.frequencia ? item : max
    );
    const parts = pico.periodo.split(',');
    return parts.length > 1 ? `${parts[0]}–${parts[1]}` : parts[0];
  }

  get frequenciaMaxima(): string {
    if (!this.frequenciaData.length) return '—';
    const max = Math.max(...this.frequenciaData.map(i => i.frequencia));
    return this.numberFormatter.format(max);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
    this.changeDetectorRef.markForCheck();
  }

  private updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedTableData = this.tableData.slice(start, start + this.pageSize);
  }

  private async loadEstados(): Promise<void> {
    const estados = await this.localidadeService.getAllEstados();
    this.estados = [...estados].sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'));
    this.changeDetectorRef.markForCheck();
  }

  private async onEstadoChange(estadoId: number | null): Promise<void> {
    this.municipiosRequestId += 1;
    const requestId = this.municipiosRequestId;

    this.municipios = [];
    this.searchForm.controls.municipioId.reset(null, { emitEvent: false });

    if (!estadoId) {
      this.searchForm.controls.municipioId.disable({ emitEvent: false });
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.searchForm.controls.municipioId.enable({ emitEvent: false });
    this.changeDetectorRef.markForCheck();

    const municipios = await this.localidadeService.getDistritosByEstado(estadoId);

    if (requestId !== this.municipiosRequestId) {
      return;
    }

    this.municipios = [...municipios].sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'));
    this.changeDetectorRef.markForCheck();
  }

  private async loadFrequenciaNome(): Promise<void> {
    const localidadeSelecionada = this.searchForm.controls.municipioId.value ?? this.searchForm.controls.estadoId.value;
    const response = await this.censoNomeService.getFrequenciaNome(this.nomeAtual, localidadeSelecionada);
    this.frequenciaData = response[0]?.resultados ?? [];

    this.tableData = this.frequenciaData.map((item) => ({
      periodo: item.periodo,
      frequencia: item.frequencia,
    }));
    this.pageIndex = 0;
    this.updatePagedData();

    this.changeDetectorRef.detectChanges();
    this.renderCharts();
    this.changeDetectorRef.markForCheck();
  }

  private renderCharts(): void {
    const timelineContainer = this.timelineContainer()?.nativeElement;

    if (!timelineContainer || this.frequenciaData.length === 0) {
      return;
    }

    d3.select(timelineContainer).selectAll('*').remove();
    this.renderTimelineChart(timelineContainer);
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

  private formatPeriodo(periodo: string): string {
    const parts = periodo.split(',');
    return parts.length > 1 ? `${parts[0]}–${parts[1]}` : parts[0];
  }

  private renderTimelineChart(container: HTMLDivElement): void {
    const width = 1020;
    const height = 440;
    const margin = { top: 24, right: 32, bottom: 64, left: 80 };

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
      .call(d3.axisBottom(x).tickFormat((d) => this.formatPeriodo(d)))
      .selectAll('text')
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end')
      .style('font-size', '14px')
      .style('font-weight', '500');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat((d) => this.numberFormatter.format(d as number)))
      .selectAll('text')
      .style('font-size', '14px');

    svg
      .append('path')
      .datum(this.frequenciaData)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    const tooltip = this.createTooltip();
    const rect = container.getBoundingClientRect();

    const annotationGroup = svg.append('g').attr('class', 'annotation');
    let pinnedPeriodo: string | null = null;

    const clearAnnotation = (): void => {
      annotationGroup.selectAll('*').remove();
      pinnedPeriodo = null;
    };

    const pinAnnotation = (cx: number, cy: number, item: FrequenciaNome): void => {
      annotationGroup.selectAll('*').remove();
      const label = this.formatPeriodo(item.periodo);
      const value = this.numberFormatter.format(item.frequencia);
      const text = `${label}: ${value}`;

      const padding = { x: 10, y: 6 };
      const offsetX = cx + 12;
      const offsetY = cy - 18;

      annotationGroup
        .append('line')
        .attr('x1', cx)
        .attr('y1', cy)
        .attr('x2', offsetX + 4)
        .attr('y2', offsetY + padding.y)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '3,2')
        .attr('opacity', 0.5);

      const textEl = annotationGroup
        .append('text')
        .attr('x', offsetX + padding.x)
        .attr('y', offsetY + padding.y + 1)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .text(text);

      const bbox = (textEl.node() as SVGTextElement).getBBox();

      annotationGroup
        .insert('rect', 'text')
        .attr('x', bbox.x - padding.x)
        .attr('y', bbox.y - padding.y)
        .attr('width', bbox.width + padding.x * 2)
        .attr('height', bbox.height + padding.y * 2)
        .attr('rx', 6)
        .attr('fill', 'currentColor')
        .attr('opacity', 0.12)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3);
    };

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
        const tooltipText = `<strong>Período:</strong> ${this.formatPeriodo(item.periodo)}<br/><strong>Frequência:</strong> ${this.numberFormatter.format(item.frequencia)}`;
        this.showTooltip(tooltip, absoluteX, absoluteY, tooltipText);
      })
      .on('mouseleave', () => {
        this.hideTooltip(tooltip);
      })
      .on('click', (_event: MouseEvent, item: FrequenciaNome) => {
        this.hideTooltip(tooltip);
        if (pinnedPeriodo === item.periodo) {
          clearAnnotation();
        } else {
          pinnedPeriodo = item.periodo;
          pinAnnotation(x(item.periodo) ?? 0, y(item.frequencia), item);
        }
      });

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('opacity', '0.7')
      .text('Período');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('opacity', '0.7')
      .text('Frequência');
  }
}
