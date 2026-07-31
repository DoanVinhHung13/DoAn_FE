import assert from "node:assert/strict"
import test from "node:test"
import {
  applyApiFieldErrors,
  isNotFoundError,
  normalizeApiError,
} from "../src/services/core/apiError.js"

const response = (body, status = 400) => ({ response: { data: body, status } })

test("preserves a valid backend ApiResponse contract", () => {
  const error = normalizeApiError(response({
    success: false,
    message: "Du lieu khong hop le",
    code: "VALIDATION_ERROR",
    errors: ["Ngay bat dau la bat buoc"],
    fieldErrors: [{ field: "StartDate", code: "VALIDATION_ERROR", message: "Bat buoc" }],
    traceId: "trace-123",
  }))

  assert.equal(error.kind, "api")
  assert.equal(error.message, "Du lieu khong hop le")
  assert.equal(error.code, "VALIDATION_ERROR")
  assert.equal(error.status, 400)
  assert.deepEqual(error.errors, ["Ngay bat dau la bat buoc"])
  assert.deepEqual(error.fieldErrors, [{ field: "StartDate", code: "VALIDATION_ERROR", message: "Bat buoc" }])
  assert.equal(error.traceId, "trace-123")
})

test("is idempotent for an already normalized API error", () => {
  const normalized = normalizeApiError(response({
    success: false,
    message: "Backend error",
    code: "VALIDATION_ERROR",
    errors: ["Invalid import"],
    fieldErrors: [{ field: "File", message: "File is required" }],
    traceId: "trace-idempotent",
  }))

  const again = normalizeApiError(normalized)

  assert.strictEqual(again, normalized)
  assert.equal(again.message, normalized.message)
  assert.equal(again.code, normalized.code)
  assert.equal(again.status, normalized.status)
  assert.deepEqual(again.errors, normalized.errors)
  assert.deepEqual(again.fieldErrors, normalized.fieldErrors)
  assert.equal(again.traceId, normalized.traceId)
  assert.equal(again.kind, normalized.kind)
})

test("preserves NOT_FOUND and UNAUTHORIZED messages, status, and code", () => {
  for (const [code, status] of [["NOT_FOUND", 404], ["UNAUTHORIZED", 401]]) {
    const error = normalizeApiError(response({
      success: false,
      message: `Backend ${code}`,
      code,
      errors: [],
      fieldErrors: [],
    }, status))

    assert.equal(error.message, `Backend ${code}`)
    assert.equal(error.code, code)
    assert.equal(error.status, status)
  }
})

test("recognizes NOT_FOUND by code before the legacy status fallback", () => {
  assert.equal(isNotFoundError({ code: "NOT_FOUND", status: 500 }), true)
  assert.equal(isNotFoundError({ code: "BAD_REQUEST", status: 404 }), false)
  assert.equal(isNotFoundError({ status: 404 }), true)
})

test("preserves VALIDATION_ERROR fieldErrors without mutation", () => {
  const fieldErrors = [{ field: "Name", code: "VALIDATION_ERROR", message: "Ten la bat buoc" }]
  const error = normalizeApiError(response({
    success: false,
    message: "Du lieu khong hop le",
    code: "VALIDATION_ERROR",
    errors: [],
    fieldErrors,
  }))

  assert.deepEqual(error.fieldErrors, fieldErrors)
  assert.notStrictEqual(error.fieldErrors, undefined)
  assert.deepEqual(fieldErrors, [{ field: "Name", code: "VALIDATION_ERROR", message: "Ten la bat buoc" }])
})

test("uses safe network, timeout, and malformed-response fallbacks", () => {
  const network = normalizeApiError({ code: "ERR_NETWORK", message: "raw axios network message" })
  const timeout = normalizeApiError({ code: "ECONNABORTED", message: "raw axios timeout message" })
  const malformed = normalizeApiError(response({ message: "not an envelope" }, 500))

  assert.equal(network.kind, "network")
  assert.equal(network.message, "Không thể kết nối đến hệ thống. Vui lòng kiểm tra đường truyền và thử lại.")
  assert.equal(timeout.kind, "timeout")
  assert.equal(timeout.message, "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.")
  assert.equal(malformed.kind, "unknown")
  assert.equal(malformed.message, "Yêu cầu thất bại. Vui lòng thử lại sau.")
  assert.notEqual(malformed.message, "not an envelope")
})

test("maps verified fields and leaves the normalized error unchanged", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Du lieu khong hop le",
    fieldErrors: [
      { field: "Name", message: "Ten la bat buoc" },
      { field: "Name", message: "Thong diep thu hai" },
      { field: "Unknown", message: "Khong duoc map" },
    ],
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, { Name: "name" })

  assert.equal(mapped, 1)
  assert.deepEqual(calls, [[{ name: "name", errors: ["Ten la bat buoc"] }]])
  assert.equal(error.message, "Du lieu khong hop le")
  assert.equal(error.fieldErrors.length, 3)
})

test("does not map malformed or non-API field errors", () => {
  const form = { setFields: () => assert.fail("setFields must not be called") }

  assert.equal(applyApiFieldErrors(form, { kind: "network", fieldErrors: [] }, { Name: "name" }), 0)
  assert.equal(applyApiFieldErrors(form, { kind: "api", fieldErrors: null }, { Name: "name" }), 0)
  assert.equal(applyApiFieldErrors(form, { kind: "api", fieldErrors: {} }, { Name: "name" }), 0)
})

test("maps UserFormModal backend fields without changing values or crashing on unknown fields", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Thong tin nguoi dung khong hop le",
    fieldErrors: [
      { field: "FullName", message: "Ho ten da ton tai" },
      { field: "PhoneNumber", message: "So dien thoai khong hop le" },
      { field: "UnexpectedBackendField", message: "Khong co tren form" },
    ],
  }
  const mapping = {
    FullName: "fullName",
    Email: "email",
    PhoneNumber: "phoneNumber",
    DateOfBirth: "dateOfBirth",
    Gender: "gender",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "fullName", errors: ["Ho ten da ton tai"] },
    { name: "phoneNumber", errors: ["So dien thoai khong hop le"] },
  ]])
  assert.equal(error.message, "Thong tin nguoi dung khong hop le")
  assert.equal(error.fieldErrors.length, 3)
})

test("maps Fertilizer top-level fields and safely ignores unresolved nested fields", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Du lieu phan bon khong hop le",
    fieldErrors: [
      { field: "Name", message: "Ten phan bon da ton tai" },
      { field: "MinimumStock", message: "Ton kho toi thieu khong hop le" },
      { field: "Compositions[0].Value", message: "Gia tri thanh phan khong hop le" },
      { field: "UnknownBackendField", message: "Khong co tren form" },
    ],
  }
  const mapping = {
    Name: "name",
    MinimumStock: "minimumStock",
    Unit: "unit",
    UsageUnit: "usageUnit",
    Supplier: "supplier",
    MaterialId: "materialId",
    InventoryQuantity: "inventoryQuantity",
    InventoryUnit: "inventoryUnit",
    Description: "description",
    Type: "type",
    Manufacturer: "manufacturer",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "name", errors: ["Ten phan bon da ton tai"] },
    { name: "minimumStock", errors: ["Ton kho toi thieu khong hop le"] },
  ]])
  assert.equal(error.message, "Du lieu phan bon khong hop le")
  assert.equal(error.fieldErrors.length, 4)
})

test("maps CultivationLogbook top-level fields and defers nested stage paths safely", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Nhat ky canh tac khong hop le",
    fieldErrors: [
      { field: "LogbookName", message: "Ten nhat ky da ton tai" },
      { field: "AssignedFarmSupervisorId", message: "Giam sat vien khong hop le" },
      { field: "CultivationStages[0].StageName", message: "Ten giai doan khong hop le" },
    ],
  }
  const mapping = {
    LogbookName: "logbookName",
    CropId: "cropId",
    LandPlotIds: "landPlotIds",
    LandPlotId: "landPlotIds",
    StartDate: "expectedStartDate",
    ExpectedEndDate: "expectedEndDate",
    AssignedFarmSupervisorId: "assignedFarmSupervisorId",
    Description: "description",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "logbookName", errors: ["Ten nhat ky da ton tai"] },
    { name: "assignedFarmSupervisorId", errors: ["Giam sat vien khong hop le"] },
  ]])
  assert.equal(error.message, "Nhat ky canh tac khong hop le")
  assert.equal(error.fieldErrors.length, 3)
})

test("maps PlanTemplate top-level fields and leaves dynamic step paths for fallback", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Mau quy trinh khong hop le",
    fieldErrors: [
      { field: "Name", message: "Ten mau da ton tai" },
      { field: "CropId", message: "Cay trong khong hop le" },
      { field: "Steps[0].StepName", message: "Ten buoc khong hop le" },
    ],
  }
  const mapping = {
    CropCatalogId: "cropCatalogId",
    CropId: "cropId",
    Name: "name",
    Description: "description",
    EstimatedDurationDays: "estimatedDurationDays",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "name", errors: ["Ten mau da ton tai"] },
    { name: "cropId", errors: ["Cay trong khong hop le"] },
  ]])
  assert.equal(error.message, "Mau quy trinh khong hop le")
  assert.equal(error.fieldErrors.length, 3)
})

test("maps Inventory import fields and ignores non-form fields safely", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Inventory import failed",
    fieldErrors: [
      { field: "Quantity", message: "Quantity is invalid" },
      { field: "Unit", message: "Unit is invalid" },
      { field: "MaterialId", message: "Material is invalid" },
    ],
  }
  const mapping = {
    Quantity: "quantity",
    Unit: "unit",
    Note: "note",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "quantity", errors: ["Quantity is invalid"] },
    { name: "unit", errors: ["Unit is invalid"] },
  ]])
  assert.equal(error.message, "Inventory import failed")
  assert.equal(error.fieldErrors.length, 3)
})

test("maps DailyLog top-level fields and defers nested collection paths", () => {
  const calls = []
  const error = {
    kind: "api",
    message: "Daily log is invalid",
    fieldErrors: [
      { field: "Date", message: "Date is required" },
      { field: "Description", message: "Description is required" },
      { field: "Fertilizers[0].Quantity", message: "Quantity is invalid" },
      { field: "Images[0].Url", message: "Image is invalid" },
    ],
  }
  const mapping = {
    Date: "date",
    Description: "description",
  }

  const mapped = applyApiFieldErrors({ setFields: fields => calls.push(fields) }, error, mapping)

  assert.equal(mapped, 2)
  assert.deepEqual(calls, [[
    { name: "date", errors: ["Date is required"] },
    { name: "description", errors: ["Description is required"] },
  ]])
  assert.equal(error.message, "Daily log is invalid")
  assert.equal(error.fieldErrors.length, 4)
})
