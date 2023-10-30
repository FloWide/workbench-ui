import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RepositoryUpdateRequestModel } from '@core/services/repo/repo.model';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrls: ['./update-dialog.component.scss']
})
export class UpdateDialogComponent implements OnInit {


  updateForm = new FormGroup({
    auto_merge:new FormControl(false),
    force_update: new FormControl(false),
    leave_merge_conflict: new FormControl(false)
  })

  constructor(
    private dialogRef: MatDialogRef<UpdateDialogComponent,RepositoryUpdateRequestModel>,
    @Inject(MAT_DIALOG_DATA) public message: string,
  ) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.updateForm.value)
  }

}
