This is a proof of concept demonstrating auditing packages required by code
instead of auditing all dependencies or all prod dependencies.

It uses esbuild's tree shaking bundler to list the files that are required from
an entry point and npm's arborist to audit the packages those files belong to.

I'm not sure how public @npmcli/arborist is, and I had to use some non-exported
files, and even copy some non exported functions, so consider this
pre-production code.
