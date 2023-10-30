import { Injectable } from "@angular/core";
import { AppState, Select } from "@core/store";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { CustomHttpService } from "../http/custom-http.service";
import { GitAnalyzeResults, Repositories, RepositoryCreationModel, RepositoryForkModel, RepositoryModel, RepositoryUpdateRequestModel } from "./repo.model";




@Injectable({
    providedIn:'root'
})
export class RepositoryService {

    token: string = ''

    constructor(
        private http: CustomHttpService,
        private store: Store<AppState>
    ) {
        this.store.select(Select.accessToken).subscribe((token) => this.token = token);
    }
    
    
    getRepos(): Observable<Repositories> {
        return this.http.get('/repo');
    }

    getRepo(id: number) : Observable<RepositoryModel> {
        return this.http.get(`/repo/${id}`);
    }

    deleteRepo(id: number) : Observable<void> {
        return this.http.delete(`/repo/${id}`);
    }

    createRepo(creationModel: RepositoryCreationModel): Observable<RepositoryModel> {
        return this.http.post(`/repo`,creationModel);
    }

    checkRepoUpdate(id: number) : Observable<{status:GitAnalyzeResults}> {
        return this.http.get(`/repo/${id}/checkupdate`)
    }

    forkRepo(id: number,forkModel: RepositoryForkModel): Observable<void> {
        return this.http.post(`/repo/${id}/fork`,forkModel)
    }

    updateRepo(id: number,updateRequest: RepositoryUpdateRequestModel): Observable<{status:GitAnalyzeResults}> {
        return this.http.post(`/repo/${id}/update`,updateRequest)
    }

    createRelease(id: number,tagName: string) {
        return this.http.post(`/repo/${id}/create_release?tag_name=${encodeURIComponent(tagName)}`)
    }

    deleteRelease(id: number,tagName: string) {
        return this.http.delete(`/repo/${id}/delete_release?tag_name=${encodeURIComponent(tagName)}`)
    }

    logo(id: number): string {
        return `${this.http.API.api}/repo/${id}/logo?token=${this.token}`
    }

}