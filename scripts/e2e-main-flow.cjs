/**
 * E2E Main Flow: FM → FS → FL
 * node scripts/e2e-main-flow.cjs
 */
const BASE = process.env.API_ROOT || 'https://api.eapls.io.vn/api'

const ACCOUNTS = {
  FM: { identifier: 'farmmanager@eapls.com', password: 'Abc@1234' },
  FS: { identifier: 'farmsupervisor@eapls.com', password: 'Abc@1234' },
  FL: { identifier: 'farmleader@eapls.com', password: 'Abc@1234' },
}

const log = (...args) => console.log(...args)
const ok = (msg) => log(`  ✅ ${msg}`)
const fail = (msg) => log(`  ❌ ${msg}`)
const step = (n, title) => log(`\n${'='.repeat(64)}\nBƯỚC ${n}: ${title}\n${'='.repeat(64)}`)

async function api(method, path, { token, body, query } = {}) {
  const url = new URL(BASE.replace(/\/$/, '') + path)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, String(v))
    })
  }
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text?.slice(0, 300) }
  }
  return {
    status: res.status,
    ok: res.ok && json?.success !== false,
    success: json?.success,
    message: json?.message,
    data: json?.data,
    errors: json?.errors,
    json,
  }
}

async function login(roleKey) {
  const acc = ACCOUNTS[roleKey]
  const r = await api('POST', '/auth/login', { body: acc })
  if (!r.ok || !r.data?.accessToken) {
    fail(`Login ${roleKey} (${acc.identifier}) — ${r.status} ${r.message}`)
    throw new Error(`Login failed: ${roleKey}`)
  }
  ok(`Login ${roleKey} — ${acc.identifier}`)
  const me = await api('GET', '/auth/me', { token: r.data.accessToken })
  ok(`Role: ${(me.data?.roles || []).join(', ')} | ${me.data?.fullName}`)
  return { token: r.data.accessToken, user: me.data }
}

function unwrapItems(data) {
  if (Array.isArray(data)) return data
  if (data?.items) return data.items
  return []
}

async function main() {
  const ctx = {
    logbookId: null,
    stageId: null,
    taskId: null,
    landPlotId: null,
    cropId: null,
    supervisorId: null,
    leaderId: null,
  }

  log(`API: ${BASE}`)
  log(`E2E Main Flow: FM → FS → FL`)

  // ─── STEP 1: FM CREATE PLAN ─────────────────────────────────────────
  step(1, 'Farm Manager — Tạo kế hoạch (cultivation-logbook)')
  const fm = await login('FM')

  const lands = await api('GET', '/land-plots/available-for-logbook', { token: fm.token })
  const landItems = unwrapItems(lands.data)
  if (!lands.ok || !landItems.length) {
    fail(`available-for-logbook: ${lands.status} count=${landItems.length}`)
    throw new Error('No available land plots')
  }
  ctx.landPlotId = landItems[0].id
  ok(`Land: ${landItems[0].name} (${ctx.landPlotId})`)

  const crops = await api('GET', '/crops', {
    token: fm.token,
    query: { PageIndex: 1, PageSize: 20 },
  })
  const cropItems = unwrapItems(crops.data).filter((c) => c.isActive !== false)
  if (!crops.ok || !cropItems.length) throw new Error('No crops')
  ctx.cropId = cropItems[0].id
  ok(`Crop: ${cropItems[0].name} (${ctx.cropId})`)

  const supervisors = await api('GET', '/users', {
    token: fm.token,
    query: { Role: 'FARM_SUPERVISOR', PageIndex: 1, PageSize: 20 },
  })
  const supervisorItems = unwrapItems(supervisors.data)
  const fsUser = supervisorItems.find((u) =>
    (u.roles || []).includes('FARM_SUPERVISOR')
  ) || supervisorItems.find((u) => u.email === ACCOUNTS.FS.identifier) || supervisorItems[0]
  if (!fsUser) throw new Error('No FARM_SUPERVISOR user')
  ctx.supervisorId = fsUser.id
  ok(`Supervisor: ${fsUser.fullName} (${ctx.supervisorId})`)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const createBody = {
    landPlotId: ctx.landPlotId,
    cropId: ctx.cropId,
    logbookName: `E2E Plan ${stamp}`,
    description: 'Kế hoạch E2E tự động — FM tạo',
    assignedFarmSupervisorId: ctx.supervisorId,
    cultivationStages: [
      {
        stageName: 'Làm đất',
        stageOrder: 1,
        description: 'Cày xới, xử lý đất trước gieo trồng',
      },
      {
        stageName: 'Chăm sóc',
        stageOrder: 2,
        description: 'Tưới nước, bón phân theo quy trình',
      },
    ],
  }

  const created = await api('POST', '/cultivation-logbooks', {
    token: fm.token,
    body: createBody,
  })
  if (!created.ok) {
    fail(`POST cultivation-logbooks: ${created.status} ${created.message}`)
    console.log(JSON.stringify(created.json, null, 2))
    throw new Error('Create logbook failed')
  }
  ctx.logbookId = created.data?.id || created.data?.cultivationLogbookId
  ok(`Created logbook: ${created.data?.logbookName || ''} (${ctx.logbookId}) status=${created.data?.status}`)

  // plan + start if needed
  if (created.data?.status === 'DRAFT' || created.data?.status === 'CREATED') {
    const planned = await api('POST', `/cultivation-logbooks/${ctx.logbookId}/plan`, { token: fm.token })
    ok(`plan → ${planned.ok ? planned.message : planned.message + ' ' + planned.status}`)
  }

  const started = await api('POST', `/cultivation-logbooks/${ctx.logbookId}/start`, { token: fm.token })
  if (started.ok) ok(`start → ${started.message}`)
  else log(`  ⚠️ start skipped/failed: ${started.status} ${started.message}`)

  const detail = await api('GET', `/cultivation-logbooks/${ctx.logbookId}`, { token: fm.token })
  ok(`Detail status=${detail.data?.status} stages=${(detail.data?.cultivationStages || []).length}`)

  // ─── STEP 2: FS CREATE TASKS ────────────────────────────────────────
  step(2, 'Farm Supervisor — Tạo Work Tasks + Assign + Start')
  const fs = await login('FS')

  const stagesRes = await api('GET', `/cultivation-stages/logbook/${ctx.logbookId}`, {
    token: fs.token,
  })
  const stages = unwrapItems(stagesRes.data)
  if (!stagesRes.ok || !stages.length) {
    // fallback from detail
    const stagesFromDetail = detail.data?.cultivationStages || []
    if (!stagesFromDetail.length) throw new Error('No stages')
    ctx.stageId = stagesFromDetail[0].id
    ok(`Stage (from detail): ${stagesFromDetail[0].stageName} (${ctx.stageId})`)
  } else {
    ctx.stageId = stages[0].id
    ok(`Stage: ${stages[0].stageName} (${ctx.stageId}) status=${stages[0].status}`)
  }

  const catalogs = await api('GET', '/task-catalogs', {
    token: fs.token,
    query: { PageIndex: 1, PageSize: 20 },
  })
  const catalogItems = unwrapItems(catalogs.data)
  ok(`Task catalogs: ${catalogItems.length}`)

  const leaders = await api('GET', '/users', {
    token: fs.token,
    query: { Role: 'FARM_LEADER', PageIndex: 1, PageSize: 20 },
  })
  const leaderItems = unwrapItems(leaders.data)
  const flUser =
    leaderItems.find((u) => u.email === ACCOUNTS.FL.identifier) ||
    leaderItems.find((u) => (u.roles || []).includes('FARM_LEADER')) ||
    leaderItems[0]
  if (!flUser) throw new Error('No FARM_LEADER')
  ctx.leaderId = flUser.id
  ok(`Leader: ${flUser.fullName} (${ctx.leaderId})`)

  const farmers = await api('GET', '/users', {
    token: fs.token,
    query: { Role: 'FARMER', PageIndex: 1, PageSize: 5 },
  })
  const farmerIds = unwrapItems(farmers.data)
    .slice(0, 2)
    .map((u) => u.id)

  const bulkBody = {
    cultivationLogbookId: ctx.logbookId,
    cultivationStageId: ctx.stageId,
    tasks: [
      {
        taskCatalogId: catalogItems[0]?.id || null,
        name: catalogItems[0]?.name || `E2E Task ${stamp}`,
        description: catalogItems[0]?.description || 'Công việc E2E',
        leaderId: ctx.leaderId,
        farmerIds: farmerIds.length ? farmerIds : null,
      },
      {
        taskCatalogId: null,
        name: `Tưới nước E2E ${stamp}`,
        description: 'Tưới nước theo lịch E2E',
        leaderId: ctx.leaderId,
        farmerIds: farmerIds.length ? farmerIds : null,
      },
    ],
  }

  const bulk = await api('POST', '/cultivation-tasks/bulk', {
    token: fs.token,
    body: bulkBody,
  })
  if (!bulk.ok) {
    fail(`bulk create: ${bulk.status} ${bulk.message}`)
    console.log(JSON.stringify(bulk.json, null, 2))
    throw new Error('Bulk create failed')
  }
  ok(`Bulk create: ${bulk.message}`)

  // reload stages/tasks to get task ids
  const stages2 = await api('GET', `/cultivation-stages/logbook/${ctx.logbookId}`, {
    token: fs.token,
  })
  let tasks = []
  const stageList = unwrapItems(stages2.data)
  const stage = stageList.find((s) => s.id === ctx.stageId) || stageList[0]
  tasks = stage?.tasks || []

  if (!tasks.length) {
    const allTasks = await api('GET', '/cultivation-tasks', {
      token: fs.token,
      query: { PageIndex: 1, PageSize: 50 },
    })
    tasks = unwrapItems(allTasks.data).filter(
      (t) => t.cultivationLogbookId === ctx.logbookId
    )
  }

  if (!tasks.length) throw new Error('No tasks after bulk create')
  ctx.taskId = tasks[0].id
  ok(`Task picked: ${tasks[0].name} (${ctx.taskId}) status=${tasks[0].status}`)

  // ensure assign
  const updated = await api('PUT', `/cultivation-tasks/${ctx.taskId}`, {
    token: fs.token,
    body: {
      name: tasks[0].name,
      description: tasks[0].description || 'E2E',
      leaderId: ctx.leaderId,
      farmerIds: farmerIds.length ? farmerIds : null,
    },
  })
  if (updated.ok) ok(`Assign leader/farmers OK`)
  else log(`  ⚠️ assign: ${updated.status} ${updated.message}`)

  const startTask = await api('POST', `/cultivation-tasks/${ctx.taskId}/start`, {
    token: fs.token,
  })
  if (!startTask.ok) {
    fail(`start task: ${startTask.status} ${startTask.message}`)
    console.log(JSON.stringify(startTask.json, null, 2))
  } else {
    ok(`Task started: ${startTask.message}`)
  }

  const taskDetail = await api('GET', `/cultivation-tasks/${ctx.taskId}`, {
    token: fs.token,
  })
  ok(`Task after start: status=${taskDetail.data?.status} progress=${taskDetail.data?.progress} leader=${taskDetail.data?.assignedLeaderName}`)

  // ─── STEP 3: FL DAILY LOG ───────────────────────────────────────────
  step(3, 'Farm Leader — Ghi nhật ký hằng ngày')
  const fl = await login('FL')

  const myTasks = await api('GET', '/cultivation-tasks', {
    token: fl.token,
    query: { PageIndex: 1, PageSize: 50 },
  })
  const myTaskItems = unwrapItems(myTasks.data)
  const myTask =
    myTaskItems.find((t) => t.id === ctx.taskId) ||
    myTaskItems.find((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE')
  if (!myTask) {
    fail('FL không thấy task được giao')
    log('  tasks count=', myTaskItems.length)
    // try continue with known taskId anyway
  } else {
    ok(`FL sees task: ${myTask.name} (${myTask.id}) status=${myTask.status}`)
    ctx.taskId = myTask.id
  }

  const fertSel = await api('GET', '/fertilizers/selection', { token: fl.token })
  const pestSel = await api('GET', '/pesticides/selection', { token: fl.token })
  const ferts = unwrapItems(fertSel.data)
  const pests = unwrapItems(pestSel.data)
  ok(`Selection fertilizers=${ferts.length} pesticides=${pests.length}`)

  const dailyBody = {
    taskId: ctx.taskId,
    date: new Date().toISOString().slice(0, 10),
    progress: 50,
    description: `E2E daily log ${stamp} — tưới/chăm sóc`,
    fertilizers: ferts[0]
      ? [
          {
            fertilizerId: ferts[0].id,
            materialId: ferts[0].materialId,
            quantity: 100,
            quantityUnit: 'g',
            area: 0.1,
            areaUnit: 'ha',
          },
        ]
      : [],
    pesticides: pests[0]
      ? [
          {
            pesticideId: pests[0].id,
            materialId: pests[0].materialId,
            quantity: 50,
            quantityUnit: 'ml',
            area: 0.1,
            areaUnit: 'ha',
          },
        ]
      : [],
    images: [],
  }

  const daily = await api('POST', '/cultivation-daily-logs', {
    token: fl.token,
    body: dailyBody,
  })
  if (!daily.ok) {
    fail(`POST daily-logs: ${daily.status} ${daily.message}`)
    console.log(JSON.stringify(daily.json, null, 2))
  } else {
    ok(`Daily log created: ${daily.message}`)
  }

  const dailyList = await api('GET', `/cultivation-daily-logs/task/${ctx.taskId}`, {
    token: fl.token,
  })
  ok(`Daily logs count=${unwrapItems(dailyList.data).length}`)

  // ─── STEP 4: FL SUMMARY (progress 100) ──────────────────────────────
  step(4, 'Farm Leader — Submit Summary (100%)')

  const daily100 = await api('POST', '/cultivation-daily-logs', {
    token: fl.token,
    body: {
      ...dailyBody,
      progress: 100,
      description: `E2E daily log hoàn thành ${stamp}`,
      fertilizers: [],
      pesticides: [],
    },
  })
  if (daily100.ok) ok(`Daily log 100%: ${daily100.message}`)
  else fail(`Daily 100%: ${daily100.status} ${daily100.message}`)

  const summaryPreview = await api('GET', `/cultivation-tasks/${ctx.taskId}/leader-summary`, {
    token: fl.token,
  })
  if (summaryPreview.ok) {
    ok(
      `leader-summary: fertilizers=${(summaryPreview.data?.fertilizers || []).length} pesticides=${(summaryPreview.data?.pesticides || []).length} images=${(summaryPreview.data?.images || []).length}`
    )
  } else {
    fail(`leader-summary: ${summaryPreview.status} ${summaryPreview.message}`)
  }

  const submitSummary = await api('POST', `/cultivation-tasks/${ctx.taskId}/summary`, {
    token: fl.token,
    body: {
      descriptionSummary: `E2E tổng kết công việc ${stamp}`,
      completedAt: new Date().toISOString().slice(0, 10),
    },
  })
  if (!submitSummary.ok) {
    fail(`submit summary: ${submitSummary.status} ${submitSummary.message}`)
    console.log(JSON.stringify(submitSummary.json, null, 2))
  } else {
    ok(`Summary submitted: ${submitSummary.message}`)
  }

  const taskAfter = await api('GET', `/cultivation-tasks/${ctx.taskId}`, {
    token: fl.token,
  })
  ok(`Task after summary: status=${taskAfter.data?.status} progress=${taskAfter.data?.progress}`)

  // ─── STEP 5: FS COMPILE + APPROVE (if log exists) ───────────────────
  step(5, 'Farm Supervisor — Biên soạn / duyệt log (nếu có)')
  // re-login FS
  const fs2 = await login('FS')

  const stageLogs = await api('GET', `/cultivation-stages/${ctx.stageId}/logs`, {
    token: fs2.token,
  })
  const logItems = unwrapItems(stageLogs.data)
  ok(`Stage logs: ${logItems.length}`)

  const pendingLog =
    logItems.find((l) => l.cultivationTaskId === ctx.taskId) ||
    logItems.find((l) => l.status === 'PENDING') ||
    logItems[0]

  if (pendingLog?.id) {
    ok(`Official/pending log: ${pendingLog.id} status=${pendingLog.status}`)
    const patched = await api('PATCH', `/cultivation-logs/${pendingLog.id}/description`, {
      token: fs2.token,
      body: { description: `E2E biên soạn mô tả chuẩn ${stamp}` },
    })
    if (patched.ok) ok(`PATCH description OK`)
    else fail(`PATCH description: ${patched.status} ${patched.message}`)

    if (pendingLog.status !== 'APPROVED') {
      const approved = await api('POST', `/cultivation-logs/${pendingLog.id}/approve`, {
        token: fs2.token,
        body: { comment: 'E2E đạt yêu cầu' },
      })
      if (approved.ok) ok(`Approve log OK`)
      else fail(`Approve log: ${approved.status} ${approved.message}`)
    }
  } else {
    log('  ⚠️ Chưa có cultivation-log để biên soạn sau summary — BE có thể tạo log async/khác endpoint')
  }

  const stageSummary = await api('GET', `/cultivation-stages/${ctx.stageId}/summary`, {
    token: fs2.token,
  })
  if (stageSummary.ok) ok(`Stage summary OK`)
  else log(`  ⚠️ stage summary: ${stageSummary.status} ${stageSummary.message}`)

  // ─── FINAL REPORT ───────────────────────────────────────────────────
  step('DONE', 'Tóm tắt ngữ cảnh E2E')
  log(JSON.stringify(ctx, null, 2))
  log('\nMở FE local để verify UI:')
  log(`  FM detail: /farm-manager/cultivation-logbooks/${ctx.logbookId}`)
  log(`  FS plan:   /farm-supervisor/plans/${ctx.logbookId}`)
  log(`  FL log:    /farm-leader/tasks/${ctx.taskId}/log`)
}

main().catch((e) => {
  console.error('\nE2E FAILED:', e.message)
  process.exit(1)
})
