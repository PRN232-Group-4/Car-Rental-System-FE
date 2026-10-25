import { beforeEach, test } from '@e2e-dev/web';
import { expect } from 'e2e';

const rental = {
  id: 77, customerId: 1, vehicleId: 8, status: 'pre_inspection', rentalType: 'hourly', hasDriver: false,
  isSubscription: false, totalPrice: 120000, vatPrice: 0, depositPrice: 0, overtimePrice: 0,
  startTime: '2027-01-01T02:00:00Z', endTime: '2027-01-01T04:00:00Z', hasPostInspection: false,
};

beforeEach(async ({ browser }) => {
  let handoverReads = 0;
  let handedOver = false;
  let resolved = false;
  let paid = false;
  await browser.onDialog('accept');
  await browser.route(/maps\.googleapis\.com|maps\.gstatic\.com|api\.mapbox\.com|events\.mapbox\.com/, (route) => route.abort());
  await browser.route('**/api/**', async (route) => {
    const path = new URL(route.request.url).pathname;
    const method = route.request.method;
    const invoice = { id: 42, rentalId: 77, invoiceNumber: 'INV-42', amount: 120000, paymentMethod: 'cash', status: paid ? 'paid' : 'unpaid', canPay: !paid, orderId: paid ? 909 : null };
    const detail = { rental: { ...rental, scheduledStart: rental.startTime, scheduledEnd: rental.endTime },
      orderId: paid ? 909 : null, customerName: 'Khách kiểm thử', customerEmail: 'customer@example.test',
      vehicleBrand: 'Honda', vehicleModel: 'City', licensePlate: '51A-12345', invoice,
      hasPassingPreInspection: handoverReads > 1, hasPostInspection: false };
    const alert = { id: 5, vehicleId: 8, rentalId: 77, alertType: 'geofence_exit', message: 'Xe rời vùng hoạt động',
      severity: 'warning', lat: 10.77, lng: 106.69, createdAt: '2027-01-01T02:00:00Z', isResolved: resolved,
      resolvedAt: resolved ? '2027-01-01T03:00:00Z' : null, resolvedBy: resolved ? 'admin@example.test' : null };
    let data: unknown = { items: [], page: 1, pageSize: 100, totalCount: 0 };
    if (path.endsWith('/account/profile')) data = { email: 'admin@example.test', fullName: 'Quản trị viên', roles: ['Admin'] };
    else if (path.endsWith('/geofences')) data = [];
    else if (path.endsWith('/tracking/alerts/5/resolve')) {
      expect(method).toBe('POST');
      resolved = true;
      data = { ...alert, isResolved: true, resolvedAt: '2027-01-01T03:00:00Z' };
    } else if (path.endsWith('/tracking/alerts')) data = { items: resolved ? [] : [alert], page: 1, pageSize: 20, totalCount: resolved ? 0 : 1 };
    else if (path.endsWith('/rentals/77/detail')) data = detail;
    else if (path.endsWith('/rentals/77/inspection-assignment')) data = null;
    else if (path.endsWith('/rentals/77')) data = { ...rental, hasPassingPreInspection: true };
    else if (path.endsWith('/handovers/77/confirm')) {
      expect(method).toBe('POST');
      expect(handoverReads).toBeGreaterThan(1);
      handedOver = true;
      data = { rentalId: 77, status: 'completed', rentalStatus: 'renting' };
    } else if (path.endsWith('/handovers/77')) {
      handoverReads++;
      data = { rental: { ...detail, hasPassingPreInspection: handoverReads > 1 }, status: handedOver ? 'completed' : 'pending' };
    } else if (path.endsWith('/invoices/42/cash-confirmation')) {
      expect(method).toBe('POST');
      paid = true;
      data = { paymentId: 1, invoiceId: 42, status: 'paid', orderId: 909 };
    } else if (path.endsWith('/invoices/42')) data = invoice;
    else if (path.endsWith('/vehicles/8')) data = { id: 8, brand: 'Honda', model: 'City', detail: null };
    await route.fulfill({ json: { code: 200, status: 'success', is_success: true, data, message: 'OK', error: null } });
  });
});

test('tracking route renders and resolves a real API-shaped alert', async ({ app, browser, screen }) => {
  await app.open('/admin/tracking');
  await expect(screen.getByRole('heading', { name: 'Vùng địa lý và cảnh báo' })).toBeVisible();
  for (const width of [1600, 1280, 390]) {
    await browser.setViewport({ width, height: 950 });
    for (const theme of ['light', 'dark']) {
      await browser.evaluate((value) => document.documentElement.setAttribute('data-admin-theme', value), theme);
      expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await app.screenshot(`tracking-${width}-${theme}`);
    }
  }
  await screen.getByRole('button', { name: 'Xem và xử lý cảnh báo', exact: true }).click();
  await expect(screen.getByRole('heading', { name: 'Chi tiết cảnh báo' })).toBeVisible();
  await screen.getByRole('button', { name: 'Xác nhận đã xử lý cảnh báo', exact: true }).click();
  await expect(screen.getByRole('status').filter({ hasText: 'Đã xử lý' }).first()).toBeVisible();
});

test('handover route blocks uninspected rentals, reloads readiness and confirms once ready', async ({ app, browser, screen }) => {
  await app.open('/admin/handovers?rentalId=77');
  const confirm = screen.getByRole('button', { name: 'Xác nhận đã bàn giao xe', exact: true });
  await expect(confirm).toBeDisabled();
  for (const width of [1600, 1280, 390]) {
    await browser.setViewport({ width, height: 950 });
    await browser.locator('#rental-detail').scrollIntoView();
    for (const theme of ['light', 'dark']) {
      await browser.evaluate((value) => document.documentElement.setAttribute('data-admin-theme', value), theme);
      expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await app.screenshot(`handover-${width}-${theme}`);
    }
  }
  await expect(screen.getByRole('link', { name: 'Mở phiếu kiểm tra', exact: true })).toHaveAttribute('href', '/admin/inspections?rentalId=77');
  await screen.getByRole('button', { name: 'Tải lại kết quả kiểm tra', exact: true }).click();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(screen.getByText('Đã xác nhận bàn giao xe. Đơn chuyển sang đang thuê.').first()).toBeVisible();
  await expect(confirm).toBeHidden();
});

test('handover failure keeps the record and permits retry without claiming success', async ({ app, browser, screen }) => {
  await browser.route('**/api/handovers/77/confirm', (route) => route.fulfill({ status: 409, json: {
    code: 409, status: 'error', is_success: false, data: null, message: 'Chưa đủ điều kiện bàn giao. Vui lòng kiểm tra thanh toán.', error: {},
  } }));
  await app.open('/admin/handovers?rentalId=77');
  await screen.getByRole('button', { name: 'Tải lại kết quả kiểm tra', exact: true }).click();
  const confirm = screen.getByRole('button', { name: 'Xác nhận đã bàn giao xe', exact: true });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(screen.getByRole('alert').filter({ hasText: 'Chưa đủ điều kiện bàn giao' }).first()).toBeVisible();
  await expect(confirm).toBeEnabled();
  await expect(screen.getByRole('heading', { name: 'Bàn giao phương tiện' })).toBeVisible();
  await expect(screen.getByText('Đã xác nhận bàn giao xe. Đơn chuyển sang đang thuê.')).toHaveCount(0);
});

test('rental list retains editing and loads the invoice for a flat rental before cash collection', async ({ app, screen }) => {
  await app.open('/admin/rentals?view=list&rentalId=77');
  await expect(screen.getByRole('button', { name: 'Sửa yêu cầu', exact: true })).toBeVisible();
  const confirm = screen.getByRole('button', { name: 'Xác nhận đã thu tiền mặt', exact: true });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(screen.getByText('Đã thu tiền mặt và phát hành đơn thuê chính thức #909.').first()).toBeVisible();
  await expect(confirm).toBeHidden();
});
