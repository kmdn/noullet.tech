# noullet.tech

Kristian Noullet's personal website, with professional experience, research,
education and personal interests in English, German, French, Finnish and
Luxembourgish.

Static HTML, CSS and JavaScript. No build step or external dependencies.

## AI assistance

Front-end web development is far from being one of my core skills. As such,
I designed this website with assistance from several genAI tools and my own
limited skill. The content and personal information are my own and I am
responsible for the content published to my person.

## Editing

English content lives in [index.html](index.html). Translations are in
[assets/js/i18n](assets/js/i18n), using the same `data-i18n` keys.
Styles and interactions live in [assets/css/style.css](assets/css/style.css)
and [assets/js/main.js](assets/js/main.js).

Language links use `/en/`, `/de/`, `/fr/`, `/fi/` and `/lu/`.
Luxembourgish is labelled LU; HTML language attributes use its standard code, `lb`.

## Deployment

Publish this directory as the root of a GitHub Pages repository:

1. In **Settings > Pages**, choose **Deploy from a branch**, `main`, `/(root)`.
2. Set the custom domain to `noullet.tech` and configure its DNS for GitHub Pages.
3. Enable **Enforce HTTPS** once the domain and certificate are ready.

[CNAME](CNAME) sets the custom domain; [.nojekyll](.nojekyll) disables Jekyll.
Keep existing email-related DNS records when configuring the domain.

## License

The website's source code is available under the [MIT License](LICENSE).
CV and biographical text, photographs, and other personal content are excluded,
including content embedded in HTML, translation files and metadata.
All rights to personal content are reserved, subject to applicable law.
Third-party material retains its respective rights and licenses.
