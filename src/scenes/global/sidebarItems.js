import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import TicketOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import TripOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import BusOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import ReportOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccessibleIcon from '@mui/icons-material/Accessible';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

import { useTranslation } from "react-i18next";

export const sidebarItems = () => {
    const { t } = useTranslation();

    return [
        {
            title: t('Dashboard'),
            to: '/dashboard',
            icon: HomeOutlinedIcon
        },
        {
            title: t('Ticket'),
            to: '/tickets',
            icon: TicketOutlinedIcon
        },
        {
            title: t('Trip'),
            to: '/trips',
            icon: TripOutlinedIcon
        },
        {
            title: t('Driver'),
            to: '/drivers',
            icon: AccessibleIcon
        },
        {
            title: t('Coach'),
            to: '/coaches',
            icon: BusOutlinedIcon
        },
        {
            title: t('Discount'),
            to: '/discounts',
            icon: DiscountOutlinedIcon
        },
        {
            title: t('Users'),
            to: '/users',
            icon: PeopleAltOutlinedIcon
        },
        {
            title: t('Cargos'),
            to: '/cargos',
            icon: LocalShippingOutlinedIcon
        },
        {
            title: t('Notifications'),
            to: '/notifications',
            icon: NotificationsOutlinedIcon
        },
        {
            title: t('Reviews'),
            to: '/reviews',
            icon: RateReviewOutlinedIcon
        },
        {
            title: t('Trip Logs'),
            to: '/tripLogs',
            icon: EventNoteOutlinedIcon
        },
        {
            title: t('Report'),
            to: '/reports',
            icon: ReportOutlinedIcon
        },
        
    ];
};
