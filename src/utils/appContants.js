export const APP_CONSTANTS = {
    EMAIL_REGEX: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PHONE_REGEX: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
    VISA_REGEX: /^(?:4[0-9]{12}(?:[0-9]{3})?)$/,
}

export const ROLES = {
    ROLE_ADMIN: "ROLE_ADMIN",
    ROLE_STAFF: "ROLE_STAFF",
    ROLE_CREATE: "ROLE_CREATE",
    ROLE_READ: "ROLE_READ",
    ROLE_UPDATE: "ROLE_UPDATE",
    ROLE_DELETE: "ROLE_DELETE",
    ROLE_CUSTOMER: "ROLE_CUSTOMER"
}

export const SCREENS = {
    DASHBOARD: "DASHBOARD",
    TICKETS: "TICKETS",
    TRIPS: "TRIPS",
    LOCATIONS: "LOCATIONS",
    DRIVERS: "DRIVERS",
    COACHES: "COACHES",
    DISCOUNTS: "DISCOUNTS",
    USERS: "USERS",
    CARGOS: "CARGOS",
    NOTIFICATIONS: "NOTIFICATIONS",
    REVIEWS: "REVIEWS",
    TRIPLOGS: "TRIPLOGS",
    REPORT: "REPORT",
}

export const SCREEN_PATH = {
    "/dashboard": SCREENS.DASHBOARD,
    "/tickets": SCREENS.TICKETS,
    "/trips": SCREENS.TRIPS,
    "/locations": SCREENS.LOCATIONS,
    "/drivers": SCREENS.DRIVERS,
    "/coaches": SCREENS.COACHES,
    "/discounts": SCREENS.DISCOUNTS,
    "/users": SCREENS.USERS,
    "/cargos": SCREENS.CARGOS,
    "/notifications": SCREENS.NOTIFICATIONS,
    "/reviews": SCREENS.REVIEWS,
    "/triplogs": SCREENS.TRIPLOGS,
    "/reports": SCREENS.REPORT,

}