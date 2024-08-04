import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/discounts/all")
    return resp.data
}

const getAllAvailable = async () => {
    const resp = await http.get("/discounts/all/available")
    return resp.data
}

const getPageOfDiscounts = async (page, limit) => {
    const resp = await http.get("/discounts/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getDiscount = async (discountId) => {
    const resp = await http.get(`/discounts/${discountId}`)
    return resp.data
}

const createNewDiscount = async (newDiscount) => {
    const resp = await http.post("/discounts", newDiscount)
    return resp.data
}

const updateDiscount = async (updatedDiscount) => {
    const resp = await http.put("/discounts", updatedDiscount)
    return resp.data
}

const deleteDiscount = async (discountId) => {
    const resp = await http.delete(`/discounts/${discountId}`)
    return resp.data
}

const checkDuplicateDiscountInfo = async (mode, discountId, field, value) => {
    // mode: add, update
    const resp = await http.get(`/discounts/checkDuplicate/${mode}/${discountId}/${field}/${value}`)
    return resp.data // true: value of this field can be used, false: info is used by the other
}

export {
    checkDuplicateDiscountInfo, createNewDiscount, deleteDiscount,
    getAll, getAllAvailable, getDiscount, getPageOfDiscounts, updateDiscount
};
