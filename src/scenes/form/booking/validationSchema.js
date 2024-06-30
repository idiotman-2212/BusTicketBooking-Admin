import * as yup from 'yup'
import { APP_CONSTANTS } from "../../../utils/appContants"
import { isAfter, parse } from 'date-fns'

export default [
    yup.object().shape({
        trip: yup.object().required("Required"),
        source: yup.object().required("Required"),
        destination: yup.object().required("Required"),
        from: yup.date().required("Required"),
        to: yup.date().required("Required"),
        bookingDateTime: yup.date().notRequired(),
        bookingType: yup.string().notRequired()
    }),
    yup.object().shape({
        seatNumber: yup.array().required("Required").min(1, "Must select at least 1 seat"),
    }),
    yup.object().shape({
        pickUpAddress: yup.string().required("Required"),
        firstName: yup.string().required("Required"),
        lastName: yup.string().required("Required"),
        phone: yup
            .string()
            .matches(APP_CONSTANTS.PHONE_REGEX, "Invalid phone number")
            .required("Required"),
        email: yup
            .string()
            .required("Required")
            .email("Invalid email"),
        totalPayment: yup.number().notRequired(),
        paymentDateTime: yup.date().notRequired(),
        paymentMethod: yup.string().required("Required"),
        paymentStatus: yup.string().notRequired(),
        nameOnCard: yup.string().when('paymentMethod', {
            is: 'CARD',
            then: () =>
                yup.string().required("Required")
            ,
            otherwise: () => yup.string().notRequired()
        }),
        cardNumber: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required('Required').matches(APP_CONSTANTS.VISA_REGEX, "Invalid Card Number e.g: '4111111111111'")
            ,
            otherwise: () => yup.string().notRequired()
        }),
        expiredDate: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required('Required')
                    .test('expiredDate', 'Invalid Expired Date e.g: MM/YY => 12/24', (value) => {
                        const expirationDate = parse(value, 'MM/yy', new Date());
                        return isAfter(expirationDate, new Date());
                    })
            ,
            otherwise: () => yup.string().notRequired()
        }),
        cvv: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required('Required')
                    .test('len', 'Invalid CVV e.g: 123', (value) => value && value.length === 3)
            ,
            otherwise: () => yup.string().notRequired()
        })
    })
]