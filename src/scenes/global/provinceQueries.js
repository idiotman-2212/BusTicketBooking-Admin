import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/provinces/all")
    return resp.data;
}

export { getAll }