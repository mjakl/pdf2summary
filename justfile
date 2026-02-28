set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

generate prompt_file="pdf2summary-prompt-template.txt" output_file="pdf2summary-bookmarklet.generated.txt" open_url="":
    if [ -n "{{open_url}}" ]; then \
        bun run ./make-pdf2summary-bookmarklet.js {{prompt_file}} {{output_file}} --open-url "{{open_url}}"; \
    else \
        bun run ./make-pdf2summary-bookmarklet.js {{prompt_file}} {{output_file}}; \
    fi

copy output_file="pdf2summary-bookmarklet.generated.txt":
    pbcopy < {{output_file}}
    @echo "Copied {{output_file}} to clipboard."

build-and-copy prompt_file="pdf2summary-prompt-template.txt" output_file="pdf2summary-bookmarklet.generated.txt" open_url="":
    just generate {{prompt_file}} {{output_file}} "{{open_url}}"
    just copy {{output_file}}
