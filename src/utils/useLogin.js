// ktra người dùng đã đăng nhập hay chưa dựa vào acToken trong localStorage
const useLogin = () => {
  return localStorage.getItem("acToken") !== null;
};

export default useLogin;
