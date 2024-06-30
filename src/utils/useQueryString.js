import { useSearchParams } from "react-router-dom"

export const useQueryString = (queryObject) => {
    const [searchParams, setSearchParams] = useSearchParams({ ...queryObject });
    const queryObj = Object.fromEntries([...searchParams])
    return [queryObj, setSearchParams];
}