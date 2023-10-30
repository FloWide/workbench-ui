import { Injectable } from "@angular/core";
import { PythonServicesService } from "@core/services/python-service/python-service.service";
import { AppType } from "@core/services/repo/repo.model";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, filter, map, switchMap } from "rxjs/operators";
import { RepositoryActions } from "../repo/repo.action";
import { PythonServiceActions } from "./python-service.action";




@Injectable()
export class PythonServiceEffects {


    constructor(
        private pythonService: PythonServicesService,
        private actions$: Actions
    ) {}
    


    getServices$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.GetServices),
            switchMap((action) => {
                return this.pythonService.getServices().pipe(
                    map((services) => PythonServiceActions.GetServicesSuccess({services:services}) ),
                    catchError((err) => of(PythonServiceActions.GetServicesError({message:err.error})))
                )
            })
        )
    });

    getService$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.GetService),
            switchMap((action) => {
                return this.pythonService.getService(action.compound_id).pipe(
                    map((service) => PythonServiceActions.GetServiceSuccess({service:service}) ),
                    catchError((err) => of(PythonServiceActions.GetServiceError({message:err.error})))
                )
            })
        )
    });

    getServiceLogs$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.GetServiceLogs),
            switchMap((action) => {
                return this.pythonService.getServiceLogs(action.compound_id,action.limit).pipe(
                    map((logs) => PythonServiceActions.GetServiceLogsSuccess({logs:logs,compound_id:action.compound_id}) ),
                    catchError((err) => of(PythonServiceActions.GetServiceLogsError({message:err.error,compound_id:action.compound_id})))
                )
            })
        )
    });

    enableService$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.EnableService),
            switchMap((action) => {
                return this.pythonService.enableService(action.compound_id).pipe(
                    map((service) => PythonServiceActions.EnableServiceSuccess({service:service}) ),
                    catchError((err) => of(PythonServiceActions.EnableServiceError({message:err.error})))
                )
            })
        )
    });

    disableService$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.DisableService),
            switchMap((action) => {
                return this.pythonService.disableService(action.compound_id).pipe(
                    map((service) => PythonServiceActions.DisableServiceSuccess({service:service}) ),
                    catchError((err) => of(PythonServiceActions.DisableServiceError({message:err.error})))
                )
            })
        )
    });

    restartService$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(PythonServiceActions.RestartService),
            switchMap((action) => {
                return this.pythonService.restartService(action.compound_id).pipe(
                    map((service) => PythonServiceActions.RestartServiceSuccess({service:service}) ),
                    catchError((err) => of(PythonServiceActions.RestartServiceError({message:err.error})))
                )
            })
        )
    });

    /*
    repositoryCreation$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(RepositoryActions.CreateRepositorySuccess),
            filter((action) => action.repo.app_config.type === AppType.SERVICE),
            switchMap((action) => {
                return this.pythonService.getService(action.repo.git_service_id).pipe(
                    map((service) => PythonServiceActions.GetServiceSuccess({service:service}))
                )
            })
        )
    })
    */
}