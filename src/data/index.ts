import { groupBy } from "../util.ts"
import allFlightsData from "./flights.json"
import worldGeoData from "./world.geo.json"

export type Flight = {
    "flight_id": string,
    "Дата вылета": number,
    "Номер рейса": string,
    "Аэропорт вылета": string,
    "Аэропорт прилета": string,
    "Время вылета": string,
    "Время прилета": string,
    "Время вылета (минуты)": number,
    "Время прилета (минуты)": number,
    "Тип ВС": string,
    "Широта аэропорта вылета": number,
    "Долгота аэропорта вылета": number,
    "Широта аэропорта прилета": number,
    "Долгота аэропорта прилета": number,
    "Город аэропорта вылета": string,
    "Город аэропорта прилета": string,
    "Страна аэропорта вылета": string,
    "Страна аэропорта прилета": string,
    "Расстояние между аэропортами": number,
    "Международный рейс": false,
    "Вектор движения": number,
    "Популяция аэропорта вылета": number,
    "Часовой пояс аэропорта вылета": string,
    "Популяция аэропорта прилета": number,
    "Часовой пояс аэропорта прилета": string,
    "Время в пути": number,
    "Время вылета_ts": number,
    "was_moved": false,
    "stage": "start" | "result",
    "Доход": number,
    "Емкость": number,
    "Пассажиры": number,
    "Бронирования": number,
    "Загруженность": number,
    "Доход на пассажира": number,
}
export const flights: Flight[] = (allFlightsData as Flight[]).filter(d => "stage" in d && d.stage === "start")
export const flightsById = groupBy(flights, "Номер рейса")
export const optimalFlights: Flight[] = (allFlightsData as Flight[]).filter(d => "stage" in d && d.stage === "result")
export const optimalFlightsById = groupBy(optimalFlights, "Номер рейса")

export const movedFlights = groupBy(allFlightsData as Flight[], "flight_id")
    .map(d => d.value.sort((a, b) => a.stage < b.stage ? 1 : -1))
    .filter(d => d.some(f => f.was_moved))

export type Airport = {
    airport: string,
    city: string,
    coordinates: [number, number],
}
export const airports = groupBy(flights.flatMap((d): Airport[] => [
    { airport: d["Аэропорт вылета"], city: d["Город аэропорта вылета"], coordinates: [d["Долгота аэропорта вылета"], d["Широта аэропорта вылета"]] },
    { airport: d["Аэропорт прилета"], city: d["Город аэропорта прилета"], coordinates: [d["Долгота аэропорта прилета"], d["Широта аэропорта прилета"]] },
]), "airport")

export const worldGeo = worldGeoData
export const model = groupBy([
    ...flightsById.map(d => ({
        flight: d.key,
        revenueSum: d.value.reduce((a, b) => a + b.Доход, 0),
    })),
    ...optimalFlightsById.map(d => ({
        flight: d.key,
        revenueSum: d.value.reduce((a, b) => a + b.Доход, 0),
    })),
], "flight")
    .map(d => ({
        flight: d.key,
        delta: d.value[1].revenueSum - d.value[0].revenueSum,
        percent: (d.value[1].revenueSum / d.value[0].revenueSum - 1) * 100,
    }))
    .sort((a, b) => b.percent - a.percent)
