import type { TopLevelMenuItem } from "@material/menu-bar/menu-bar.component";
import { ToolBarItem } from "@material/tool-bar/tool-bar.component";
import type { LayoutConfig,} from "golden-layout";
import { ItemType,LayoutManager } from "golden-layout";

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    root: {
        type: ItemType.row,
        width:100,
        isClosable:false,
        content: [
            {
                type: ItemType.component,
                componentType: 'file-tree',
                header:{popout:false},
                title:`Files`,
                width: 10
            },
            {
                type: ItemType.row,
                width:90,
                isClosable:false,
                content: [
                    {
                        type:ItemType.column,
                        width:100,
                        isClosable:false,
                        content:[]
                    }
                ]
            },
        ]
    }
}

export const DEFAULT_LAYOUT_SELECTOR: LayoutManager.LocationSelector[] = [
    {
        typeId:LayoutManager.LocationSelector.TypeId.FirstRow
    },
    {
        typeId:LayoutManager.LocationSelector.TypeId.FirstColumn
    },
    {
        typeId:LayoutManager.LocationSelector.TypeId.FirstStack
    },
    {
        typeId:LayoutManager.LocationSelector.TypeId.Empty
    },
    {
        typeId:LayoutManager.LocationSelector.TypeId.Root
    }
];


export function createLayoutSelector(index:number): LayoutManager.LocationSelector[] {
    return [
        {
            typeId:LayoutManager.LocationSelector.TypeId.FirstRow,
            index:index
        },
        {
            typeId:LayoutManager.LocationSelector.TypeId.FirstColumn,
            index:index
        },
        {
            typeId:LayoutManager.LocationSelector.TypeId.FirstStack,
            index:index
        },
        {
            typeId:LayoutManager.LocationSelector.TypeId.Empty
        },
        {
            typeId:LayoutManager.LocationSelector.TypeId.Root
        }
    ];
}

export const MENU_BAR: TopLevelMenuItem[] = [
    {
        title: 'File',
        children: [
            {
                title: 'New File',
                id: 'NEW_FILE',
                keybind: 'alt + n'
            },
            {
                title: 'Save Files',
                id: 'SAVE_FILES',
                keybind: 'ctrl + alt + s'
            },
            {
                title: 'Upload file',
                id: 'UPLOAD_FILE',
                keybind: 'alt + u'
            }
        ]
    },
    {
        title: 'Edit',
        children: [
            {
                title: 'Undo',
                id: 'UNDO',
                keybind:'ctrl + z',
                dontBind:true
            },
            {
                title: 'Redo',
                id: 'REDO',
                keybind:'ctrl + y',
                dontBind:true
            },
            {
                divider: true
            },
            {
                title: 'Find',
                id:'FIND',
                keybind:'ctrl + f',
                dontBind:true,
            },
            {
                title: 'Replace',
                id:'REPLACE',
                keybind:'ctrl + h',
                dontBind:true
            }
        ]
    },
    {
        title:'Project',
        children:[
            {
                title:'Run',
                keybind:'f9',
                id:'RUN'
            },
            {
                title:'Run file',
                keybind:'alt + f9',
                id:'RUN_FILE'
            },
            {
                title:'Stop',
                id:'STOP'
            },
            {
                title:'Commit',
                keybind:'alt + c',
                id:'COMMIT'
            }
        ]
    },
    {
        title: 'View',
        children: [
            {
                title: 'Show top bar',
                checkbox: true,
                checked: true,
                id: 'SHOW_TOP_BAR'
            },
            {
                title: 'Show Toolbar',
                checkbox: true,
                checked: true,
                id: 'SHOW_TOOL_BAR'
            },
            {
                divider:true
            },
            {
                title:'Panels',
                children:[
                    {
                        title:'Show file tree',
                        checkbox:true,
                        checked:true,
                        id:'SHOW_FILE_TREE'
                    },
                    {
                        title:'Show terminal',
                        checkbox:true,
                        checked:false,
                        id:'SHOW_TERMINAL'
                    }
                ]
            }
        ]
    }
]


export const TOOLBAR_ITEMS: ToolBarItem[] = [
    {
        title:'New file',
        id:'NEW_FILE',
        align:'start',
        display:{
            icon:'note_add'
        }
    },
    {
        title:'Save file',
        id:'SAVE_FILES',
        align:'start',
        display:{
            icon:'save'
        }
    },
    {
        title:'Upload file',
        id:'UPLOAD_FILE',
        align:'start',
        display:{
            icon:'upload'
        }
    },
    {
        title:'Run',
        id:'RUN',
        align:'center',
        display:{
            icon:'play_arrow',
            color:'green',
            big:true
        }
    },
    {
        title:'Commit',
        id:'COMMIT',
        align:'end',
        display:{
            icon:'commit',
            color:'green',
            big:true
        }
    }
]