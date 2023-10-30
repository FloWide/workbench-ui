import { Repositories } from "@core/services/repo/repo.model";
import { Action, createReducer, on } from "@ngrx/store";
import { RepositoryActions } from "./repo.action";




export interface RepositoryState {
    repos: Repositories
}

const initalState: RepositoryState = {
    repos:{}
}


const reducer = createReducer(
    initalState,
    on(RepositoryActions.GetRepositoriesSuccess,(state,{repos}) => {
        return {
            ...state,
            repos:repos
        }
    }),
    on(RepositoryActions.GetRepositorySuccess,RepositoryActions.CreateRepositorySuccess,(state,{repo}) => {
        return {
            ...state,
            repos:{
                ...state.repos,
                [repo.git_service_id]:repo
            }
        }
    }),
    on(RepositoryActions.DeleteRepositorySuccess,(state,{id}) => {
        const newRepos = {...state.repos};
        delete newRepos[id];
        return {
            ...state,
            repos:newRepos
        }
    })
)


export function repositoryReducer(state: RepositoryState,action: Action) {
    return reducer(state,action);
}