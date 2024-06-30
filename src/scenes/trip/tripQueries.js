import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/trips/all")
    return resp.data
}

const findAllTripBySourceAndDest = async (sourceId, destId, from, to) => {
    const resp = await http.get(`/trips/${sourceId}/${destId}/${from}/${to}`)
    return resp.data
}

const getPageOfTrips = async (page, limit) => {
    const resp = await http.get("/trips/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getTrip = async (tripId) => {
    const resp = await http.get(`/trips/${tripId}`)
    return resp.data
}

const createNewTrip = async (newTrip) => {
    const resp = await http.post("/trips", newTrip)
    return resp.data
}

const updateTrip = async (updatedTrip) => {
    const resp = await http.put("/trips", updatedTrip)
    return resp.data
}

const deleteTrip = async (tripId) => {
    const resp = await http.delete(`/trips/${tripId}`)
    return resp.data
}

// const checkDuplicateDiscountInfo = async (mode, discountId, field, value) => {
//     // mode: add, update
//     const resp = await http.get(`/trips/checkDuplicate/${mode}/${discountId}/${field}/${value}`)
//     return resp.data // true: value of this field can be used, false: info is used by the other
// }

export {
    createNewTrip, deleteTrip, getAll, getPageOfTrips,
    getTrip, updateTrip, findAllTripBySourceAndDest
};

