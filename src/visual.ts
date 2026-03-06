/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import PrimitiveValue = powerbi.PrimitiveValue;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VisualFormattingSettingsModel } from "./settings";
import {
    DashboardPoint,
    DashboardV7Visual,
    DashboardV7VisualProps,
    SortDirection,
    SortField
} from "./DashboardV7Visual";

interface MetricByRole {
    measure?: number | null;
    senhasRet?: number | null;
    senhasAte?: number | null;
    volAbn?: number | null;
    pctAbn?: number | null;
    pctOver?: number | null;
    sla10?: number | null;
    tme?: number | null;
    tma?: number | null;
    fteMed?: number | null;
    taxaOcp?: number | null;
    aderencia?: number | null;
}

interface DataPoint extends MetricByRole {
    key: string;
    category: string;
    selectionId: ISelectionId;
    selected: boolean;
}

const ROLE_ORDER: Array<keyof MetricByRole> = [
    "senhasRet",
    "senhasAte",
    "volAbn",
    "pctAbn",
    "pctOver",
    "sla10",
    "tme",
    "tma",
    "fteMed",
    "taxaOcp",
    "aderencia",
    "measure"
];

export class Visual implements IVisual {
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private root: Root;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private points: DataPoint[] = [];
    private selectedKeys: Set<string> = new Set<string>();
    private sortField: SortField = "category";
    private sortDirection: SortDirection = "asc";

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.root = createRoot(options.element);
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews?.[0]
        );
        this.points = this.buildPoints(options.dataViews?.[0]);
        this.render();
    }

    private buildPoints(dataView: DataView | undefined): DataPoint[] {
        const categoryColumn: DataViewCategoryColumn | undefined = dataView?.categorical?.categories?.[0];
        const valueColumns: DataViewValueColumns | undefined = dataView?.categorical?.values;
        if (!categoryColumn || !valueColumns) {
            return [];
        }

        const valueByRole = this.indexValueColumnsByRole(valueColumns);
        return categoryColumn.values.map((category: PrimitiveValue, index: number) => {
            const metric: MetricByRole = {};
            ROLE_ORDER.forEach((role: keyof MetricByRole) => {
                metric[role] = this.readNumericValue(valueByRole[role], index);
            });

            const selectionId = this.host.createSelectionIdBuilder().withCategory(categoryColumn, index).createSelectionId();
            return {
                key: selectionId.getKey(),
                category: this.formatCategory(category),
                selectionId,
                selected: false,
                ...metric
            };
        });
    }

    private indexValueColumnsByRole(valueColumns: DataViewValueColumns): Record<keyof MetricByRole, DataViewValueColumn | undefined> {
        const byRole: Record<keyof MetricByRole, DataViewValueColumn | undefined> = {
            measure: undefined,
            senhasRet: undefined,
            senhasAte: undefined,
            volAbn: undefined,
            pctAbn: undefined,
            pctOver: undefined,
            sla10: undefined,
            tme: undefined,
            tma: undefined,
            fteMed: undefined,
            taxaOcp: undefined,
            aderencia: undefined
        };

        valueColumns.forEach((column: DataViewValueColumn) => {
            const roles = column.source.roles || {};
            ROLE_ORDER.forEach((role: keyof MetricByRole) => {
                if (roles[role]) {
                    byRole[role] = column;
                }
            });
        });

        return byRole;
    }

    private readNumericValue(column: DataViewValueColumn | undefined, index: number): number | null {
        const value = column?.values?.[index];
        const numericValue = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
    }

    private formatCategory(value: PrimitiveValue): string {
        if (value === null || value === undefined || value === "") {
            return "(blank)";
        }

        return String(value);
    }

    private toggleSort(field: SortField): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
            this.sortField = field;
            this.sortDirection = "asc";
        }

        this.render();
    }

    private getPrimaryMetric(point: DataPoint): number | null {
        for (const role of ROLE_ORDER) {
            const value = point[role];
            if (typeof value === "number") {
                return value;
            }
        }
        return null;
    }

    private getSortedRows(): DataPoint[] {
        const sortedRows = [...this.points];
        const multiplier = this.sortDirection === "asc" ? 1 : -1;
        sortedRows.sort((left: DataPoint, right: DataPoint) => {
            if (this.sortField === "category") {
                return left.category.localeCompare(right.category) * multiplier;
            }

            const leftMeasure = this.getPrimaryMetric(left);
            const rightMeasure = this.getPrimaryMetric(right);
            if (leftMeasure === null && rightMeasure === null) {
                return 0;
            }
            if (leftMeasure === null) {
                return 1;
            }
            if (rightMeasure === null) {
                return -1;
            }
            return (leftMeasure - rightMeasure) * multiplier;
        });

        return sortedRows;
    }

    private withSelectionFlags(rows: DataPoint[]): DashboardPoint[] {
        return rows.map((row: DataPoint) => ({
            ...row,
            selected: this.selectedKeys.has(row.key)
        }));
    }

    private render(): void {
        const tableCard = this.formattingSettings.tableCard;
        const fontSize = Math.max(8, tableCard.fontSize.value || 12);
        const showGridLines = tableCard.showGridLines.value ?? true;
        const headerBackground = tableCard.headerBackground.value.value || "#e9f2ff";
        const alternateBackground = tableCard.rowAlternateBackground.value.value || "#f7f9fc";
        const selectedBackground = tableCard.selectedRowBackground.value.value || "#dbeafe";
        const showTooltips = this.formattingSettings.tooltipCard.enabled.value;

        this.root.render(
            createElement<DashboardV7VisualProps>(DashboardV7Visual, {
                points: this.withSelectionFlags(this.points),
                sortedPoints: this.withSelectionFlags(this.getSortedRows()),
                showTooltips,
                sortField: this.sortField,
                sortDirection: this.sortDirection,
                showGridLines,
                fontSize,
                headerBackground,
                alternateBackground,
                selectedBackground,
                onToggleSort: (field: SortField) => this.toggleSort(field),
                onRowClick: (key: string, isMultiSelect: boolean) => this.onRowClick(key, isMultiSelect),
                onClearSelection: () => this.clearSelection()
            })
        );
    }

    private onRowClick(key: string, isMultiSelect: boolean): void {
        const point = this.points.find((candidate: DataPoint) => candidate.key === key);
        if (!point) {
            return;
        }

        this.selectionManager.select(point.selectionId, isMultiSelect).then((selectionIds: ISelectionId[]) => {
            this.selectedKeys = new Set<string>(selectionIds.map((selectionId: ISelectionId) => selectionId.getKey()));
            this.render();
        });
    }

    private clearSelection(): void {
        this.selectionManager.clear().then(() => {
            this.selectedKeys.clear();
            this.render();
        });
    }

    public destroy(): void {
        this.root.unmount();
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}