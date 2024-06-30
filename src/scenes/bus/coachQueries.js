import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/coaches/all")
    return resp.data
}

const getPageOfCoach = async (page, limit) => {
    const resp = await http.get("/coaches/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getCoach = async (coachId) => {
    const resp = await http.get(`/coaches/${coachId}`)
    return resp.data
}

const createNewCoach = async (newCoach) => {
    const resp = await http.post("/coaches", newCoach)
    return resp.data
}

const updateCoach = async (updatedCoach) => {
    const resp = await http.put("/coaches", updatedCoach)
    return resp.data
}

const deleteCoach = async (coachId) => {
    const resp = await http.delete(`/coaches/${coachId}`)
    return resp.data
}

const checkDuplicateCoachInfo = async (mode, coachId, field, value) => {
    // mode: add, update
    const resp = await http.get(`/coaches/checkDuplicate/${mode}/${coachId}/${field}/${value}`)
    return resp.data // true: value of this field can be used, false: info is used by the other
}

export { getAll, getPageOfCoach, getCoach, createNewCoach, updateCoach, deleteCoach, checkDuplicateCoachInfo }