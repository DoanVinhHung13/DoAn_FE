import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const distDir = path.resolve(process.argv[2] ?? "dist")
const indexPath = path.join(distDir, "index.html")

if (!fs.existsSync(indexPath)) {
  console.error(`Missing build entrypoint: ${indexPath}`)
  process.exit(1)
}

const html = fs.readFileSync(indexPath, "utf8")
const references = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
  .map(match => match[1].split(/[?#]/, 1)[0])
  .filter(
    reference => reference && !/^(?:[a-z]+:|\/\/|data:|#)/i.test(reference),
  )

const files = [...new Set(references)].map(reference => {
  const relativePath = reference.startsWith("/")
    ? reference.slice(1)
    : reference
  return path.resolve(distDir, relativePath)
})

const missing = files.filter(file => !fs.existsSync(file))

if (missing.length > 0) {
  console.error("Build references missing files:")
  for (const file of missing) {
    console.error(`- ${path.relative(process.cwd(), file)}`)
  }
  process.exit(1)
}

console.log(`dist asset check passed: ${files.length} local references exist.`)
