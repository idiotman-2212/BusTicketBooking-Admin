import { useSearchParams } from "react-router-dom"

//quản lý các tham số trên url
export const useQueryString = (queryObject) => {
    const [searchParams, setSearchParams] = useSearchParams({ ...queryObject });
    const queryObj = Object.fromEntries([...searchParams])
    return [queryObj, setSearchParams];
}