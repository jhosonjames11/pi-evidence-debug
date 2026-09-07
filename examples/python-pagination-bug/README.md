# Intentional Pagination Bug

This fixture contains one real, reproducible defect for manual acceptance testing.

```bash
python3 -m unittest -v
```

The test must fail before `/debug` runs: the final page reports five items instead of one. Start Pi in this directory and load the extension from the cloned `pi-evidence-debug` repository. After `/debug` finishes, rerun the same command and inspect the source change yourself.

Do not treat a model report as verification; the before-and-after test result is the acceptance criterion.
