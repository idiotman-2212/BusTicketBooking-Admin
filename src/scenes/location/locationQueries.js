import { http } from "../../utils/http";

// Lấy tất cả các địa điểm
 const getAllLocations = async () => {
    const response = await http.get('/locations/all');
    return response.data;
};

// Lấy địa điểm với phân trang
 const getPageOfLocations = async (page = 0, limit = 5) => {
    const response = await http.get('/locations/paging', {
        params: { page, limit },
    });
    return response.data;
};

// Lấy địa điểm theo tỉnh
 const getLocationsByProvinceId = async (provinceId) => {
    const response = await http.get(`/locations/province/${provinceId}`);
    return response.data;
};

// Lấy địa điểm theo ID
 const getLocationById = async (id) => {
    const response = await http.get(`/locations/${id}`);
    return response.data;
};

// Tạo địa điểm mới
 const createLocation = async (location) => {
    const response = await http.post('/locations', location);
    return response.data;
};

// Cập nhật địa điểm
 const updateLocation = async (location) => {
    const response = await http.put('/locations', location);
    return response.data;
};

// Xóa địa điểm (xóa mềm)
 const deleteLocation = async (id) => {
    await http.delete(`/locations/${id}`);
};

export {
    getAllLocations,
    getLocationById,
    getPageOfLocations,
    getLocationsByProvinceId,
    createLocation,
    updateLocation,
    deleteLocation,
};