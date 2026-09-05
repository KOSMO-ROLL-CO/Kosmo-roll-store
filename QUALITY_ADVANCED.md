# Quality Advanced

The advanced quality pipeline adds two quality dimensions to pull requests:

- **Coverage Gate** — runs the existing Vitest coverage suite and uploads the generated report.
- **Accessibility Gate** — runs the existing Playwright accessibility suite plus critical smoke checks for the homepage and catalog using axe-core.

Coverage is measured before introducing a minimum threshold. This gives the project a real baseline instead of adding an arbitrary number that could block unrelated work. A threshold can be introduced after the baseline is reviewed.
