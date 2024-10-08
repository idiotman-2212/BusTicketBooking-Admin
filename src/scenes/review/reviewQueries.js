import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/reviews/all")
    return resp.data
}

const getPageOfReviews = async (page, limit) => {
    const resp = await http.get("/reviews/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getReviewById = async (reviewId) => {
    const resp = await http.get(`/reviews/${reviewId}`)
    return resp.data
}

const getReviewByBookingId = async (bookingId) => {
    const resp = await http.get(`/reviews/bookings/${bookingId}`)
    return resp.data
};

const createNewReviews = async (newReviews) => {
    const resp = await http.post("/reviews", newReviews)
    return resp.data
}


export {
    createNewReviews, getAll,
    getPageOfReviews, getReviewById, getReviewByBookingId
};

