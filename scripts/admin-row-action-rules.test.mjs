import { describe, expect, it } from 'vitest';
import { adminRowActionViolations } from './admin-row-action-rules.mjs';

const check = (jsx) => adminRowActionViolations(jsx, 'src/features/admin/Example.tsx');

describe('Admin table action rules', () => {
  it('accepts shared semantic controls, wrappers, conditions and empty labels', () => {
    expect(check('const cell = <td data-actions><div>{canEdit && <AdminRowAction action="edit" label="Sửa xe" onClick={edit} />}{url ? <AdminRowAction action="view" label="Xem đơn" href={url} /> : "—"}</div></td>')).toEqual([]);
  });

  it.each(['<button>Sửa</button>', '<Button>Xóa</Button>', '<a href="/details">Chi tiết</a>', '<Link href="/details">Xem</Link>', '<Pencil />', '<CustomActions />'])(
    'rejects a custom action or icon: %s', (control) => {
      const violations = check(`const cell = <td data-actions>${control}</td>`);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('AdminRowAction');
    },
  );

  it('resolves local JSX variables so controls cannot bypass the rule', () => {
    expect(check('const controls = <div><button>Sửa</button></div>; const cell = <td data-actions>{controls}</td>')).toHaveLength(1);
  });

  it('rejects visible text or icon children passed to the shared action', () => {
    expect(check('const cell = <td data-actions><AdminRowAction action="edit" label="Sửa">Sửa</AdminRowAction></td>')).toHaveLength(1);
  });

  it('leaves header, form, filter and record identity links alone', () => {
    expect(check('const content = <><button>Thêm xe</button><th data-actions>Thao tác</th><td><Link href="/vehicle">Tên xe</Link></td><form><Button>Lưu</Button></form></>')).toEqual([]);
  });
});
