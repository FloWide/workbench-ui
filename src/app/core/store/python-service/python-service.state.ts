import { PythonServices } from "@core/services/python-service/python-service.model";
import { Action, createReducer, on } from "@ngrx/store";
import { PythonServiceActions } from "./python-service.action";



export interface PythonServiceState  {
    services:PythonServices
}

const initialState: PythonServiceState = {
    services:{}
}


const reducer = createReducer(
    initialState,
    on(PythonServiceActions.GetServicesSuccess,(state,{services}) => {
        return {
            ...state,
            services:services
        }
    }),
    on(
        PythonServiceActions.GetServiceSuccess,
        PythonServiceActions.EnableServiceSuccess,
        PythonServiceActions.DisableServiceSuccess,
        PythonServiceActions.RestartServiceSuccess,
        (state,{service}) => {
            let byRepos = {...state.services[service.compound_id[0]]}
            byRepos = {
                ...byRepos,
                [service.compound_id[1]]:service
            }
            return {
                ...state,
                services:{
                    ...state.services,
                    [service.compound_id[0]]:byRepos
                }
            }
        }
    )
)

export function pythonServicesReducer(state: PythonServiceState,action: Action) {
    return reducer(state,action);
}