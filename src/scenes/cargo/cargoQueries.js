import { http } from "../../utils/http";

// Lấy tất cả dịch vụ Cargo
const getAllCargos = async () => {
    const response = await http.get("/cargos/all");
    return response.data;
};

// Lấy chi tiết Cargo theo ID
const getCargoById = async (cargoId) => {
    const response = await http.get(`/cargos/${cargoId}`);
    return response.data;
};

// Lấy danh sách Cargo có phân trang
const getPageOfCargos = async (page = 0, limit = 5) => {
    const response = await http.get("/cargos/paging", {
        params: {
            page: page,
            limit: limit
        }
    });
    return response.data;
};

// Thêm mới Cargo
const createCargo = async (newCargo) => {
    const response = await http.post("/cargos", newCargo);
    return response.data;
};

// Cập nhật Cargo
const updateCargo = async (updatedCargo) => {
    const response = await http.put(`/cargos`, updatedCargo);
    return response.data;
};

// Xóa Cargo theo ID
const deleteCargo = async (cargoId) => {
    const response = await http.delete(`/cargos/${cargoId}`);
    return response.data;
};

// Kiểm tra thông tin Cargo có bị trùng lặp hay không
const checkDuplicateCargoInfo = async (mode, cargoId, field, value) => {
    const response = await http.get(`/cargos/checkDuplicate/${mode}/${cargoId}/${field}/${value}`);
    return response.data;
};

export {
    getAllCargos,
    getCargoById,
    getPageOfCargos,
    createCargo,
    updateCargo,
    deleteCargo,
    checkDuplicateCargoInfo
};
