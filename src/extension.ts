import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('longAnswerHelper.askQuestion', async () => {
        const question = await vscode.window.showInputBox({ placeHolder: "Ask anything about the repo !" });
        if (question) {
            getAnswer(question, context).then(answer => {
                showAnswerWebView(context, answer);
            }).catch(error => {
                vscode.window.showErrorMessage(`Error: ${error}`);
            });
        }
    }));
}

function getAnswer(question: string, context: vscode.ExtensionContext): Promise<string> {
    return new Promise((resolve, reject) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Processing your question...",
            cancellable: false
        }, (progress, token) => {
            return new Promise<void>((resolveProgress, rejectProgress) => {
                exec(`askmonk "${question}"`, (error, stdout, stderr) => {
                    if (error) {
                        rejectProgress();
                        reject(`Error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        rejectProgress();
                        reject(`Error: ${stderr}`);
                        return;
                    }
                    resolveProgress();
                    resolve(stdout.trim());
                });
            });
        });
    });
}

function showAnswerWebView(context: vscode.ExtensionContext, answer: string) {
    const panel = vscode.window.createWebviewPanel(
        'answerWebView', // Identifies the type of the webview. Used internally
        'Answer', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {} // Webview options. More on these later.
    );
	panel.webview.options = {
		enableScripts: true,
	};

    panel.webview.html = getWebviewContent(answer);
}

function getWebviewContent(answer: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monk Says</title>
</head>
<body>
    ${answer}
</body>
</html>`;
}

export function deactivate() {}
