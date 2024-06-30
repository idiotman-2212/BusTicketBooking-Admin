import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/drivers/all")
    return resp.data
}

const getPageOfDriver = async (page, limit) => {
    const resp = await http.get("/drivers/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getDriver = async (driverId) => {
    const resp = await http.get(`/drivers/${driverId}`)
    return resp.data
}

const createNewDriver = async (newDriver) => {
    const resp = await http.post("/drivers", newDriver)
    return resp.data
}

const updateDriver = async (updatedDriver) => {
    const resp = await http.put("/drivers", updatedDriver)
    return resp.data
}

const deleteDriver = async (driverId) => {
    const resp = await http.delete(`/drivers/${driverId}`)
    return resp.data
}

const checkDuplicateDriverInfo = async (mode, driverId, field, value) => {
    // mode: add, update      field in [username, email, phone]
    const resp = await http.get(`/drivers/checkDuplicate/${mode}/${driverId}/${field}/${value}`)
    return resp.data // true: this field can be used, false: info is used by other user
}

export { getAll, getPageOfDriver, getDriver, createNewDriver, updateDriver, deleteDriver, checkDuplicateDriverInfo }