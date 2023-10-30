import { Injectable } from "@angular/core";
import { ScriptsService } from "@core/services";
import { AppType } from "@core/services/repo/repo.model";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, filter, map, switchMap } from "rxjs/operators";
import { AppState } from "../app.state";
import { RepositoryActions } from "../repo/repo.action";
import { ScriptActions } from "./script.action";




@Injectable()
export class ScriptEffects {


    constructor(
        private scriptService: ScriptsService,
        private actions$: Actions,
    ) {

    }


    getScripts$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(ScriptActions.GetScripts),
            switchMap((action) => {
                return this.scriptService.getScripts().pipe(
                    map((scripts) => ScriptActions.GetScriptsSuccess({scripts:scripts})),
                    catchError((err) => of(ScriptActions.GetScriptsError({message:err.error})))
                )
            })
        )
    });

    getScript$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(ScriptActions.GetScript),
            switchMap((action) => {
                return this.scriptService.getScript(action.compound_id).pipe(
                    map((script) => ScriptActions.GetScriptSuccess({script:script})),
                    catchError((err) => of(ScriptActions.GetScriptError({message:err.error})))
                )
            })
        )
    });

    stopScript$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(ScriptActions.StopScript),
            switchMap((action) => {
                return this.scriptService.stopScript(action.compound_id).pipe(
                    map((script) => ScriptActions.StopScriptSuccess({script:script})),
                    catchError((err) => of(ScriptActions.StopScriptError({message:err.error})))
                )
            })
        )
    });

    killScript$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(ScriptActions.KillScript),
            switchMap((action) => {
                return this.scriptService.killScript(action.compound_id).pipe(
                    map((script) => ScriptActions.KillScriptSuccess({script:script})),
                    catchError((err) => of(ScriptActions.KillScriptError({message:err.error})))
                )
            })
        )
    });

    runScript$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(ScriptActions.RunScript),
            switchMap((action) => {
                return this.scriptService.runScript(action.compound_id,action.overrides).pipe(
                    map((script) => ScriptActions.RunScriptSuccess({script:script})),
                    catchError((err) => of(ScriptActions.RunScriptError({message:err.error})))
                )
            })
        )
    });

    /*
    repositoryCreation$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.CreateRepositorySuccess),
            filter((action) => action.repo.app_config.type === AppType.PYTHON || action.repo.app_config.type === AppType.STREAMLIT),
            switchMap((action) => {
                return this.scriptService.getScript(action.repo.git_service_id).pipe(
                    map((script) => ScriptActions.GetScriptSuccess({script:script}))
                )
            })
        )
    })
    */
}