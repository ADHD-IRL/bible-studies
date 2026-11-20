# Bible Studies

A library of Mark's Bible studies, built with Jekyll for GitHub Pages. You can browse by book or topic, search every study, and each study has its own page with links to the scripture it cites.

## Add a study

1. Copy `_templates/new-study.md` into `_studies/`.
2. Rename it in lowercase with hyphens, for example `romans-8-28-2026-11-20.md`. The file name becomes the web address.
3. Fill in the front matter at the top, then write the study below it in Markdown.
4. Commit and push. GitHub Pages rebuilds the site in a minute or two.

### Front matter fields

| Field | What it holds |
|---|---|
| `title` | The study's title |
| `passage` | Optional. The main verse or chapter, shown under the title, for example `Romans 8:28` |
| `date` | Date written, as YYYY-MM-DD (optional) |
| `type` | One of: Verse Study, Topical Study, Group Lesson, Word Study, Prophecy & End Times, Book Overview, Leader Guide |
| `books` | Books of the Bible it draws on, spelled as in `_data/books.yml` (for example "Psalms", "1 Corinthians") |
| `references` | Passages, for example "John 3:16" or "Romans 8:28-30". Each one links to NKJV on Bible Gateway |
| `topics` | Two to five themes in Title Case |
| `testament` | Old, New or Both |
| `summary` | One sentence shown on cards and in search |
| `source` | Where the original file lives |

### Writing tips

- Use `## Heading` for main sections and `### Heading` under them.
- Put scripture quotes in a blockquote: start the line with `> `.
- Bold a label with `**Label:**`.

## Run it on your computer

```
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000/bible-studies/.

## Turn on GitHub Pages

Settings, then Pages, then deploy from the `main` branch and the `/ (root)` folder. On a free GitHub account the repository has to be public for Pages to work.
