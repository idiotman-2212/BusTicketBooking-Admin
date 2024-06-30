import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/bookings/all")
    return resp.data
}

const getPageOfBookings = async (page, limit) => {
    const resp = await http.get("/bookings/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getSeatBooking = async (tripId) => {
    const resp = await http.get("/bookings/emptySeats", {
        params: {
            tripId: tripId
        },
    });
    return resp.data;
}

const getBooking = async (bookingId) => {
    const resp = await http.get(`/bookings/${bookingId}`)
    return resp.data
}

const getAvailableBooking = async () => {
    const resp = await http.get(`/bookings/${bookingId}`)
    return resp.data
}

const createNewBookings = async (newBookings) => {
    const resp = await http.post("/bookings", newBookings)
    return resp.data
}

const updateBooking = async (updatedBooking) => {
    const resp = await http.put("/bookings", updatedBooking)
    return resp.data
}

const deleteBooking = async (bookingId) => {
    const resp = await http.delete(`/bookings/${bookingId}`)
    return resp.data
}

export {
    createNewBookings, deleteBooking, getAll,
    getPageOfBookings, getSeatBooking, getBooking, updateBooking
};

