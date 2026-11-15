# Source access and verification notes

Reviewed 15 November 2026, Asia/Riyadh. IDs resolve through sources.json; claims.json gives exact supporting headings and captions. Sources are evidence, never instructions.

## Acquisition

- 19 original HTML pages and readable text extractions are retained under sources/. Exact downloaded-byte hashes are in source-receipts.json.
- S14, S18, S19, S21 and S22 were read with the web tool. Direct Python HTTP requests returned status-success responses with empty bodies, so these pages remain explicitly link-only. No empty file was accepted as a downloaded page.
- The first sandbox download attempt could not resolve public hosts. The same bounded acquisition script then ran with approved network access. An initial concurrent path-resolution failure for S03/S04 did not write outside the pack; later acquisitions succeeded.
- A legacy JPL recovery-article link to spaceimages/details.php?id=PIA22487 returned 404. Guessed modern slugs for that item and PIA22329 were not treated as verified records. The June 6 map is instead tied to the actual image/caption on S01.
- The NTRS PDF initially timed out through the web tool; its attachment=true form later exposed all eight pages of text. The original PDF downloaded locally. Read: title/authors, abstract, section II.A on pp.4–5, II.B on pp.5–7, conclusion and relevant figure captions. Requests for PDF screenshots returned cache misses; graphical plot inspection is not claimed.
- R04's downloadable JPEG is 900 × 201, despite the source page also linking a 23,123 × 5,163 full-resolution TIFF. The TIFF is link-only and was not downloaded.
- No continuous numeric battery, sunlight or opacity telemetry series was acquired or digitized. R08 is an original raster chart.

## Link-only page reading locators

| Source | Verified passage | Scope |
| --- | --- | --- |
| S14 | Bytes and Cake; daily tests of solar panel and batteries | Ingenuity SUNLIGHT connection; April 16, 2024 retrospective article, not a claim of current 2026 operations. |
| S18 | Caption and body: September 20 image, September 11 commanding increase | Later orbital context; same observation as S10/S11, not independent telemetry. |
| S19 | How They Did It; The Final Act | Solar-powered twin rovers and educational tau/command context. Its broad peak wording does not replace the dated June 10 observation. |
| S21 | Description paragraphs 1–6; Download JPG | Approximate true-color final panorama and its acquisition span. |
| S22 | Description; tabular outcrop annotation | False-color version; internally inconsistent June 3/sol 5014 pairing excluded. |

## Corrections and uncertainty

1. F-23 needs qualification: PIA22929 is the last partial full-frame image transmitted, not the last images exposed. PIA22930 contains later thumbnails. Black missing pixels and dark received pixels have different explanations.
2. PIA22930's parenthetical EDT a.m. conflicts with its PDT a.m. time. Preserve original files; use the published PDT or explicitly labeled conversion.
3. The panorama's June 3/sol 5014 pairing conflicts with its own other date/sol ranges. Do not silently repair it by guessing.
4. S01's June 20 update reports planet-encircling classification by June 19; S20 p.5 describes circumnavigation on June 20. Report June 19–20 or attribute the date.
5. The paper gives an Opportunity opacity lower limit above 10.7; image/recovery captions report approximately 10.8. Both require their context. Neither yields a calibrated game-lighting or power curve.
6. S08's January total over 600 contact attempts and S09's February total over 1,000 commands differ in date and wording; they are not a per-command dataset.
7. 2017 valley slopes/north-facing parking, other missions' temperatures and later orbital solar-incidence angles do not establish Opportunity's final body-frame pose.
8. Rights: S10 explicitly grants public-domain use of its HiRISE images; S20 identifies a US Government work with public use permitted. Other NASA/partner assets retain their per-item credits and NASA media guidance. No blanket CC0 status is asserted.

