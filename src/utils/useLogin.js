const useLogin = () => {
  return localStorage.getItem("acToken") !== null;
};

export default useLogin;
