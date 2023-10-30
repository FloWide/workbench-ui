import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RepositoryService } from "@core/services/repo/repo.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { RepositoryActions } from "./repo.action";



@Injectable()
export class RepositoryEffects {


    constructor(
        private repoService: RepositoryService,
        private actions$: Actions
    ) {}
    

    getRepositories$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.GetRepositories),
            switchMap((action) => {
                return this.repoService.getRepos().pipe(
                    map((repos) => RepositoryActions.GetRepositoriesSuccess({repos:repos})),
                    catchError((err) => of(RepositoryActions.GetRepositoriesError({message:err.message})))
                )
            })
        )
    });

    getRepository$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.GetRepository),
            switchMap((action) => {
                return this.repoService.getRepo(action.id).pipe(
                    map((repo) => RepositoryActions.GetRepositorySuccess({repo:repo})),
                    catchError((err) => of(RepositoryActions.GetRepositoryError({message:err.message})))
                )
            })
        )
    });

    createRepository$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.CreateRepository),
            switchMap((action) => {
                return this.repoService.createRepo(action.model).pipe(
                    map((repo) => RepositoryActions.CreateRepositorySuccess({repo:repo})),
                    catchError((err) => of(RepositoryActions.CreateRepositoryError({message:err.message})))
                )
            })
        )
    });

    deleteRepository$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.DeleteRepository),
            switchMap((action) => {
                return this.repoService.deleteRepo(action.id).pipe(
                    map(() => RepositoryActions.DeleteRepositorySuccess({id:action.id})),
                    catchError((err) => of(RepositoryActions.DeleteRepositoryError({message:err.message})))
                )
            })
        )
    });

    forkRepository$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.ForkRepository),
            switchMap((action) => {
                return this.repoService.forkRepo(action.id,action.forkModel).pipe(
                    map(() => RepositoryActions.ForkRepositorySuccess({id:action.id})),
                    catchError((err) => of(RepositoryActions.ForkRepositoryError({message:err.message})))
                )
            })
        )
    });

    updateRepository$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.UpdateRepository),
            switchMap((action) => {
                return this.repoService.updateRepo(action.id,action.update).pipe(
                    map((result) => RepositoryActions.UpdateRepositorySuccess({id:action.id,status:result.status})),
                    catchError((err: HttpErrorResponse) => of(RepositoryActions.UpdateRepositoryError({id:action.id,status:err.status,message:err.error.detail})))
                )
            })
        )
    });

    createRepositoryRelease$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.CreateRepositoryRelease),
            switchMap((action) => {
                return this.repoService.createRelease(action.id,action.tagName).pipe(
                    map(() => RepositoryActions.CreateRepositoryReleaseSuccess({id:action.id,tagName:action.tagName})),
                    catchError((err: HttpErrorResponse) => of(RepositoryActions.CreateRepositoryReleaseError({id:action.id,tagName:action.tagName,message:err.error.detail})))
                )
            })
        )
    });

    deleteRepositoryRelease$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.DeleteRepositoryRelease),
            switchMap((action) => {
                return this.repoService.deleteRelease(action.id,action.tagName).pipe(
                    map(() => RepositoryActions.DeleteRepositoryReleaseSuccess({id:action.id,tagName:action.tagName})),
                    catchError((err: HttpErrorResponse) => of(RepositoryActions.DeleteRepositoryReleaseError({id:action.id,tagName:action.tagName,message:err.error.detail})))
                )
            })
        )
    })
}