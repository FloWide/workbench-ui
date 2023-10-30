import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface ConfirmDialogData {
  title:string;
  submitButton:string;
  message:string;
  color:string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(private dialogRef:MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:ConfirmDialogData) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close(false);
  }

  onSubmit(value:string) {
    this.dialogRef.close(true);
  }

}
