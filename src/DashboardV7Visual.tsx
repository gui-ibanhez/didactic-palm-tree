import type { CSSProperties, MouseEvent } from "react";
import {
    Content as TooltipContent,
    Provider as TooltipProvider,
    Root as TooltipRoot,
    Trigger as TooltipTrigger
} from "@radix-ui/react-tooltip";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from "recharts";

export type SortField = "category" | "measure";
export type SortDirection = "asc" | "desc";

export interface DashboardPoint {
    key: string;
    category: string;
    selected: boolean;
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

export interface DashboardV7VisualProps {
    points: DashboardPoint[];
    sortedPoints: DashboardPoint[];
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

const C = {
    purple: "#660099",
    purpleMd: "#78009F",
    lavender: "#B675CB",
    hotPink: "#EB3C7D",
    orange: "#FF9900",
    lime: "#82D400",
    border: "#EBE6F4",
    muted: "#7A6B8A"
};

function fmt(value: number, digits = 1): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function asNumber(value: number | null | undefined): number | null {
    return typeof value === "number" ? value : null;
}

function lastMetric(points: DashboardPoint[], field: keyof DashboardPoint): number {
    for (let i = points.length - 1; i >= 0; i--) {
        const value = points[i][field];
        if (typeof value === "number") {
            return value;
        }
    }
    return 0;
}

function metricAverage(points: DashboardPoint[], field: keyof DashboardPoint): number {
    const values = points.map((point: DashboardPoint) => point[field]).filter((value: unknown) => typeof value === "number") as number[];
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((sum: number, value: number) => sum + value, 0) / values.length;
}

function hasAny(points: DashboardPoint[], fields: Array<keyof DashboardPoint>): boolean {
    return points.some((point: DashboardPoint) => fields.some((field: keyof DashboardPoint) => typeof point[field] === "number"));
}

function primaryValue(point: DashboardPoint): number | null {
    const candidates: Array<keyof DashboardPoint> = [
        "senhasRet",
        "sla10",
        "tme",
        "fteMed",
        "measure"
    ];
    for (const candidate of candidates) {
        const value = point[candidate];
        if (typeof value === "number") {
            return value;
        }
    }
    return null;
}

export function DashboardV7Visual(props: DashboardV7VisualProps) {
    const {
        points,
        sortedPoints,
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

    const latestAbn = lastMetric(points, "pctAbn");
    const latestSla10 = lastMetric(points, "sla10");
    const latestTme = lastMetric(points, "tme");
    const latestFte = lastMetric(points, "fteMed");

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
            <div className="dashWrap" style={{ fontSize: `${fontSize}px` }} onClick={onBackgroundClick}>
                <section className="dashHeader" style={{ backgroundColor: headerBackground }}>
                    <div className="dashTitleBlock">
                        <div className="dashAccent" />
                        <div>
                            <p className="dashTitle">Visao de Gestao Mensal</p>
                            <p className="dashSubtitle">Fluxo, SLA, Produtividade e FTE com dados do Power BI</p>
                        </div>
                    </div>
                    <div className="dashPills">
                        <span className="dashPill">V6 Executivo</span>
                        <span className="dashPill active">V7 Gestao</span>
                        <span className="dashPill">V4 Detalhado</span>
                    </div>
                </section>

                <section className="kpiGrid">
                    <article className="kpiCard">
                        <p className="kpiLabel">% Abandono</p>
                        <p className="kpiValue">{fmt(latestAbn)}%</p>
                    </article>
                    <article className="kpiCard">
                        <p className="kpiLabel">SLA 10min</p>
                        <p className="kpiValue">{fmt(latestSla10)}%</p>
                    </article>
                    <article className="kpiCard">
                        <p className="kpiLabel">TME</p>
                        <p className="kpiValue">{fmt(latestTme)} min</p>
                    </article>
                    <article className="kpiCard">
                        <p className="kpiLabel">FTE Medio</p>
                        <p className="kpiValue">{fmt(latestFte, 0)}</p>
                    </article>
                </section>

                {hasAny(points, ["senhasRet", "senhasAte", "volAbn", "pctAbn"]) && (
                    <section className="chartCard">
                        <p className="sectionTitle">1. Fluxo de Demanda</p>
                        <div className="chartBody">
                            <ResponsiveContainer width="100%" height={250}>
                                <ComposedChart data={points}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={showGridLines ? C.border : "transparent"} vertical={false} />
                                    <XAxis dataKey="category" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.hotPink, fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="senhasRet" name="Senhas Retiradas" fill={C.purple} />
                                    <Bar yAxisId="left" dataKey="senhasAte" name="Senhas Atendidas" fill={C.lavender} />
                                    <Bar yAxisId="left" dataKey="volAbn" name="Vol. Abandonadas" fill={C.hotPink} />
                                    <Line yAxisId="right" dataKey="pctAbn" name="% Abandono" stroke={C.hotPink} strokeWidth={2.2} dot={false} />
                                    <ReferenceLine yAxisId="right" y={8} stroke={C.hotPink} strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {hasAny(points, ["sla10", "pctAbn"]) && (
                    <section className="chartCard">
                        <p className="sectionTitle">2. SLA com % Abandono</p>
                        <div className="chartBody">
                            <ResponsiveContainer width="100%" height={230}>
                                <LineChart data={points}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={showGridLines ? C.border : "transparent"} vertical={false} />
                                    <XAxis dataKey="category" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.hotPink, fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line yAxisId="left" dataKey="sla10" name="SLA 10min" stroke={C.purpleMd} strokeWidth={2.2} />
                                    <Line yAxisId="right" dataKey="pctAbn" name="% Abandono" stroke={C.hotPink} strokeWidth={2} strokeDasharray="5 3" />
                                    <ReferenceLine yAxisId="left" y={80} stroke={C.purpleMd} strokeDasharray="5 5" />
                                    <ReferenceLine yAxisId="right" y={8} stroke={C.hotPink} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {hasAny(points, ["tme", "tma", "pctAbn"]) && (
                    <section className="chartCard">
                        <p className="sectionTitle">3. Produtividade (TME vs TMA)</p>
                        <div className="chartBody">
                            <ResponsiveContainer width="100%" height={230}>
                                <LineChart data={points}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={showGridLines ? C.border : "transparent"} vertical={false} />
                                    <XAxis dataKey="category" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.hotPink, fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line yAxisId="left" dataKey="tme" name="TME" stroke={C.purpleMd} strokeWidth={2.2} />
                                    <Line yAxisId="left" dataKey="tma" name="TMA" stroke={C.orange} strokeWidth={2.2} />
                                    <Line yAxisId="right" dataKey="pctAbn" name="% Abandono" stroke={C.hotPink} strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {hasAny(points, ["fteMed", "taxaOcp", "aderencia"]) && (
                    <section className="chartCard">
                        <p className="sectionTitle">4. FTE e Ocupacao</p>
                        <div className="chartBody">
                            <ResponsiveContainer width="100%" height={230}>
                                <ComposedChart data={points}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={showGridLines ? C.border : "transparent"} vertical={false} />
                                    <XAxis dataKey="category" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.lime, fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="fteMed" name="FTE Medio" fill={C.orange} />
                                    <Line yAxisId="right" dataKey="taxaOcp" name="% Ocupacao" stroke={C.lime} strokeWidth={2.2} />
                                    <Line yAxisId="right" dataKey="aderencia" name="% Aderencia" stroke={C.purpleMd} strokeWidth={2.2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                <section className="tableCard">
                    <div className="chartHeader">
                        <p className="sectionTitle">Detalhamento e Selecao</p>
                        <div className="sortBtns">
                            <button type="button" onClick={() => onToggleSort("category")}>
                                {headerLabel("Categoria", "category")}
                            </button>
                            <button type="button" onClick={() => onToggleSort("measure")}>
                                {headerLabel("Valor", "measure")}
                            </button>
                        </div>
                    </div>
                    <table
                        className={`dataTable ${showGridLines ? "showGrid" : ""}`}
                        style={
                            {
                                "--alt-row-bg": alternateBackground,
                                "--selected-row-bg": selectedBackground
                            } as CSSProperties
                        }
                    >
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Valor Principal</th>
                                <th>% ABN</th>
                                <th>SLA10</th>
                                <th>FTE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPoints.map((point: DashboardPoint, index: number) => (
                                <tr
                                    key={point.key}
                                    className={`${index % 2 === 1 ? "altRow" : ""} ${point.selected ? "selectedRow" : ""}`}
                                    onClick={(event: MouseEvent<HTMLTableRowElement>) => {
                                        event.stopPropagation();
                                        onRowClick(point.key, event.ctrlKey || event.metaKey);
                                    }}
                                >
                                    <td>
                                        {showTooltips ? (
                                            <TooltipRoot>
                                                <TooltipTrigger asChild={true}>
                                                    <span className="cellTrigger">{point.category}</span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="radixTooltip">
                                                    {point.category}
                                                </TooltipContent>
                                            </TooltipRoot>
                                        ) : (
                                            point.category
                                        )}
                                    </td>
                                    <td className="measureCell">
                                        {asNumber(primaryValue(point)) === null ? "-" : primaryValue(point)?.toLocaleString()}
                                    </td>
                                    <td className="measureCell">{asNumber(point.pctAbn) === null ? "-" : `${fmt(point.pctAbn as number)}%`}</td>
                                    <td className="measureCell">{asNumber(point.sla10) === null ? "-" : `${fmt(point.sla10 as number)}%`}</td>
                                    <td className="measureCell">{asNumber(point.fteMed) === null ? "-" : fmt(point.fteMed as number, 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="smallNote">
                        Medias: %ABN {fmt(metricAverage(points, "pctAbn"))}% · SLA10 {fmt(metricAverage(points, "sla10"))}% · TME {fmt(metricAverage(points, "tme"))} min
                    </p>
                </section>
            </div>
        </TooltipProvider>
    );
}
