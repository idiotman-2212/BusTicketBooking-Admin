import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const handleToast = (toastType, message) => {
  if (toastType === "success") {
    toast.success(message);
  } else if (toastType === "error") {
    toast.error(message);
  } else {
    console.error("Unknown toast type:", toastType);
  }
};

export { handleToast };
