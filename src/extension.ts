import * as vscode from 'vscode';
import * as path from 'path';

class InputBoxTreeItem extends vscode.TreeItem {
    constructor() {
        super("Enter your text here", vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: 'myExtension.inputCommand',
            title: "Input Text",
            arguments: [this]
        };
    }
}

class MyTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    private items: vscode.TreeItem[] = [];

    constructor() {
        this.items.push(new InputBoxTreeItem());
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element === undefined) {
            return Promise.resolve(this.items);
        }
        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    async addTextItem() {
		const text = await vscode.window.showInputBox({ placeHolder: "Type your text here" });
		if (text) {
			const { exec } = require('child_process');
			let pythonProcess = exec('python3 script.py', (error: Error | null, stdout: string, stderr: string) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
					return;
				}
				const output = JSON.parse(stdout);
				this.items.push(new vscode.TreeItem(output.result));
				this.refresh();
			});
	
			if (pythonProcess.stdin) {
				pythonProcess.stdin.write(text + "\n");
				pythonProcess.stdin.end();
			}
		}
	}
	
}

export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new MyTreeDataProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('myBookView', treeDataProvider));
    context.subscriptions.push(vscode.commands.registerCommand('myExtension.inputCommand', () => treeDataProvider.addTextItem()));
}


// This method is called when your extension is deactivated
export function deactivate() {}
