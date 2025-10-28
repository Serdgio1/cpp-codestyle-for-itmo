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

    const renameDictionary: Map<string, string> = new Map();
    const renamedItems: string[] = [];

    // Нормализация пробелов в if, struct, class
    text = text.replace(/if\s*\(/g, 'if (');
    text = text.replace(/\)\s*\{/g, ') {');
    text = text.replace(/if\s*\(\s*\)\s*\{/g, 'if () {');
    text = text.replace(/struct\s*\{/g, 'struct {');
    text = text.replace(/class\s*\{/g, 'class {');
    
    // Форматирование if/else блоков
    text = text.replace(
      /if\s*\(([^)]+)\)\s*\{\s*([^}]+)\s*\}/g,
      (match, cond, content) => {
        if (content.includes('\n')) {
          return match;
        }
        let trimmedContent = content.trim();
        trimmedContent = trimmedContent.replace(/;;+/g, ';');
        if (!trimmedContent.endsWith(';')) {
          trimmedContent += ';';
        }
        return `if (${cond}) {\n    ${trimmedContent}\n}`;
      }
    );

    text = text.replace(
      /else\s*\{\s*([^}]+)\s*\}/g,
      (match, content) => {
        if (content.includes('\n')) {
          return match;
        }
        let trimmedContent = content.trim();
        trimmedContent = trimmedContent.replace(/;;+/g, ';');
        if (!trimmedContent.endsWith(';')) {
          trimmedContent += ';';
        }
        return `else {\n    ${trimmedContent}\n}`;
      }
    );

    // Разбиение длинных условий на несколько строк
    text = text.replace(
      /if\s*\(([^)]+)\)\s*\{/g,
      (match, inner) => {
        const trimmedInner = inner.trim();
		if (trimmedInner.length <= 80) {
			return match; 
		}
        if (inner.includes('||') || inner.includes('&&')) {
          const parts = inner.split(/(\|\||&&)/);
          const formatted = parts
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0)
            .map((p: string, index: number) => {
              if (p === '||' || p === '&&') {
                return `    ${p}`;
              }
              return index === 0 ? `    ${p}` : `    ${p}`;
            })
            .join('\n');
          return `if (\n${formatted}\n) {`;
        }
        return match;
      }
    );

    // Преобразование однострочных if в многострочный формат
    text = text.replace(
      /if\s*\(([^)]+)\)\s*continue\s*;/g,
      (match, cond) => {
        return `if (${cond}) {\n    continue;\n}`;
      }
    );

    text = text.replace(
      /if\s*\(([^)]+)\)\s*\{\s*continue\s*;\s*\}/g,
      (match, cond) => {
        return `if (${cond}) {\n    continue;\n}`;
      }
    );

    text = text.replace(
      /if\s*\(([^)]+)\)\s*\n\s*continue\s*;/gm,
      (match, cond) => {
        return `if (${cond}) {\n    continue;\n}`;
      }
    );

    text = text.replace(
      /if\s*\(([^)]+)\)\s*([^{][^;]*);/g,
      (match, cond, statement) => {
        if (match.includes('{')) {
          return match;
        }
        return `if (${cond}) {\n    ${statement.trim()};\n}`;
      }
    );

    text = text.replace(
      /if\s*\(([^)]+)\)\s*([^{][^;]*[^;])\s*$/gm,
      (match, cond, statement) => {
        if (match.includes('{')) {
          return match;
        }
        const trimmed = statement.trim();
        if (trimmed.includes('=') || trimmed.includes('(')) {
          return `if (${cond}) {\n    ${trimmed};\n}`;
        }
        return match;
      }
    );

    text = text.replace(
      /else\s+if\s*\(([^)]+)\)\s*([^{][^;]*[^;])\s*$/gm,
      (match, cond, statement) => {
        if (match.includes('{')) {
          return match;
        }
        const trimmed = statement.trim();
        if (trimmed.includes('=') || trimmed.includes('(')) {
          return `else if (${cond}) {\n    ${trimmed};\n}`;
        }
        return match;
      }
    );

    text = text.replace(
      /else\s+([^{][^;]*[^;])\s*$/gm,
      (match, statement) => {
        if (match.includes('{')) {
          return match;
        }
        const trimmed = statement.trim();
        return `else {\n    ${trimmed};\n}`;
      }
    );

    text = text.replace(
      /else\s+([^{][^;]*);\s*$/gm,
      (match, statement) => {
        if (match.includes('{')) {
          return match;
        }
        const trimmed = statement.trim();
        return `else {\n    ${trimmed};\n}`;
      }
    );

    // Именование функций: UpperCamelCase (кроме main)
	const funcRegex = /(\w[\w\s\*\&]+)\s+([a-zA-Z]\w*)\s*\(([^)]*)\)\s*\{/g;

	text = text.replace(funcRegex, (match, ret, name, params) => {
		if (name === 'main' || name === 'if') {
			return match;
		}

		const camel = name
			.split(/_|(?=[A-Z])/)
			.filter(Boolean)
			.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
			.join('');

		if (camel !== name) {
			renameDictionary.set(name, camel);
			renamedItems.push(`${name} → ${camel}`);
		}

		return `${ret.trim()} ${camel}(${params.trim()}) {`;
	});

    // Именование struct и class: UpperCamelCase
    text = text.replace(
      /struct\s+([a-zA-Z]\w*)/g,
      (match, name) => {
        const camel = name
          .split(/_|(?=[A-Z])/)
          .filter(Boolean)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
          .join('');

        if (camel !== name) {
          renameDictionary.set(name, camel);
          renamedItems.push(`${name} → ${camel}`);
        }

        return `struct ${camel}`;
      }
    );

    text = text.replace(
      /class\s+([a-zA-Z]\w*)/g,
      (match, name) => {
        const camel = name
          .split(/_|(?=[A-Z])/)
          .filter(Boolean)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
          .join('');

        if (camel !== name) {
          renameDictionary.set(name, camel);
          renamedItems.push(`${name} → ${camel}`);
        }

        return `class ${camel}`;
      }
    );

    // Именование констант
    
    // Макросы: UPPER_SNAKE_CASE
    text = text.replace(
      /#define\s+([a-z][a-zA-Z0-9_]*)/g,
      (match, name) => {
        const upperSnake = name
          .replace(/([A-Z])/g, '_$1')
          .replace(/^_/, '')
          .toUpperCase();
        
        if (upperSnake !== name) {
          renameDictionary.set(name, upperSnake);
          renamedItems.push(`${name} → ${upperSnake}`);
        }
        
        return `#define ${upperSnake}`;
      }
    );

    // Глобальные/статические константы: k + CamelCase
    text = text.replace(
      /((?:static\s+)?(?:constexpr\s+)?const\s+\w+\s+)([a-zA-Z][a-zA-Z0-9_]*)/g,
      (match, prefix, name) => {
        if (name.startsWith('k')) {
          return match;
        }
        
        const camelCase = name
          .split(/_/)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join('');
        
        const kCamelCase = 'k' + camelCase;
        
        if (kCamelCase !== name) {
          renameDictionary.set(name, kCamelCase);
          renamedItems.push(`${name} → ${kCamelCase}`);
        }
        
        return `${prefix}${kCamelCase}`;
      }
    );

    text = text.replace(
      /(constexpr\s+\w+\s+)([a-zA-Z][a-zA-Z0-9_]*)/g,
      (match, prefix, name) => {
        if (name.startsWith('k')) {
          return match;
        }
        
        const camelCase = name
          .split(/_/)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join('');
        
        const kCamelCase = 'k' + camelCase;
        
        if (kCamelCase !== name) {
          renameDictionary.set(name, kCamelCase);
          renamedItems.push(`${name} → ${kCamelCase}`);
        }
        
        return `${prefix}${kCamelCase}`;
      }
    );

    // Локальные константы: camelCase
    text = text.replace(
      /(\s+const\s+\w+\s+)([A-Z][a-zA-Z0-9_]*)/g,
      (match, prefix, name) => {
        if (name.startsWith('k') || /^[a-z]/.test(name)) {
          return match;
        }
        
        const camelCase = name.charAt(0).toLowerCase() + name.slice(1);
        
        if (camelCase !== name) {
          renameDictionary.set(name, camelCase);
          renamedItems.push(`${name} → ${camelCase}`);
        }
        
        return `${prefix}${camelCase}`;
      }
    );

    // Применение переименований по всему коду
    renameDictionary.forEach((newName, oldName) => {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      text = text.replace(regex, newName);
    });

    // Обрезка длинных строк
    const lines = text.split(/\r?\n/).map((line) => {
      if (line.length > 120) {
        return line.slice(0, 120) + ' // ← обрезано';
      }
      return line;
    });
    text = lines.join('\n');

    await editor.edit((editBuilder) => {
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(document.lineCount, 0);
      editBuilder.replace(new vscode.Range(start, end), text);
    });

    const renameCount = renameDictionary.size;
    const usageCount = Array.from(renameDictionary.values()).reduce((total, newName) => {
      const regex = new RegExp(`\\b${newName}\\b`, 'g');
      const matches = text.match(regex);
      return total + (matches ? matches.length : 0);
    }, 0);

    vscode.window.showInformationMessage(
      `Кодстайл исправлен. Переименовано элементов: ${renameCount}, применено изменений: ${usageCount}`
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}