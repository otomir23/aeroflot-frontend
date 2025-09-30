import type { Flight } from "./data"
import {
    RiCalendarEventFill,
    RiCashFill,
    RiGlobeFill,
    RiMapPinFill,
    RiPinDistanceFill,
    RiPlaneFill,
    RiStockFill,
    RiTimeFill,
} from "@remixicon/react"
import { useState } from "react"

import { ComposableMap, Geographies, Geography, Graticule, Line, Marker, ZoomableGroup } from "react-simple-maps"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    LabelList,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import Card from "./components/card.tsx"
import {
    TooltipContentContainer,
    TooltipContentElement,
} from "./components/tooltip-content.tsx"
import { airports, flightsById, model, movedFlights, optimalFlightsById, worldGeo } from "./data"
import { dateFormatter, makeHistogram, timeFormatter } from "./util.ts"

const COLORS = [
    "#0088FE",
    "#00C49F",
]
const TABLE_PAGE_SIZE = 10

function App() {
    const [selectedFlight, setSelectedFlight] = useState(0)
    const selectedFlightData = flightsById[selectedFlight]
    const selectedOptimalFlightData = optimalFlightsById[selectedFlight]

    const flightTimeHistogram = makeHistogram(selectedFlightData.value, "Время вылета (минуты)", 10)
    const optimalFlightTimeHistogram = makeHistogram(selectedOptimalFlightData.value, "Время вылета (минуты)", 10)

    const flightsWeeklyHistogram = makeHistogram(selectedFlightData.value, "Время вылета_ts", 1000 * 60 * 60 * 24 * 7)
    const optimalFlightsWeeklyHistogram = makeHistogram(selectedOptimalFlightData.value, "Время вылета_ts", 1000 * 60 * 60 * 24 * 7)

    const [tablePage, setTablePage] = useState(0)
    const movedFlightTableData = movedFlights.slice(tablePage * TABLE_PAGE_SIZE, (tablePage + 1) * TABLE_PAGE_SIZE)

    return (
        <main className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
            <div className="flex flex-col gap-0.5">
                <h1 className="font-bold text-3xl text-neutral-900">Отчёт</h1>
                <p className="text-neutral-600">
                    Изменение расписания и дохода по рейсам
                </p>
            </div>
            <Card icon={RiStockFill} title="Изменение дохода" description="По всем рейсам" className="max-md:p-1">
                <ResponsiveContainer>
                    <BarChart
                        data={model}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <Tooltip
                            content={(props) => {
                                const data = props.payload[0]?.payload
                                if (!data)
                                    return null
                                return (
                                    <TooltipContentContainer icon={RiPlaneFill} title={`Рейс ${data.flight}`}>
                                        <TooltipContentElement icon={RiStockFill} title="Изменение">
                                            {data.percent.toFixed(4)}
                                            %
                                        </TooltipContentElement>
                                    </TooltipContentContainer>
                                )
                            }}
                        />
                        <Bar
                            type="monotone"
                            dataKey="percent"
                            fill="#2b7fff"
                            strokeWidth={1}
                            name="Дельта"
                            unit="%"
                        >
                            <LabelList
                                position="top"
                                className="max-lg:[writing-mode:vertical-rl] max-lg:[text-orientation:mixed]"
                                offset={14}
                                fontSize={8}
                                fontWeight={700}
                                valueAccessor={e => `${(+e.value).toFixed(2)}%`}
                            />
                        </Bar>
                        <XAxis
                            interval={0}
                            fontSize={12}
                            dataKey="flight"
                            className="[writing-mode:vertical-rl] [text-orientation:mixed] max-sm:hidden"
                            tickLine={false}
                            axisLine={false}
                        />
                        <XAxis
                            interval={0}
                            fontSize={10}
                            dataKey="flight"
                            className="[writing-mode:vertical-rl] [text-orientation:mixed] sm:hidden"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis type="number" tick={false} axisLine={false} width={0} domain={[0, 5]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card icon={RiGlobeFill} title="Карта полётов" description="Толщина зависит от прибыльности рейса" className="p-0 h-auto">
                <ComposableMap
                    height={390}
                    projection="geoEqualEarth"
                >
                    <ZoomableGroup center={[60, 30]} zoom={2} translateExtent={[[-80, -40], [850, 400]]}>
                        <Graticule stroke="#efefef" />
                        <Geographies geography={worldGeo}>
                            {({ geographies }) =>
                                geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#eee"
                                        stroke="#ccc"
                                        strokeWidth={0.5}
                                    />
                                ))}
                        </Geographies>
                        {flightsById.map(({ key, value: [d] }) => (
                            <Line
                                key={key}
                                from={[d["Долгота аэропорта вылета"], d["Широта аэропорта вылета"]]}
                                to={[d["Долгота аэропорта прилета"], d["Широта аэропорта прилета"]]}
                                stroke={COLORS[0]}
                                strokeWidth={Math.max(0.25, (model.find(f => f.flight === key)?.percent || 0) / 3)}
                            />
                        ))}
                        {airports.map(({ key, value: [d] }) => (
                            <Marker
                                key={key}
                                coordinates={d.coordinates}
                            >
                                <circle r={1} />
                                <text fontSize={4} textAnchor="middle" y={6}>
                                    {d.city}
                                </text>
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
            </Card>
            <div className="flex flex-col divide-y divide-neutral-200 w-full overflow-x-auto">
                <div className="flex divide-x divide-neutral-200 bg-neutral-50 uppercase font-bold text-sm min-w-5xl">
                    <div className="px-4 py-2 flex-1">
                        Рейс
                    </div>
                    <div className="px-4 py-2 flex-1">
                        Дата вылета
                    </div>
                    <div className="px-4 py-2 flex-1">
                        Время вылета (Исходное)
                    </div>
                    <div className="px-4 py-2 flex-1">
                        Время вылета (Оптимальное)
                    </div>
                    <div className="px-4 py-2 flex-1">
                        Доход (Исходное)
                    </div>
                    <div className="px-4 py-2 flex-1">
                        Доход (Оптимальное)
                    </div>
                </div>
                {movedFlightTableData.map(([from, to]) => (
                    <div className="flex divide-x divide-neutral-200 min-w-5xl" key={from.flight_id}>
                        <div className="px-4 py-2 flex-1">
                            {from["Номер рейса"]}
                            {" "}
                            (
                            {from["Тип ВС"]}
                            )
                        </div>
                        <div className="px-4 py-2 flex-1">
                            {dateFormatter.format(from["Дата вылета"])}
                            {" "}
                            {Math.abs(from["Время вылета_ts"] - to["Время вылета_ts"]) / 1000 / 60 / 60 / 24 >= 1 && (
                                <RiCalendarEventFill className="text-red-500 inline-block" size={16} />
                            )}
                        </div>
                        <div className="px-4 py-2 flex-1">
                            {from["Время вылета"]}
                        </div>
                        <div className="px-4 py-2 flex-1">
                            {to["Время вылета"]}
                            {" "}
                            <span className="text-neutral-600 font-medium text-sm">
                                {from["Время вылета"] > to["Время вылета"] ? "-" : "+"}
                                {timeFormatter(Math.abs(from["Время вылета_ts"] - to["Время вылета_ts"]) / 1000 / 60)}
                            </span>
                        </div>
                        <div className="px-4 py-2 flex-1">
                            {from["Доход"].toFixed(2)}
                        </div>
                        <div className="px-4 py-2 flex-1">
                            {to["Доход"].toFixed(2)}
                            {" "}
                            <span className="text-neutral-600 font-medium text-sm">
                                {from["Доход"] > to["Доход"] ? "-" : "+"}
                                {Math.abs(to["Доход"] - from["Доход"]).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
                <div className="flex items-center sticky left-0">
                    <button
                        type="button"
                        className="flex-1 text-blue-500 py-6 text-3xl font-bold hover:bg-neutral-100 disabled:text-neutral-500 disabled:pointer-events-none"
                        onClick={() => setTablePage(tablePage - 1)}
                        disabled={tablePage === 0}
                    >
                        {"<--"}
                    </button>
                    <div className="flex-1 text-center py-6 text-3xl font-bold">
                        {tablePage + 1}
                    </div>
                    <button
                        type="button"
                        className="flex-1 text-blue-500 py-6 text-3xl font-bold hover:bg-neutral-100 disabled:text-neutral-500 disabled:pointer-events-none"
                        onClick={() => setTablePage(tablePage + 1)}
                        disabled={(tablePage + 1) * TABLE_PAGE_SIZE > movedFlights.length}
                    >
                        {"-->"}
                    </button>
                </div>
            </div>
            <div className="border-t-2 border-neutral-200 border-dashed pt-4 flex flex-col gap-2">
                <h3 className="font-medium text-lg">
                    Рассмотреть отдельный рейс
                </h3>
                <div className="flex flex-wrap gap-0.5">
                    {flightsById.map((flight, i) => (
                        <button
                            type="button"
                            key={flight.key}
                            onClick={() => setSelectedFlight(i)}
                            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-3 py-0.5 font-medium
                            data-[selected]:font-bold data-[selected]:text-neutral-900 data-[selected]:bg-neutral-200"
                            data-selected={i === selectedFlight || undefined}
                        >
                            {flight.key}
                        </button>
                    ))}
                </div>
            </div>
            <Card icon={RiCashFill} title="Прибыль полётов" description="До и после оптимизации" className="px-0">
                <ResponsiveContainer>
                    <ScatterChart
                        margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
                    >
                        <Tooltip
                            content={(props) => {
                                const data = props.payload[0]?.payload as Flight
                                if (!data)
                                    return null
                                return (
                                    <TooltipContentContainer icon={RiPlaneFill} title={`Рейс ${data["Номер рейса"]} (${data["Тип ВС"]})`}>
                                        <TooltipContentElement icon={RiCashFill} title="Доход">
                                            {data["Доход"]}
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiCalendarEventFill} title="Вылет">
                                            {dateFormatter.format(data["Дата вылета"])}
                                            {" "}
                                            {data["Время вылета"]}
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiCalendarEventFill} title="Прилет">
                                            {dateFormatter.format(data["Дата вылета"])}
                                            {" "}
                                            {data["Время прилета"]}
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiTimeFill} title="В пути">
                                            {Math.floor(data["Время в пути"] / 60)}
                                            {" "}
                                            ч
                                            {" "}
                                            {(data["Время в пути"] % 60).toString().padStart(2, "0")}
                                            {" "}
                                            мин
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiMapPinFill} title="Из">
                                            {data["Аэропорт вылета"]}
                                            {" "}
                                            {data["Город аэропорта вылета"]}
                                            ,
                                            {" "}
                                            {data["Страна аэропорта вылета"]}
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiMapPinFill} title="В">
                                            {data["Аэропорт прилета"]}
                                            {" "}
                                            {data["Город аэропорта прилета"]}
                                            ,
                                            {" "}
                                            {data["Страна аэропорта прилета"]}
                                        </TooltipContentElement>
                                        <TooltipContentElement icon={RiPinDistanceFill} title="Растояние">
                                            {data["Расстояние между аэропортами"]?.toFixed(1)}
                                            {" "}
                                            км
                                        </TooltipContentElement>
                                    </TooltipContentContainer>
                                )
                            }}
                        />
                        <Scatter
                            fill={COLORS[0]}
                            name="Исходный"
                            data={selectedFlightData.value}
                        />
                        <Scatter
                            fill={COLORS[1]}
                            name="Оптимальный"
                            data={selectedOptimalFlightData.value}
                        />
                        <XAxis
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            dataKey="Дата вылета"
                            name="Дата вылета"
                            tickFormatter={v => dateFormatter.format(v)}
                        />
                        <YAxis
                            type="number"
                            dataKey="Доход"
                            name="Доход"
                            label={{ value: "Доход", angle: -90, position: "insideLeft", textAnchor: "middle" }}
                            tickFormatter={value => `${(value / 1000).toFixed(1)}k`}
                        />
                        <Legend />
                    </ScatterChart>
                </ResponsiveContainer>
            </Card>
            <Card icon={RiTimeFill} title="Распределние вылетов" description="По неделям">
                <ResponsiveContainer>
                    <AreaChart
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillOld" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#2b7fff"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#2b7fff"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <defs>
                            <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#00C49F"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#00C49F"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={(props) => {
                                const ts = props.label
                                if (!ts)
                                    return null
                                const label = dateFormatter.format(+ts)
                                return (
                                    <TooltipContentContainer title={`Рейсы ${label}`} icon={RiTimeFill}>
                                        {props.payload.map(p => (
                                            <TooltipContentElement title={p.name} icon={RiPlaneFill} key={p.name}>
                                                {p.value}
                                            </TooltipContentElement>
                                        ))}
                                    </TooltipContentContainer>
                                )
                            }}
                        />
                        <Area
                            data={flightsWeeklyHistogram}
                            type="monotone"
                            dataKey="count"
                            stroke="#2b7fff"
                            fill="url(#fillOld)"
                            strokeWidth={1}
                            name="Исходный"
                        />
                        <Area
                            data={optimalFlightsWeeklyHistogram}
                            type="monotone"
                            dataKey="count"
                            stroke="#00C49F"
                            fill="url(#fillNew)"
                            strokeWidth={1}
                            name="Оптимальный"
                        />
                        <XAxis
                            domain={["dataMin", "dataMax"]}
                            type="number"
                            dataKey="bin"
                            tickLine={false}
                            axisLine={false}
                            scale="time"
                            tickFormatter={v => dateFormatter.format(v)}
                        />
                        <YAxis strokeWidth={0} label={{ value: "Кол-во вылетов", angle: -90, position: "insideLeft", textAnchor: "middle" }} />
                        <Legend />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
            <Card icon={RiTimeFill} title="Распределние вылетов" description="По времени суток">
                <ResponsiveContainer>
                    <AreaChart
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillOld" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#2b7fff"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#2b7fff"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <defs>
                            <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#00C49F"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#00C49F"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={(props) => {
                                const label = timeFormatter(+props.label!)
                                return (
                                    <TooltipContentContainer title={`Рейсы в ${label}`} icon={RiTimeFill}>
                                        {props.payload.map(p => (
                                            <TooltipContentElement title={p.name} icon={RiPlaneFill} key={p.name}>
                                                {p.value}
                                            </TooltipContentElement>
                                        ))}
                                    </TooltipContentContainer>
                                )
                            }}
                        />
                        <Area
                            data={flightTimeHistogram}
                            type="monotone"
                            dataKey="count"
                            stroke="#2b7fff"
                            fill="url(#fillOld)"
                            strokeWidth={1}
                            name="Исходный"
                        />
                        <Area
                            data={optimalFlightTimeHistogram}
                            type="monotone"
                            dataKey="count"
                            stroke="#00C49F"
                            fill="url(#fillNew)"
                            strokeWidth={1}
                            name="Оптимальный"
                        />
                        <XAxis
                            domain={["dataMin", "dataMax"]}
                            type="number"
                            dataKey="bin"
                            tickLine={false}
                            axisLine={false}
                            scale="time"
                            tickFormatter={timeFormatter}
                        />
                        <YAxis strokeWidth={0} label={{ value: "Кол-во вылетов", angle: -90, position: "insideLeft", textAnchor: "middle" }} />
                        <Legend />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
            <div className="font-bold text-xs uppercase">
                Безымянные
            </div>
        </main>
    )
}

export default App
