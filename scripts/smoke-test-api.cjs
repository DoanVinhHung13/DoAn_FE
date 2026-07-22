/**
 * Smoke-test EAPLS main-flow APIs against real backend.
 * Usage: node scripts/smoke-test-api.cjs
 */
const BASE = process.env.API_ROOT || 'https://api.eapls.io.vn/api'

async function req(method, path, { token, body, query } = {}) {
  const url = new URL(BASE.replace(/\/$/, '') + path)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const started = Date.now()
  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - started, error: e.message, path }
  }

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text?.slice(0, 200) }
  }

  return {
    ok: res.ok && json?.success !== false,
    status: res.status,
    ms: Date.now() - started,
    path: `${method} ${path}`,
    success: json?.success,
    message: json?.message,
    dataKeys: json?.data && typeof json.data === 'object' ? Object.keys(json.data).slice(0, 12) : typeof json?.data,
    sample: summarize(json?.data),
    errors: json?.errors,
  }
}

function summarize(data) {
  if (data == null) return null
  if (Array.isArray(data)) return { type: 'array', length: data.length, firstKeys: data[0] ? Object.keys(data[0]).slice(0, 10) : [] }
  if (typeof data === 'object') {
    if (Array.isArray(data.items)) {
      return {
        type: 'page',
        totalItems: data.totalItems,
        items: data.items.length,
        firstKeys: data.items[0] ? Object.keys(data.items[0]).slice(0, 12) : [],
        first: pick(data.items[0], ['id', 'planName', 'name', 'status', 'stageName', 'taskId', 'traceCode', 'batchCode']),
      }
    }
    return { type: 'object', keys: Object.keys(data).slice(0, 15), pick: pick(data, ['id', 'planName', 'name', 'status', 'accessToken', 'token', 'roles', 'fullName', 'email']) }
  }
  return { type: typeof data, value: String(data).slice(0, 80) }
}

function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

function printResult(r) {
  const icon = r.ok ? 'OK' : 'FAIL'
  console.log(`\n[${icon}] ${r.status} ${r.ms}ms — ${r.path}`)
  if (r.message) console.log(`  message: ${r.message}`)
  if (r.errors?.length) console.log(`  errors:`, r.errors)
  if (r.sample) console.log(`  data:`, JSON.stringify(r.sample))
  if (r.error) console.log(`  network:`, r.error)
}

async function login(identifier, password) {
  const r = await req('POST', '/auth/login', {
    body: { identifier, password },
  })
  printResult(r)
  const token =
    r.sample?.pick?.accessToken ||
    r.sample?.pick?.token ||
    null
  // re-fetch raw for token
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  const json = await res.json()
  const accessToken = json?.data?.accessToken || json?.data?.token || json?.accessToken
  const roles = json?.data?.roles || json?.data?.role
  console.log(`  roles:`, roles)
  console.log(`  token:`, accessToken ? `${String(accessToken).slice(0, 24)}...` : 'MISSING')
  return { accessToken, user: json?.data, loginResult: r }
}

async function runAs(label, identifier, password, tests) {
  console.log('\n' + '='.repeat(60))
  console.log(`ROLE CONTEXT: ${label} (${identifier})`)
  console.log('='.repeat(60))
  const { accessToken } = await login(identifier, password)
  if (!accessToken) {
    console.log('STOP: cannot continue without token')
    return { accessToken: null, results: [] }
  }

  const results = []
  for (const t of tests) {
    const r = await req(t.method, t.path, { token: accessToken, body: t.body, query: t.query })
    printResult(r)
    results.push({ ...r, name: t.name })
  }
  return { accessToken, results }
}

async function main() {
  console.log(`API ROOT: ${BASE}`)

  const fm = await runAs('FARM_MANAGER', 'farmmanager@eapls.com', 'Abc@1234', [
    { name: 'me', method: 'GET', path: '/auth/me' },
    { name: 'logbooks', method: 'GET', path: '/cultivation-logbooks', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'available-lands', method: 'GET', path: '/land-plots/available-for-logbook' },
    { name: 'crops', method: 'GET', path: '/crops', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'supervisors', method: 'GET', path: '/users', query: { Role: 'FARM_SUPERVISOR', PageIndex: 1, PageSize: 5 } },
    { name: 'task-catalogs', method: 'GET', path: '/task-catalogs', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'closing-reviews', method: 'GET', path: '/cultivation-logbooks/closing-reviews', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'pesticides', method: 'GET', path: '/pesticides', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'pesticides-selection', method: 'GET', path: '/pesticides/selection' },
    { name: 'fertilizers-selection', method: 'GET', path: '/fertilizers/selection' },
    { name: 'products', method: 'GET', path: '/products', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'audit-logs', method: 'GET', path: '/audit-logs', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'legacy-standard-tasks', method: 'GET', path: '/standard-tasks', query: { PageIndex: 1, PageSize: 1 } },
    { name: 'legacy-crop-protection', method: 'GET', path: '/crop-protection', query: { PageIndex: 1, PageSize: 1 } },
  ])

  const fs = await runAs('FARM_SUPERVISOR', 'farmsupervisor@eapls.com', 'Abc@1234', [
    { name: 'me', method: 'GET', path: '/auth/me' },
    { name: 'logbooks', method: 'GET', path: '/cultivation-logbooks', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'task-catalogs', method: 'GET', path: '/task-catalogs', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'cultivation-tasks', method: 'GET', path: '/cultivation-tasks', query: { PageIndex: 1, PageSize: 5 } },
    { name: 'leaders', method: 'GET', path: '/users', query: { Role: 'FARM_LEADER', PageIndex: 1, PageSize: 5 } },
    { name: 'farmers', method: 'GET', path: '/users', query: { Role: 'FARMER', PageIndex: 1, PageSize: 5 } },
  ])

  // Deep-dive first logbook if any
  let deep = []
  if (fm.accessToken) {
    const listRes = await fetch(`${BASE}/cultivation-logbooks?PageIndex=1&PageSize=1`, {
      headers: { Authorization: `Bearer ${fm.accessToken}`, Accept: 'application/json' },
    })
    const listJson = await listRes.json()
    const first = listJson?.data?.items?.[0] || (Array.isArray(listJson?.data) ? listJson.data[0] : null)
    if (first?.id) {
      console.log('\n' + '='.repeat(60))
      console.log(`DEEP DIVE logbook: ${first.id} — ${first.planName || first.name}`)
      console.log('='.repeat(60))
      const id = first.id
      const checks = [
        { name: 'detail', method: 'GET', path: `/cultivation-logbooks/${id}` },
        { name: 'stages', method: 'GET', path: `/cultivation-stages/logbook/${id}` },
        { name: 'logs', method: 'GET', path: `/cultivation-logbooks/${id}/logs` },
      ]
      for (const t of checks) {
        const r = await req(t.method, t.path, { token: fm.accessToken })
        printResult(r)
        deep.push(r)

        if (t.name === 'stages' && r.ok) {
          const stagesRes = await fetch(`${BASE}/cultivation-stages/logbook/${id}`, {
            headers: { Authorization: `Bearer ${fm.accessToken}`, Accept: 'application/json' },
          })
          const stagesJson = await stagesRes.json()
          const stages = Array.isArray(stagesJson?.data) ? stagesJson.data : stagesJson?.data?.items || []
          const stage = stages[0]
          if (stage?.id) {
            const s1 = await req('GET', `/cultivation-stages/${stage.id}/summary`, { token: fm.accessToken })
            printResult(s1)
            deep.push(s1)
            const s2 = await req('GET', `/cultivation-stages/${stage.id}/logs`, { token: fm.accessToken })
            printResult(s2)
            deep.push(s2)
          }
        }
      }

      // If FS has tasks, test leader-summary on first task
      if (fs.accessToken) {
        const tasksRes = await fetch(`${BASE}/cultivation-tasks?PageIndex=1&PageSize=1`, {
          headers: { Authorization: `Bearer ${fs.accessToken}`, Accept: 'application/json' },
        })
        const tasksJson = await tasksRes.json()
        const task = tasksJson?.data?.items?.[0] || (Array.isArray(tasksJson?.data) ? tasksJson.data[0] : null)
        if (task?.id) {
          console.log(`\nDEEP DIVE task: ${task.id} — ${task.name}`)
          const t1 = await req('GET', `/cultivation-tasks/${task.id}`, { token: fs.accessToken })
          printResult(t1)
          deep.push(t1)
          const t2 = await req('GET', `/cultivation-tasks/${task.id}/leader-summary`, { token: fs.accessToken })
          printResult(t2)
          deep.push(t2)
          const t3 = await req('GET', `/cultivation-daily-logs/task/${task.id}`, { token: fs.accessToken })
          printResult(t3)
          deep.push(t3)
        }
      }
    } else {
      console.log('\nNo cultivation-logbooks found for deep dive.')
    }
  }

  const all = [...(fm.results || []), ...(fs.results || []), ...deep]
  const failed = all.filter((x) => !x.ok)
  const passed = all.filter((x) => x.ok)

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Passed: ${passed.length}`)
  console.log(`Failed: ${failed.length}`)
  if (failed.length) {
    console.log('\nFailed endpoints:')
    failed.forEach((f) => console.log(` - [${f.status}] ${f.path} :: ${f.message || f.error || ''}`))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
