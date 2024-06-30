import { toast } from "react-toastify";

const handleToast = (toastType, message) => {
    if (toastType === "success") {
        toast.success(message);
    } else if (toastType === "error") {
        // error
        toast.error(message);
    }
};

export { handleToast }