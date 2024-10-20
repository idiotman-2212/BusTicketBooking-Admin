// Hàm tạo dữ liệu chỗ ngồi dựa trên sức chứa
const generateSeats = (capacity, stairType = "DOWN_STAIR") => {
  const seats = {};
  for (let i = 1; i <= capacity; i++) {
    const seatNumber = stairType === "UP_STAIR" ? `B${i}` : `A${i}`;
    seats[seatNumber] = { name: seatNumber, choose: false };
  }
  return seats;
};

// Dữ liệu chỗ ngồi theo loại xe, đảm bảo không bị tràn ra ngoài giao diện
const Bed_Limousine_Seat_Data = {
  BED: (capacity) => {
    // Chia đều ghế giữa hai tầng nếu có đủ số lượng ghế
    const halfCapacity = Math.ceil(capacity / 2);
    return {
      DOWN_STAIR: generateSeats(halfCapacity, "DOWN_STAIR"),
      UP_STAIR: generateSeats(capacity - halfCapacity, "UP_STAIR"),
      capacity: capacity,
    };
  },
  LIMOUSINE: (capacity) => {
    // Với xe limousine, có thể thêm logic chia 2 tầng nếu cần
    const halfCapacity = Math.ceil(capacity / 2);
    return {
      DOWN_STAIR: generateSeats(halfCapacity, "DOWN_STAIR"),
      UP_STAIR: generateSeats(capacity - halfCapacity, "UP_STAIR"),
      capacity: capacity,
    };
  },
  CHAIR: (capacity) => {
    // Với xe ghế ngồi, logic chia 2 tầng được thêm vào để phù hợp giao diện
    const halfCapacity = Math.ceil(capacity / 2);
    return {
      DOWN_STAIR: generateSeats(halfCapacity, "DOWN_STAIR"),
      UP_STAIR: generateSeats(capacity - halfCapacity, "UP_STAIR"),
      capacity: capacity,
    };
  },
};

export default Bed_Limousine_Seat_Data;
