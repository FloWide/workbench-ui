import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CustomHttpService } from "../http/custom-http.service";
import { GitBranchCreateModel, GitCommitModel, GitState, GitStatus, GitTagCreateModel } from "./repo.model";



@Injectable({
    providedIn:'root'
})
export class RepositoryGitService {

    constructor(
        private http: CustomHttpService 
    ) {}

    getGitState(id: number): Observable<GitState> {
        return this.http.get(`/repo/${id}/git`)
    }

    getGitStatus(id: number): Observable<GitStatus> {
        return this.http.get(`/repo/${id}/git/status`);
    }

    getGitTags(id: number): Observable<{name:string,time:number}[]> {
        return this.http.get(`/repo/${id}/git/tags`)
    }

    createBranch(id: number,model: GitBranchCreateModel): Observable<void> {
        return this.http.post(`/repo/${id}/git/create_branch`,model)
    }

    commit(id:number,model: GitCommitModel) {
        return this.http.post(`/repo/${id}/git/commit`,model)
    }
}