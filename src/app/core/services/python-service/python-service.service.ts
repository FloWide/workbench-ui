import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CustomHttpService } from "../http/custom-http.service";
import { PythonServiceModel, PythonServices } from "./python-service.model";




@Injectable({
    providedIn:'root'
})
export class PythonServicesService {

    constructor(
        private http: CustomHttpService
    ){}
    

    getServices() : Observable<PythonServices> {
        return this.http.get('/service')
    }

    getService(compound_id: [string,string]): Observable<PythonServiceModel> {
        return this.http.get(`/service/${compound_id[0]}/${compound_id[1]}`)
    }

    getServiceLogs(compound_id: [string,string],limit: number = 100): Observable<string> {
        return this.http.get(`/service/${compound_id[0]}/${compound_id[1]}/logs?limit=${limit}`,{
            responseType:'text'
        })
    }

    enableService(compound_id: [string,string]): Observable<PythonServiceModel> {
        return this.http.post(`/service/${compound_id[0]}/${compound_id[1]}/enable`)
    }

    disableService(compound_id: [string,string]): Observable<PythonServiceModel> {
        return this.http.post(`/service/${compound_id[0]}/${compound_id[1]}/disable`);
    }

    restartService(compound_id: [string,string]) : Observable<PythonServiceModel> {
        return this.http.post(`/service/${compound_id[0]}/${compound_id[1]}/restart`)
    }

    
}