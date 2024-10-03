import { http } from "../../utils/http";

// Lấy danh sách thông báo theo phân trang
export const getPageOfNotification = async (page, limit) => {
  const response = await http.get(`/notifications/paging`, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

// Lấy thông báo theo ID
export const getNotificationById = async (id) => {
  const response = await http.get(`/notifications/${id}`);
  return response.data;
};

// Lấy danh sách thông báo
export const getNotifications = async () => {
  const response = await http.get('/notifications/all');
  return response.data;
};

// Tạo mới thông báo
export const createNotification = async (notificationData) => {
  const response = await http.post('/notifications/send', notificationData);
  return response.data;
};

// Cập nhật thông báo
export const updateNotification = async (id, notificationData) => {
  const response = await http.put(`/notifications/${id}`, notificationData);
  return response.data;
};

// Xóa thông báo
export const deleteNotification = async (id) => {
  const response = await http.delete(`/notifications/${id}`);
  return response.data;
};

