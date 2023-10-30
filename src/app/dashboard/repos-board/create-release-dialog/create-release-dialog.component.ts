import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-release-dialog',
  templateUrl: './create-release-dialog.component.html',
  styleUrls: ['./create-release-dialog.component.scss']
})
export class CreateReleaseDialogComponent implements OnInit {

  creationForm = new FormGroup({
    name: new FormControl('',[Validators.required,this.nameValidator()]),
  })

  constructor(
    private dialogRef: MatDialogRef<CreateReleaseDialogComponent,string>,
    @Inject(MAT_DIALOG_DATA) public taken_names: string[]
  ) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.creationForm.get('name').value)
  }

  getErrorMessage(control: AbstractControl) {
    if (control.hasError("name_taken"))
      return "Release with that name already exists"
    else if(control.hasError('required'))
      return "Name is required"
    return ''
  }

  private nameValidator(): ValidatorFn {
    return (control:AbstractControl): ValidationErrors => {
      if(!control.value) return null;
      const valid = !this.taken_names.includes(control.value)
      return valid ? null : {'name_taken':true}
    }
  }

}
