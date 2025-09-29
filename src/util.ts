export function groupBy<T, K extends keyof T>(arr: T[], ...keys: K[]): { key: T[K], value: T[] }[] {
    const map = new Map<T[K], T[]>()

    for (const item of arr) {
        for (const key of keys) {
            const groupKey = item[key]
            if (!map.has(groupKey)) {
                map.set(groupKey, [])
            }
            map.get(groupKey)!.push(item)
        }
    }

    return Array.from(map, ([k, v]) => ({ key: k, value: v }))
}

export function makeHistogram<K extends string>(data: { [key in K]: number }[], key: K, binSize: number) {
    const bins = new Map()

    data.forEach((item) => {
        const bin = Math.floor(item[key] / binSize) * binSize
        bins.set(bin, (bins.get(bin) || 0) + 1)
    })

    return Array.from(bins.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([bin, count]) => ({
            bin,
            count,
        }))
}

export const dateFormatter = new Intl.DateTimeFormat("ru-RU")
export const timeFormatter = (v: number) => `${(Math.floor(v / 60))}:${(v % 60).toString().padStart(2, "0")}`
