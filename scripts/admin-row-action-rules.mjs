import ts from 'typescript';

/** Keep action cells on the shared semantic icon/label API, including JSX stored in local variables. */
export function adminRowActionViolations(content, fileName) {
  const source = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const variables = new Map();
  const violations = [];
  const collectVariables = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) variables.set(node.name.text, node.initializer);
    ts.forEachChild(node, collectVariables);
  };
  collectVariables(source);
  const opening = (node) => ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : undefined;
  const tag = (node) => opening(node)?.tagName.getText(source);
  const report = (node, message) => violations.push({
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
    message,
  });
  const inspect = (node) => {
    const element = opening(node);
    if (tag(node) === 'td' && element.attributes.properties.some((prop) => ts.isJsxAttribute(prop) && prop.name.getText(source) === 'data-actions')) {
      const visited = new Set();
      const walk = (child) => {
        if (ts.isIdentifier(child) && ts.isJsxExpression(child.parent)) {
          const variable = variables.get(child.text);
          if (variable && !visited.has(variable)) {
            visited.add(variable);
            walk(variable);
          }
        }
        const name = tag(child);
        if (name === 'AdminRowAction') {
          if (ts.isJsxElement(child)) report(child, 'AdminRowAction chỉ hiển thị icon; truyền nhãn qua label, không truyền nội dung chữ hoặc icon riêng.');
          return;
        }
        if (name && !['td', 'div', 'span', 'p', 'small', 'em', 'strong'].includes(name)) {
          report(child, 'Thao tác trong td data-actions phải dùng AdminRowAction với action và label; icon được chọn tại row-action-rules.ts.');
          return;
        }
        ts.forEachChild(child, walk);
      };
      walk(node);
      return;
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return violations;
}
