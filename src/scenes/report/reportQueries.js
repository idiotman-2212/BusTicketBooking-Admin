import { http } from "../../utils/http";

const getTotalRevenue = async (startDate, endDate, timeOption) => {
    const resp = await http.get(`/reports/revenues/${startDate}/${endDate}/${timeOption}`)
    return resp.data
}

const getTotalWeekRevenue = async (date) => {
    const resp = await http.get(`/reports/revenues/${date}`)
    return resp.data
}

const getCoachUsage = async (startDate, endDate, timeOption) => {
    const resp = await http.get(`/reports/usages/${startDate}/${endDate}/${timeOption}`)
    return resp.data
}

const getTopRoute = async (startDate, endDate, timeOption) => {
    const resp = await http.get(`/reports/toproute/${startDate}/${endDate}/${timeOption}`)
    return resp.data
}

export { getTotalRevenue, getTotalWeekRevenue, getCoachUsage, getTopRoute }