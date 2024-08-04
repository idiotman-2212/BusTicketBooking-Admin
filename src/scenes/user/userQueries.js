import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/users/all")
    return resp.data
}

const getPageOfUser = async (page, limit) => {
    const resp = await http.get("/users/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getUser = async (username) => {
    const resp = await http.get(`/users/${username}`)
    return resp.data
}

const getUserPermission = async (username) => {
    const resp = await http.get(`/users/permission/${username}`)
    return resp.data
}

const updateUserPermission = async (permissionObject) => {
    const resp = await http.post(`/users/permission`, permissionObject)
    return resp.data
}

const createNewUser = async (newUser) => {
    const resp = await http.post("/users", newUser)
    return resp.data
}

const updateUser = async (updatedUser) => {
    const resp = await http.put("/users", updatedUser)
    return resp.data
}

const deleteUser = async (username) => {
    const resp = await http.delete(`/users/${username}`)
    return resp.data
}

const checkDuplicateUserInfo = async (mode, userId, field, value) => {
    // mode: add, update      field in [username, email, phone]
    const resp = await http.get(`/users/checkDuplicate/${mode}/${userId}/${field}/${value}`)
    return resp.data // true: this field can be used, false: info is used by other user
}

export {
    getAll, getPageOfUser, getUser, getUserPermission, updateUserPermission
    , createNewUser, updateUser, deleteUser, checkDuplicateUserInfo
}