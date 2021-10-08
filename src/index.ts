#!/usr/bin/env node
import esbuild, { BuildResult } from 'esbuild'
import Arborist from '@npmcli/arborist'
import AuditReport from '@npmcli/arborist/lib/audit-report.js'
import { printReport} from './printReport.js'
import { relative } from 'path'
import { Command } from 'commander'

await new Command()
  .usage('audit loaded packages')
  .option('--target <target>', 'esbuild target')
  .option('--format <format>', 'esbuild format')
  .option('--platform <platform>', 'esbuild platform')
  .argument('<entryPoints...>', 'esbuild entry points')
  .action(main)
  .parseAsync()
  .catch(handleErrors)

async function main(entryPoints: string[], opts: { [key: string]: any}): Promise<void> {
  const rootDir = process.cwd()

  // TODO: load npm config.
  const arb = new Arborist({path: rootDir})

  const [bundle, tree] = await Promise.all([
    esbuild.build({
      target: opts.target,
      format: opts.format,
      platform: opts.platform,

      entryPoints,

      // output the metafile which lists loaded files.
      metafile: true,

      // outdir is required when using multiple entryPoints
      // but we're not writing so I think dev null is safe.
      outdir: '/dev/null',
      write: false,

      logLevel: 'error',
      bundle: true,
    }),
    arb.loadActual(),
  ])

  // The set of nodes to audit.
  const filterSet = new Set(tree.inventory.filter(isInBundle(bundle, rootDir)))

  console.log(`audting ${filterSet.size} packages required by ${entryPoints} `
    + `(out of ${tree.inventory.size} total)`)

  // TODO: special case, when filterSet is empty it is ignored and all packages
  // are audited. Should we just skip the report and say 'you have no
  // dependencies, congrats?'
  const report = await AuditReport.load(tree, { filterSet })
  printReport(report)
}

function isInBundle(bundle: BuildResult, rootDir: string): (node: any) => boolean {
  if (!bundle.metafile) throw Error('esbuild did not create metadata')
  // This algo is dubious. A path is in a node if the path starts with the
  // node's location. There could be issues with symlinks, workspaces, bundled
  // dependencies.
  // It's also not very efficent, O(N^2) for-each-node for-each-path.
  // It could be optimized by turning paths into a set of node locations, but
  // that's more dubious than this algo.
  const paths = Object.keys(bundle.metafile.inputs)
  return (node) => {
    const rel = relative(rootDir, node.path)
    return paths.some(p => p.startsWith(rel))
  }
}

function handleErrors (err: Error) {
  console.log(err.message ?? err)
  process.exit(1)
}
