import React, { useState, useEffect } from 'react';
import { createNotification, updateNotification } from '../../notification/notificationQueries';
import { getAllUsers } from '../../user/userQueries'; // Sử dụng getAllUsers từ userQueries
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Button, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography
} from '@mui/material';

const NotificationForm = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('ALL');
  const [recipientIdentifiers, setRecipientIdentifiers] = useState([]);
  const [users, setUsers] = useState([]); // Lưu danh sách người dùng để chọn
  const { notificationId } = useParams();  // Nhận notificationId từ URL
  const location = useLocation();
  const navigate = useNavigate();
  const notification = location.state?.notification;

  // Kiểm tra xem đang trong chế độ cập nhật hay thêm mới
  const isEditMode = Boolean(notificationId);

  // Fetch danh sách người dùng khi component mount
  useEffect(() => {
    fetchUsers();

    // Nếu đang trong chế độ chỉnh sửa, load dữ liệu của notification
    if (isEditMode && notification) {
      setTitle(notification.title);
      setMessage(notification.message);
      setRecipientType(notification.recipientType);
      setRecipientIdentifiers(notification.recipientIdentifiers.split(',')); // Chuyển chuỗi thành mảng
    }
  }, [notification, isEditMode]);

  // Sử dụng getAllUsers từ userQueries để lấy danh sách người dùng
  const fetchUsers = async () => {
    const data = await getAllUsers(); // Thay thế bằng getAllUsers
    setUsers(data); // Lưu danh sách người dùng để sử dụng trong Select
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const notificationData = {
      title,
      message,
      recipientType,
      recipientIdentifiers,
    };

    if (isEditMode) {
      // Gọi API update nếu đang chỉnh sửa
      await updateNotification(notificationId, notificationData);
    } else {
      // Gọi API create nếu đang tạo mới
      await createNotification(notificationData);
    }
    navigate('/notifications');
  };

  // Hàm hiển thị các trường dựa trên Recipient Type
  const renderRecipientsInput = () => {
    if (recipientType === 'INDIVIDUAL') {
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>Individual Recipient</InputLabel>
          <Select
            value={recipientIdentifiers[0] || ''} // Chỉ cho phép chọn 1 người cho INDIVIDUAL
            onChange={(e) => setRecipientIdentifiers([e.target.value])}
          >
            {users.map(user => (
              <MenuItem key={user.username} value={user.username}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else if (recipientType === 'GROUP') {
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>Group Recipients</InputLabel>
          <Select
            multiple // Cho phép chọn nhiều người cho GROUP
            value={recipientIdentifiers}
            onChange={(e) => setRecipientIdentifiers(e.target.value)} // Cập nhật mảng các giá trị
            renderValue={(selected) => selected.join(', ')} // Hiển thị người dùng đã chọn
          >
            {users.map(user => (
              <MenuItem key={user.username} value={user.username}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null; // Không cần trường recipient nếu là ALL
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Update Notification' : 'Create New Notification'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Message"
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Recipient Type</InputLabel>
          <Select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value)}
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="GROUP">GROUP</MenuItem>
            <MenuItem value="INDIVIDUAL">INDIVIDUAL</MenuItem>
          </Select>
        </FormControl>

        {renderRecipientsInput()}

        <Button variant="contained" color="primary" type="submit">
          {isEditMode ? 'SAVE' : 'CREATE'}
        </Button>
      </form>
    </Box>
  );
};

export default NotificationForm;
