/**
 * Audit main-flow API DTO keys vs expected allowlists.
 * node scripts/audit-main-flow-fields.cjs
 */
const BASE = process.env.API_ROOT || 'https://api.eapls.io.vn/api'

const ACCOUNTS = {
  FM: { identifier: 'farmmanager@eapls.com', password: 'Abc@1234' },
  FS: { identifier: 'farmsupervisor@eapls.com', password: 'Abc@1234' },
  FL: { identifier: 'farmleader@eapls.com', password: 'Abc@1234' },
}

const EXPECTED = {
  logbookListItem: [
    'id', 'logbookName', 'cropName', 'supervisorName', 'startDate', 'status',
  ],
  taskItem: [
    'id', 'cultivationLogbookId', 'cultivationStageId', 'taskCatalogId',
    'taskCatalogName', 'name', 'description', 'startDate', 'dueDate',
    'completedDate', 'status', 'progress', 'createdBy', 'assignedLeaderId',
    'assignedLeaderName', 'assignments',
  ],
  leaderSummary: [
    'taskId', 'taskName', 'description', 'images', 'fertilizers', 'pesticides',
  ],
}

let failed = 0

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
  const json = await res.json().catch(() => null)
  return { ok: res.ok && json?.success !== false, data: json?.data, message: json?.message, json }
}

async function login(role) {
  const r = await api('POST', '/auth/login', { body: ACCOUNTS[role] })
  if (!r.ok || !r.data?.accessToken) throw new Error(`Login ${role} failed`)
  return r.data.accessToken
}

function assertKeys(label, obj, expected) {
  if (!obj) {
    console.log(`  ❌ ${label}: no object`)
    failed++
    return
  }
  const keys = Object.keys(obj)
  const missing = expected.filter((k) => !keys.includes(k))
  const extra = keys.filter((k) => !expected.includes(k))
  if (missing.length) {
    console.log(`  ❌ ${label}: missing keys`, missing)
    failed++
  } else {
    console.log(`  ✅ ${label}: expected keys present`)
  }
  if (extra.length) {
    console.log(`  ℹ️  ${label}: extra keys (informational)`, extra)
  }
  console.log(`     sample status/fields:`, {
    status: obj.status,
    logbookName: obj.logbookName,
    name: obj.name,
    reviewStatus: obj.reviewStatus,
  })
}

function forbidKeys(label, obj, forbidden) {
  if (!obj) return
  const hit = forbidden.filter((k) => Object.prototype.hasOwnProperty.call(obj, k))
  if (hit.length) {
    console.log(`  ❌ ${label}: forbidden legacy keys present`, hit)
    failed++
  } else {
    console.log(`  ✅ ${label}: no forbidden legacy keys (${forbidden.join(', ')})`)
  }
}

async function main() {
  console.log('API:', BASE)
  console.log('Audit main-flow field contracts\n')

  const fm = await login('FM')
  const list = await api('GET', '/cultivation-logbooks', {
    token: fm,
    query: { PageIndex: 1, PageSize: 2 },
  })
  const item = list.data?.items?.[0]
  assertKeys('GET /cultivation-logbooks item', item, EXPECTED.logbookListItem)
  forbidKeys('list item', item, ['planName', 'isActive', 'landPlotName', 'reviewStatus'])

  if (item?.id) {
    const detail = await api('GET', `/cultivation-logbooks/${item.id}`, { token: fm })
    console.log('  ✅ detail keys:', Object.keys(detail.data || {}))
    forbidKeys('detail', detail.data, ['planName', 'isActive'])
  }

  const closing = await api('GET', '/cultivation-logbooks/closing-reviews', {
    token: fm,
    query: { PageIndex: 1, PageSize: 2 },
  })
  const cItem = closing.data?.items?.[0]
  if (cItem) {
    console.log('  ✅ closing-reviews sample:', {
      status: cItem.status,
      reviewStatus: cItem.reviewStatus,
      logbookName: cItem.logbookName,
    })
    forbidKeys('closing item', cItem, ['planName', 'isActive'])
  } else {
    console.log('  ⚠️ closing-reviews empty')
  }

  const fl = await login('FL')
  const tasks = await api('GET', '/cultivation-tasks', {
    token: fl,
    query: { PageIndex: 1, PageSize: 3 },
  })
  const tItem = tasks.data?.items?.[0]
  assertKeys('GET /cultivation-tasks item', tItem, EXPECTED.taskItem)
  forbidKeys('task item', tItem, ['planName', 'landPlotName', 'stageName', 'leaderSummary', 'officialLog'])

  if (tItem?.id) {
    const sum = await api('GET', `/cultivation-tasks/${tItem.id}/leader-summary`, { token: fl })
    if (sum.ok && sum.data) {
      assertKeys('leader-summary', sum.data, EXPECTED.leaderSummary)
      forbidKeys('leader-summary', sum.data, ['descriptionSummary', 'totalFertilizers', 'totalPesticides'])
    } else {
      console.log('  ⚠️ leader-summary:', sum.message)
    }
  }

  console.log(`\nDone. failures=${failed}`)
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
