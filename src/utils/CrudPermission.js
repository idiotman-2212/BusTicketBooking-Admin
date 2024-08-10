import { ROLES, SCREEN_PATH } from "./appContants";

const hasPermissionToDoAction = (action, locationPathname) => {
    const permissions = JSON.parse(localStorage.getItem("permissions"));// lấy quyền từ localStorage
    const roleKeys = Object.keys(permissions);

    // Nếu người dùng là admin, cấp quyền cho tất cả các hành động
    if (roleKeys.includes(ROLES.ROLE_ADMIN)) return true;

    // Xác định màn hình hiện tại từ đường dẫn
    const currentScreen = SCREEN_PATH[locationPathname];
    let allowedScreens;
    // Xác định các màn hình được phép dựa trên hành động
    switch (action) {
        case "CREATE": {
            if (!roleKeys.includes(ROLES.ROLE_CREATE)) return false;
            allowedScreens = permissions[ROLES.ROLE_CREATE];
            break;
        }
        case "UPDATE": {
            if (!roleKeys.includes(ROLES.ROLE_UPDATE)) return false;
            allowedScreens = permissions[ROLES.ROLE_UPDATE];
            break;
        }
        case "DELETE": {
            if (!roleKeys.includes(ROLES.ROLE_DELETE)) return false;
            allowedScreens = permissions[ROLES.ROLE_DELETE];
            break;
        }
    }
    // Kiểm tra xem màn hình hiện tại có nằm trong danh sách các màn hình được phép không
    return allowedScreens.includes(currentScreen);
};

export { hasPermissionToDoAction }