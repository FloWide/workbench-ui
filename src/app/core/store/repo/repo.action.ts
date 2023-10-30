import { GitAnalyzeResults, Repositories, RepositoryCreationModel, RepositoryForkModel, RepositoryModel, RepositoryUpdateRequestModel } from "@core/services/repo/repo.model";
import { createAction, props } from "@ngrx/store";



export namespace RepositoryActions {


    export const GetRepositories = createAction('[REPOSITORY] Get Repositories');
    export const GetRepositoriesSuccess = createAction('[REPOSITORY] Get Repositories Success',props<{repos:Repositories}>());
    export const GetRepositoriesError = createAction('[REPOSITORY] Get Repositories Error',props<{message:string}>());

    export const GetRepository = createAction('[REPOSITORY] Get Repository',props<{id:number}>());
    export const GetRepositorySuccess = createAction('[REPOSITORY] Get Repository Success',props<{repo:RepositoryModel}>());
    export const GetRepositoryError = createAction('[REPOSITORY] Get Repository Error',props<{message:string}>());

    export const CreateRepository = createAction('[REPOSITORY] Create Repository',props<{model:RepositoryCreationModel}>());
    export const CreateRepositorySuccess = createAction('[REPOSITORY] Create Repository Success',props<{repo:RepositoryModel}>());
    export const CreateRepositoryError = createAction('[REPOSITORY] Create Repository Error',props<{message:string}>());

    export const DeleteRepository = createAction('[REPOSITORY] Delete Repository',props<{id:number}>());
    export const DeleteRepositorySuccess = createAction('[REPOSITORY] Delete Repository Success',props<{id:number}>());
    export const DeleteRepositoryError = createAction('[REPOSITORY] Delete Repository Error',props<{message:string}>());

    export const ForkRepository = createAction('[REPOSITORY] Fork Repository',props<{id:number,forkModel: RepositoryForkModel}>());
    export const ForkRepositorySuccess = createAction('[REPOSITORY] Fork Repository Success',props<{id:number}>());
    export const ForkRepositoryError = createAction('[REPOSITORY] Fork Repository Error',props<{message:string}>());

    export const UpdateRepository = createAction('[REPOSITORY] Update Repository',props<{id:number,update: RepositoryUpdateRequestModel}>());
    export const UpdateRepositorySuccess = createAction('[REPOSITORY] Update Repository Success',props<{id:number,status:GitAnalyzeResults}>());
    export const UpdateRepositoryError = createAction('[REPOSITORY] Update Repository Error',props<{id:number,status:number,message:string}>());

    export const CreateRepositoryRelease = createAction('[REPOSITORY] Create Repository Release',props<{id:number,tagName:string}>());
    export const CreateRepositoryReleaseSuccess = createAction('[REPOSITORY] Create Repository Release Success',props<{id:number,tagName:string}>());
    export const CreateRepositoryReleaseError = createAction('[REPOSITORY] Create Repository Release Error',props<{id:number,tagName:string,message:string}>());

    export const DeleteRepositoryRelease = createAction('[REPOSITORY] Delete Repository Release',props<{id:number,tagName:string}>());
    export const DeleteRepositoryReleaseSuccess = createAction('[REPOSITORY] Delete Repository Release Success',props<{id:number,tagName:string}>());
    export const DeleteRepositoryReleaseError = createAction('[REPOSITORY] Delete Repository Release Error',props<{id:number,tagName:string,message:string}>());

}