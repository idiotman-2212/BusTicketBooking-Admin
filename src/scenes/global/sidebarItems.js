import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RouteOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TripOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import TicketOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import BusOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaidOutlined";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import ReportOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccessibleIcon from '@mui/icons-material/Accessible';

export const sidebarItems = [
    {
        title: 'Dashboard',
        to: '/dashboard',
        icon: HomeOutlinedIcon
    },
    {
        title: 'Ticket',
        to: '/tickets',
        icon: TicketOutlinedIcon
    },
    {
        title: 'Trip',
        to: '/trips',
        icon: TripOutlinedIcon
    },
    {
        title: 'Driver',
        to: '/drivers',
        icon: AccessibleIcon
    },
    {
        title: 'Coach',
        to: '/coaches',
        icon: BusOutlinedIcon
    },
    // {
    //     title: 'Payment',
    //     to: '/payments',
    //     icon: PaymentOutlinedIcon
    // },
    {
        title: 'Discount',
        to: '/discounts',
        icon: DiscountOutlinedIcon
    },
    {
        title: 'Users',
        to: '/users',
        icon: PeopleAltOutlinedIcon
    },
    {
        title: 'Report',
        to: '/reports',
        icon: ReportOutlinedIcon
    },
]