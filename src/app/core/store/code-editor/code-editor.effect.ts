import { Injectable } from "@angular/core";
import { RepositoryEditService } from "@core/services/repo/repo-edit.service";
import { RepositoryGitService } from "@core/services/repo/repo-git.service";
import { act, Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, withLatestFrom } from "rxjs/operators";
import { CodeEditorActions } from "./code-edior.action";



@Injectable()
export class CodeEditorEffects {


    constructor(
        private actions$:Actions,
        private editService: RepositoryEditService,
        private gitService: RepositoryGitService
    ) {}

    
    getFileContent$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(CodeEditorActions.GetFileContent),
            mergeMap((action) => {
                return this.editService.getFileContent(action.repo,action.path).pipe(
                    map((content) => CodeEditorActions.GetFileContentSuccess({repo:action.repo,path:action.path,content:content}) ),
                    catchError((err) => of(CodeEditorActions.GetFileContentError({repo:action.repo,path:action.path})))
                )
            })
        )
    })

    commitChanges$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(CodeEditorActions.CommitChanges),
            mergeMap((action) => {
                return this.gitService.commit(action.repo,{message:action.commitMsg,auto_add_file:true,auto_push:true}).pipe(
                    map(() => CodeEditorActions.CommitChangesSuccess({repo:action.repo})),
                    catchError(() => of(CodeEditorActions.CommitChangesError({repo:action.repo})))
                )
            })
        )
    });

    setRepoFiles$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(CodeEditorActions.SetRepo),
            mergeMap((action) => {
                return this.editService.getFileTree(action.repo.git_service_id).pipe(
                    map((files) => CodeEditorActions.SetFiles({files:files}))
                )
            })
        )
    });

    setRepoGitStatus$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(CodeEditorActions.SetRepo),
            mergeMap((action) => {
                return this.gitService.getGitStatus(action.repo.git_service_id).pipe(
                    map((status) => CodeEditorActions.SetGitStatus({status:status}))
                )
            })
        )
    });

}