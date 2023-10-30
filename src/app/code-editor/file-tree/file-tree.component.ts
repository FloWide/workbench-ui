import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { InputDialogComponent, InputDialogData } from '@components/dialogs/input-dialog/input-dialog.component';
import { RepositoryEditService } from '@core/services/repo/repo-edit.service';
import { GitStatus, RepositoryFileEntry, RepositoryModel } from '@core/services/repo/repo.model';
import { AppState, Select } from '@core/store';
import { CodeEditorActions } from '@core/store/code-editor/code-edior.action';
import { CodeTab, CodeTabs } from '@core/store/code-editor/code-editor.state';
import { Store } from '@ngrx/store';
import { ComponentContainer } from 'golden-layout';
import { Subject } from 'rxjs';
import { filter, take, takeUntil} from 'rxjs/operators';
import { ComponentContainerInjectionToken, GlComponentDirective } from 'src/app/golden-layout';
import { fileToBase64 } from '../utils';



/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  path:string;
  level: number;
  file:RepositoryFileEntry;
}

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss']
})
export class FileTreeComponent extends GlComponentDirective implements OnInit,OnDestroy{

  private destroy$ = new Subject();

  private _transformer = (node: RepositoryFileEntry, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      path:node.path,
      level: level,
      file:node
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  gitStatus:GitStatus;

  
  focusedTab: CodeTab = null;

  repo: RepositoryModel = null;

  private expandedNodes: Array<FlatNode>;

  private openedTabs: CodeTabs;

  constructor(private store:Store<AppState>,
              private dialog:MatDialog,
              private editService: RepositoryEditService,
              @Inject(ComponentContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef) {
                super(elRef.nativeElement)
  }

  ngOnInit(): void {

    this.store.select(Select.repofiles).pipe(
      takeUntil(this.destroy$),
      filter<RepositoryFileEntry[]>(Boolean)
    ).subscribe((files) => {
      this.saveExpandedNodes();
      this.dataSource.data = this.sortFolderFirst(files);
      this.restoreExpadedNodes();
    });

    this.store.select(Select.openCodeTabs).pipe(
      takeUntil(this.destroy$)
    ).subscribe((tabs) => {
      this.openedTabs = tabs;
    });
    this.store.select(Select.focusedCodeTab).pipe(
      takeUntil(this.destroy$)
    ).subscribe((tab) => {
      this.focusedTab = tab;
    });

    this.store.select(Select.gitStatus).pipe(
      takeUntil(this.destroy$)
    ).subscribe((status) => {
      this.gitStatus = status;
    });

    this.store.select(Select.editingRepo).pipe(
      takeUntil(this.destroy$)
    ).subscribe((repo) => {
      this.repo = repo;
    })

  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  private sortFolderFirst(data:RepositoryFileEntry[]) : RepositoryFileEntry[] {
    data.forEach(e => {
      if(e.children) {
        e.children= this.sortFolderFirst(e.children)
      }
    })

    return data.sort((a,b) => {
      return b.type.length - a.type.length; // type can only be folder or file, order based on type's length
    })
  }

  fileClicked(node:FlatNode) {
    if(!this.openedTabs || !(node.file.path in this.openedTabs))
      this.store.dispatch(CodeEditorActions.OpenTab({tab:node.file as any}))
    this.store.dispatch(CodeEditorActions.FocusTab({tab:node.file as any}));
  }

  isGitDirty(path:string) {

    if(!this.gitStatus) return false;

    return path in this.gitStatus;
  }

  async newFileForFolder(folderPath:string) {
    const result = await this.dialog.open<InputDialogComponent,InputDialogData,string>(InputDialogComponent,{
      data:{ 
        title:'File name',
        inputLabel:'File',
        submitButton:'Create',
        inputPrefix:folderPath + '/',
        hint:'dir/file.py',
      }
    }).afterClosed().pipe(take(1)).toPromise();

    if (result) {
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg:{
          action:'create',
          file_path:`${folderPath}/${result}`,
          base64encoded:false,
          content:'',
          previous_path:''
        }
      }));
    }
  }

  deleteFile(path:string) {
    this.store.dispatch(CodeEditorActions.SendEditMessage({
      msg:{
        action:'delete',
        file_path:path,
        base64encoded:false,
        content:'',
        previous_path:''
      }
    }));
  }

  openInNewTab(node: FlatNode) {
    this.store.dispatch(CodeEditorActions.OpenTab({tab:node.file as any}))
  }

  close() {
    this.container.close();
  }

  async renameFile(path:string) {

    const dirname = path.substring(0,path.lastIndexOf("/")+1);
    const filename = path.substring(path.lastIndexOf('/')+1);


    const result = await this.dialog.open<InputDialogComponent,InputDialogData,string>(InputDialogComponent,{
      data:{ 
        title:'New name',
        inputLabel:'Name',
        submitButton:'Rename',
        inputPrefix:dirname,
        defaultValue:filename
      }
    }).afterClosed().pipe(take(1)).toPromise();

    if (result) {
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg:{
          action:'move',
          file_path:dirname ? `${dirname}/${result}` : result,
          base64encoded:false,
          content:'',
          previous_path:path
        }
      }));
      if (path in this.openedTabs) {
        this.store.dispatch(CodeEditorActions.CloseTab({
          tab:this.openedTabs[path]
        }))
      }
    }
  }

  async moveFile(path:string) {
    const result = await this.dialog.open<InputDialogComponent,InputDialogData,string>(InputDialogComponent,{
      data:{ 
        title:'To folder',
        inputLabel:'Folder',
        submitButton:'Move',
        hint:'dir/subdir',
        inputPrefix:'/'
      }
    }).afterClosed().pipe(take(1)).toPromise();

    const filename = path.substring(path.lastIndexOf('/')+1);

    if (result) {
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg:{
          action:'move',
          file_path:result !== '/' ? `${result}/${filename}` : filename,
          base64encoded:false,
          content:'',
          previous_path:path
        }
      }));
    }
  }

  async filesDropped(event: DragEvent) {
    event.preventDefault();

    const files = event.dataTransfer.files;

    if(!files || files.length === 0) return;

    for(const file of Array.from(files)) {
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg: {
          action: 'create',
          file_path: file.name,
          base64encoded: true,
          content: await fileToBase64(file),
          previous_path: ''
        }
      }));
    }

  }

  downloadFile(node: FlatNode) {
    this.editService.downloadFile(this.repo.git_service_id,node.file.path)
  }

  private saveExpandedNodes() {

    if(!this.treeControl.dataNodes) return;

    this.expandedNodes = new Array<FlatNode>();
    this.treeControl.dataNodes.forEach((node) => {
      if(node.expandable && this.treeControl.isExpanded(node)) {
        this.expandedNodes.push(node);
      }
    })
  }

  private restoreExpadedNodes() {

    if(!this.treeControl.dataNodes || !this.expandedNodes) return;

    this.expandedNodes.forEach((node) => {
      this.treeControl.expand(this.treeControl.dataNodes.find((n) => n.path === node.path));
    })
  }
}
