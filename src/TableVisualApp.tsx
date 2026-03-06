import {
    Content as TooltipContent,
    Provider as TooltipProvider,
    Root as TooltipRoot,
    Trigger as TooltipTrigger
} from "@radix-ui/react-tooltip";
import type { CSSProperties, MouseEvent } from "react";

export type SortField = "category" | "measure";
export type SortDirection = "asc" | "desc";

export interface DisplayRow {
    key: string;
    category: string;
    measure: number | null;
    selected: boolean;
}

interface TableVisualAppProps {
    rows: DisplayRow[];
    showTooltips: boolean;
    sortField: SortField;
    sortDirection: SortDirection;
    showGridLines: boolean;
    fontSize: number;
    headerBackground: string;
    alternateBackground: string;
    selectedBackground: string;
    onToggleSort: (field: SortField) => void;
    onRowClick: (key: string, isMultiSelect: boolean) => void;
    onClearSelection: () => void;
}

export function TableVisualApp(props: TableVisualAppProps) {
    const {
        rows,
        showTooltips,
        sortField,
        sortDirection,
        showGridLines,
        fontSize,
        headerBackground,
        alternateBackground,
        selectedBackground,
        onToggleSort,
        onRowClick,
        onClearSelection
    } = props;

    const onBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClearSelection();
        }
    };

    const headerLabel = (title: string, field: SortField): string => {
        if (sortField !== field) {
            return `${title} ↕`;
        }

        return `${title} ${sortDirection === "asc" ? "↑" : "↓"}`;
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="tableVisual" onClick={onBackgroundClick}>
                {rows.length === 0 && (
                    <div className="emptyState">Add a category and a measure to render the table.</div>
                )}
                {rows.length > 0 && (
                    <table
                        className={`dataTable ${showGridLines ? "showGrid" : ""}`}
                        style={
                            {
                                fontSize: `${fontSize}px`,
                                "--alt-row-bg": alternateBackground,
                                "--selected-row-bg": selectedBackground
                            } as CSSProperties
                        }
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{ backgroundColor: headerBackground }}
                                    onClick={() => onToggleSort("category")}
                                >
                                    {headerLabel("Category", "category")}
                                </th>
                                <th
                                    style={{ backgroundColor: headerBackground }}
                                    onClick={() => onToggleSort("measure")}
                                >
                                    {headerLabel("Measure", "measure")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row: DisplayRow, index: number) => (
                                <tr
                                    key={row.key}
                                    className={`${index % 2 === 1 ? "altRow" : ""} ${row.selected ? "selectedRow" : ""}`}
                                    onClick={(event: MouseEvent<HTMLTableRowElement>) => {
                                        event.stopPropagation();
                                        onRowClick(row.key, event.ctrlKey || event.metaKey);
                                    }}
                                >
                                    <td>
                                        {showTooltips ? (
                                            <TooltipRoot>
                                                <TooltipTrigger asChild={true}>
                                                    <span className="cellTrigger">{row.category}</span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="radixTooltip">
                                                    {row.category}
                                                </TooltipContent>
                                            </TooltipRoot>
                                        ) : (
                                            row.category
                                        )}
                                    </td>
                                    <td className="measureCell">
                                        {showTooltips ? (
                                            <TooltipRoot>
                                                <TooltipTrigger asChild={true}>
                                                    <span className="cellTrigger">
                                                        {row.measure === null ? "-" : row.measure.toLocaleString()}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="radixTooltip">
                                                    {row.measure === null ? "No value" : row.measure.toString()}
                                                </TooltipContent>
                                            </TooltipRoot>
                                        ) : (
                                            row.measure === null ? "-" : row.measure.toLocaleString()
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </TooltipProvider>
    );
}
