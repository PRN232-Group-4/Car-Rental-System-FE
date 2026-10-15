import ts from 'typescript';

/** Enforce the shared popup and submit area in Admin consumers, including local JSX variables. */
export function adminPopupViolations(content, fileName) {
  const source = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const variables = new Map();
  const violations = [];
  const collectVariables = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) variables.set(node.name.text, node.initializer);
    ts.forEachChild(node, collectVariables);
  };
  collectVariables(source);
  const tag = (node) => ts.isJsxElement(node) ? node.openingElement.tagName.getText(source)
    : ts.isJsxSelfClosingElement(node) ? node.tagName.getText(source) : '';
  const report = (node, message) => violations.push({
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
    message,
  });
  const inspect = (node) => {
    if (tag(node) === 'dialog') report(node, 'Popup Admin phải dùng FormDialog chung, không dựng thẻ dialog riêng.');
    if (tag(node) === 'FormDialog') {
      let found = false;
      const visited = new Set();
      const walk = (child, insideForm = false) => {
        if (ts.isIdentifier(child) && ts.isJsxExpression(child.parent)) {
          const variable = variables.get(child.text);
          if (variable && !visited.has(variable)) {
            visited.add(variable);
            walk(variable, insideForm);
          }
        }
        const name = tag(child);
        const inForm = insideForm || name === 'ValidatedForm';
        if (name === 'FormDialogFooter') {
          found = true;
          if (!inForm) report(child, 'FormDialogFooter phải nằm trong ValidatedForm để giữ submit và lỗi inline.');
        }
        ts.forEachChild(child, (descendant) => walk(descendant, inForm));
      };
      walk(node);
      if (!found) report(node, 'Popup tạo/chỉnh sửa phải có FormDialogFooter chung cho vùng thao tác sticky.');
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return violations;
}
