import { http } from "../../utils/http";

const getAllTripLogs = async () => {
    const resp = await http.get("/tripLogs/all");
    return resp.data;
};

const getPageOfTripLogs = async (page, limit) => {
    const resp = await http.get("/tripLogs/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
};

const getTripLogById = async (id) => {
    const resp = await http.get(`/tripLogs/${id}`);
    return resp.data;
};

const getTripLogsByTripId = async (tripId) => {
    const resp = await http.get(`/tripLogs/trip/${tripId}`);
    return resp.data;
};

const createNewTripLog = async (newTripLog) => {
    const resp = await http.post("/tripLogs", newTripLog);
    return resp.data;
};

const updateTripLog = async (updatedTripLog) => {
    const resp = await http.put("/tripLogs", updatedTripLog);
    return resp.data;
};

const deleteTripLog = async (id) => {
    const resp = await http.delete(`/tripLogs/${id}`);
    return resp.data;
};

export {
    getAllTripLogs, getPageOfTripLogs, getTripLogById, getTripLogsByTripId,
    createNewTripLog, updateTripLog, deleteTripLog
};
