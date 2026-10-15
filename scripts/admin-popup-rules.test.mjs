import { test } from 'vitest';
import assert from 'node:assert/strict';
import { adminPopupViolations } from './admin-popup-rules.mjs';

test('accepts a footer within the validated form, including a local content variable', () => {
  const source = 'const content = <ValidatedForm><input/><FormDialogFooter><button type="submit"/></FormDialogFooter></ValidatedForm>; const view = <FormDialog>{content}</FormDialog>;';
  assert.deepEqual(adminPopupViolations(source, 'test.tsx'), []);
});

test('rejects a footer missing from one of multiple dialogs in a file', () => {
  const source = '<><FormDialog><ValidatedForm><FormDialogFooter/></ValidatedForm></FormDialog><FormDialog><ValidatedForm/></FormDialog></>';
  assert.equal(adminPopupViolations(source, 'test.tsx').length, 1);
});

test('rejects footer outside form and hand-built dialog markup', () => {
  assert.equal(adminPopupViolations('<FormDialog><ValidatedForm/><FormDialogFooter/></FormDialog>', 'test.tsx').length, 1);
  assert.equal(adminPopupViolations('<dialog><form/></dialog>', 'test.tsx').length, 1);
});
