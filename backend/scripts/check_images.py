"""HEAD-check every image URL the seed can use, so we never ship broken images.

    python -m scripts.check_images     (run from backend/)

Exits with code 1 and lists failures if any URL doesn't return 200.
Fix by removing the failing path from app/seed/data/photos.json (pools have spares) and re-running.
"""

import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from app.seed.seed import all_image_urls


def check(url: str, attempts: int = 3) -> tuple[str, int | str]:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "airbnb-clone-image-check"})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                return url, res.status
        except urllib.error.HTTPError as e:
            return url, e.code  # a real answer from the CDN (e.g. 404) — don't retry
        except Exception as e:  # dropped connection / timeout: retry, these are usually transient
            if attempt == attempts - 1:
                return url, type(e).__name__
    raise AssertionError("unreachable")


def main() -> int:
    urls = all_image_urls()
    # Threads because this is pure network wait; 16 at a time is polite to the CDN.
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(check, urls))

    failures = [(url, status) for url, status in results if status != 200]
    print(f"Checked {len(urls)} image URLs: {len(urls) - len(failures)} OK, {len(failures)} failed.")
    for url, status in failures:
        print(f"  [{status}] {url}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
