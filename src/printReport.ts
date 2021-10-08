// Copied from
// https://github.com/npm/arborist/blob/f8df52907955a69779dd07852e63801d7ae0e494/bin/audit.js
// The ISC License
//
// Copyright npm, Inc.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND NPM DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL NPM BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
// OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.

import Vuln from '@npmcli/arborist/lib/vuln.js'

export const printReport = (report: any) => {
  for (const vuln of report.values()) {
    console.log(printVuln(vuln))
  }
  if (report.topVulns.size) {
    console.log('\n# top-level vulnerabilities')
    for (const vuln of report.topVulns.values()) {
      console.log(printVuln(vuln))
    }
  }
}

const printVuln = (vuln: any) => {
  return {
    __proto__: { constructor: Vuln },
    name: vuln.name,
    issues: [...vuln.advisories].map(a => printAdvisory(a)),
    range: vuln.simpleRange,
    nodes: [...vuln.nodes].map(node => `${node.name} ${node.location || '#ROOT'}`),
    ...(vuln.topNodes.size === 0 ? {} : {
      topNodes: [...vuln.topNodes].map(node => `${node.location || '#ROOT'}`),
    }),
  }
}

const printAdvisory = (a: any) => `${a.title}${a.url ? ' ' + a.url : ''}`
