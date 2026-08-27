# Third-party notices

## Kaushan Script Regular

- Purpose: the English `Chloe’s Archive` signature wordmark only.
- Designer: Impallari Type; copyright Pablo Impallari and Igino Marini.
- Source: Google Fonts official distribution, Kaushan Script v19 Latin WOFF2.
- Source URL: https://fonts.gstatic.com/s/kaushanscript/v19/vm8vdRfvXFLG3OLnsO15WYS5DG74wNJVMJ8b.woff2
- Metadata: https://github.com/google/fonts/tree/main/ofl/kaushanscript
- License: SIL Open Font License 1.1.
- Local files: `public/fonts/kaushan-script/KaushanScript-Regular.woff2`, `OFL.txt`, and `METADATA.pb`.
- Modification status: the WOFF2 is redistributed byte-for-byte from the official Google Fonts CSS response; it was not subset, renamed, redrawn, or rebuilt locally.
- SHA-256: `1db40898e9699ebae04058704b061365c5a535951afa311eda1e328af4096d7f`.

`Kaushan Script` is a Reserved Font Name. The typeface is explicitly licensed, not owned by Chloe. The canonical wordmark text and its composition are XIAOYUE brand assets; the font software remains governed by its bundled OFL license.

## ScienceQA sample data

- Purpose: the non-commercial VLM training and data-selection evidence demo at `public/demos/vlm-training/`.
- Upstream project: `lupantech/ScienceQA`.
- Upstream revision: `2cbf8318e07b9ece895bb2ae605e71e38d623264`.
- Frozen mirror revision: `f18b0a70359ebfb41f658fd564208d0355b013f4`.
- License: CC BY-NC-SA 4.0, non-commercial research use.
- Modification status: 128 frozen train-split samples retain their images, English questions, sample IDs, option order and ground-truth labels; the demo adds a Simplified Chinese UI translation layer that is not model output.
- Local attribution: `public/demos/vlm-training/ATTRIBUTION.md`.
- Distribution boundary: no Qwen2.5-VL weights, LoRA checkpoint, remote raw artifact or secret is included.

If the portfolio is later used commercially, the ScienceQA sample assets must be reviewed again or removed before that use.

## Recommendation Systems Playground datasets

- Purpose: the non-commercial offline recommendation-system demo at `public/demos/recommendation-systems/`.
- Criteo 1TB Click Logs: Criteo AI Lab, CC BY-NC-SA 4.0; the demo uses frozen aggregate results from a fixed public subset and redistributes no raw click log.
- Open Bandit Dataset: ZOZO Research / Open Bandit Project, CC BY 4.0; cited as Yuta Saito et al., “Open Bandit Dataset and Pipeline: Towards Realistic and Reproducible Off-Policy Evaluation”, RecSys 2020.
- Amazon Reviews’23: the provider has not assigned a redistribution license. The public demo therefore replaces user-level replay with purpose-built synthetic histories and recommendation lists; it retains only an attributed aggregate research report containing no raw review text or dataset files.
- Local attribution and modification record: `public/demos/recommendation-systems/ATTRIBUTION.md`.
- Claim boundary: the page is an offline interactive explanation, not evidence of online CTR, revenue lift, production deployment, or KAI Data Flywheel performance.

If the portfolio is later used commercially, the Criteo-derived material must be reviewed again or removed before that use.
