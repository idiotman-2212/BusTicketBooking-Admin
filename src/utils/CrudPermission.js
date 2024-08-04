import { ROLES, SCREEN_PATH } from "./appContants";

const hasPermissionToDoAction = (action, locationPathname) => {
    const permissions = JSON.parse(localStorage.getItem("permissions"));
    const roleKeys = Object.keys(permissions);

    if (roleKeys.includes(ROLES.ROLE_ADMIN)) return true;

    const currentScreen = SCREEN_PATH[locationPathname];
    let allowedScreens;
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
    return allowedScreens.includes(currentScreen);
};

export { hasPermissionToDoAction }