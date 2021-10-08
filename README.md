This is a proof of concept demonstrating auditing packages required by code
instead of auditing all dependencies or all prod dependencies.

https://overreacted.io/npm-audit-broken-by-design/

It uses esbuild's tree shaking bundler to list the files that are required from
an entry point and npm's arborist to audit the packages those files belong to.

I'm not sure how public @npmcli/arborist is, and I had to use some non-exported
files, and even copy some non exported functions, so consider this
pre-production code.

# Example

```
npx create-react-app myapp --template typescript
cd myapp
```

```
npm audit

67 vulnerabilities (21 moderate, 44 high, 2 critical)
```

```
npx npm-esbuild-audit src/index.tsx --platform node --target esnext
audting 6 packages required by src/index.tsx (out of 1843 total)
```

No vulnerabilities detected! I had to remove the logo.svg import because
esbuild doesn't have a svg loader by default and I haven't added a loader
param. That also demonstrates one of the problems with this approach - bundling
can be very complicated.
