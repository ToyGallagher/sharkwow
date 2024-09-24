import axios, { AxiosResponse } from "axios";
import { apiPath } from "src/constants/routePath";
import { DefaultResponse } from "src/interfaces/response/commonResponse";

export async function changeStatus(
    projectId: string,
    payload: Promise<DefaultResponse>){
    try {
        const result: AxiosResponse<DefaultResponse> = await axios.put(
            apiPath.PROJECTS.UPDATE_STATUS(projectId),
            payload
        );
        result.data.status = result.status;
        return result.data;
    } catch (error: unknown) {
        throw new Error("Launch project failed");
    }
}
