import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserProfile } from '@core/services';
import { RepositoryForkModel } from '@core/services/repo/repo.model';
import { Users } from '@core/services/user/user.model';



export interface ForkDialogData {
  name?: string;
  users: Users
}

@Component({
  selector: 'app-fork-dialog',
  templateUrl: './fork-dialog.component.html',
  styleUrls: ['./fork-dialog.component.scss']
})
export class ForkDialogComponent implements OnInit {


  forkForm = new FormGroup({
    name:new FormControl(this.data.name),
    user:new FormControl('')
  })

  constructor(
    private dialogRef: MatDialogRef<ForkDialogComponent,RepositoryForkModel>,
    @Inject(MAT_DIALOG_DATA) public data: ForkDialogData
  ) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close({
      new_name:this.forkForm.controls.name.value,
      to_user_id:this.forkForm.controls.user.value
    });
  }

}
