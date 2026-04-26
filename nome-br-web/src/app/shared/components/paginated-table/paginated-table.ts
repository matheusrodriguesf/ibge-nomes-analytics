import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

export type TableValue = string | number | boolean | null | undefined;

export interface PaginatedTableColumn {
  key: string;
  header: string;
  align?: 'start' | 'center' | 'end';
  formatter?: (row: Record<string, TableValue>) => TableValue;
}

export interface PaginatedTableAction {
  id: string;
  icon: string;
  label: string;
}

export interface PaginatedTableActionEvent {
  actionId: string;
  row: Record<string, TableValue>;
}

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule],
  templateUrl: './paginated-table.html',
  styleUrl: './paginated-table.scss',
})
export class PaginatedTable {
  @Input() data: Record<string, TableValue>[] = [];
  @Input() columns: PaginatedTableColumn[] = [];
  @Input() actions: PaginatedTableAction[] = [];
  @Input() emptyMessage = 'Nenhum registro encontrado.';

  @Input() length = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() actionClick = new EventEmitter<PaginatedTableActionEvent>();

  get displayedColumns(): string[] {
    const keys = this.columns.map((column: PaginatedTableColumn) => column.key);
    return this.actions.length > 0 ? [...keys, '__actions'] : keys;
  }

  resolveCellValue(row: Record<string, TableValue>, column: PaginatedTableColumn): TableValue {
    if (column.formatter) {
      return column.formatter(row);
    }

    return row[column.key];
  }

  getCellAlignment(column: PaginatedTableColumn): string {
    return column.align ?? 'start';
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onActionClick(actionId: string, row: Record<string, TableValue>): void {
    this.actionClick.emit({ actionId, row });
  }
}
