import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('codeStyleAnalyzer.fixFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Нет открытого файла');
      return;
    }

    const document = editor.document;
    let text = document.getText();

    // Transform long if conditions into multi-line
    text = text.replace(
      /if\s*\(([^)]+)\)\s*\{/g,
      (match, inner) => {
        const trimmedInner = inner.trim();
		if (trimmedInner.length <= 50) {
			return match; 
		}
        if (inner.includes('||') || inner.includes('&&')) {
          const parts = inner.split(/(\|\||&&)/);
          const formatted = parts
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0)
            .map((p: string) => (p === '||' || p === '&&' ? `    ${p}` : `    ${p}`))
            .join('\n');
          return `if (\n${formatted}\n) {`;
        }
        return match;
      }
    );

    // Add {} to single-line continue statements
    text = text.replace(
      /if\s*\(([^)]+)\)\s*continue\s*;/g,
      (match, cond) => {
        return `if (${cond}) {\n    continue;\n}`;
      }
    );

    // Check func for UpperCamelCase
	const funcRegex = /(\w[\w\s\*\&]+)\s+([a-zA-Z]\w*)\s*\(([^)]*)\)\s*\{/g;
	const badFunctions: string[] = [];

	text = text.replace(funcRegex, (match, ret, name, params) => {
	const camel = name
		.split(/_|(?=[A-Z])/)
		.filter(Boolean)
		.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('');

	if (camel !== name) {
		badFunctions.push(`${name} → ${camel}`);
	}

	return `${ret.trim()} ${camel}(${params.trim()}) {`;
	});

    // Cut long lines
    const lines = text.split(/\r?\n/).map((line) => {
      if (line.length > 120) {
        return line.slice(0, 120) + ' // ← обрезано';
      }
      return line;
    });
    text = lines.join('\n');

    // Apply edits to the document
    await editor.edit((editBuilder) => {
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(document.lineCount, 0);
      editBuilder.replace(new vscode.Range(start, end), text);
    });

    vscode.window.showInformationMessage(
      `Кодстайл исправлен. Переименовано функций: ${badFunctions.length}`
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
