
import { Pipe, PipeTransform } from '@angular/core';
import { isScriptModel, ScriptModel } from '@core/services';
import { PythonServiceModel } from '@core/services/python-service/python-service.model';
import { isRepositoryModel, RepositoryModel } from '@core/services/repo/repo.model';

@Pipe({
  name: 'keyfilter'
})
export class KeyfilterPipe implements PipeTransform {

  transform(value: (RepositoryModel | ScriptModel | PythonServiceModel)[],find:string): any[] {
    if(!value) return value;

    if(!find || find === '') return value;

    const regex = new RegExp(`.*${find}.*`)
    
    if (isRepoArray(value)) {
      return value.filter((v) => regex.test(v.name))
    } else {
      return value.filter((v: any) => regex.test(v.id) || regex.test(v.name))
    }
  }

}


function isRepoArray(obj: any[]): obj is RepositoryModel[] {
  return isRepositoryModel(obj[0])
}

function isScriptArray(obj: any[]): obj is ScriptModel[] {
  return isScriptModel(obj[0])
}