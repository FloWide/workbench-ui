import { Scripts } from "@core/services";
import { Action, createReducer, on } from "@ngrx/store";
import { ScriptActions } from "./script.action";


export interface ScriptState {
    scripts: Scripts
}

const initalState: ScriptState = {
    scripts:{}
}



const reducer = createReducer(
    initalState,
    on(ScriptActions.GetScriptsSuccess,(state,{scripts}) => {
        return {
            ...state,
            scripts:scripts
        }
    }),
    on(
        ScriptActions.GetScriptSuccess,
        ScriptActions.StopScriptSuccess,
        ScriptActions.KillScriptSuccess,
        ScriptActions.RunScriptSuccess,
        (state,{script}) => {
            let byRepos = {...state.scripts[script.compound_id[0]]}
            byRepos = {
                ...byRepos,
                [script.compound_id[1]]:script
            }
            return {
                ...state,
                scripts:{
                    ...state.scripts,
                    [script.compound_id[0]]:byRepos
                }
            }
        }
    )
)

export function scriptReducer(state: ScriptState,action: Action) {
    return reducer(state,action);
}