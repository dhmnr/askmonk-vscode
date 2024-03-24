import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('longAnswerHelper.askQuestion', async () => {
        const question = await vscode.window.showInputBox({ placeHolder: "Ask a question" });
        if (question) {
            getAnswer(question).then(answer => {
                showAnswerWebView(context, answer);
            }).catch(error => {
                vscode.window.showErrorMessage(`Error: ${error}`);
            });
        }
    }));
}

function getAnswer(question: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(`python3 script.py "${question}"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error: ${stderr}`);
                return;
            }
            resolve(stdout.trim());
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

    panel.webview.html = getWebviewContent(answer);
}

function getWebviewContent(answer: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Answer</title>
</head>
<body>
    <p>${answer}</p>
</body>
</html>`;
}

export function deactivate() {}
