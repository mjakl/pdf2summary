set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

generate prompt_file="pdf-audio-prompt-template.txt" output_file="pdf-audio-bookmarklet.generated.txt" open_url="https://gemini.google.com/u/1/app":
    bun run ./make-pdf-audio-bookmarklet.js {{prompt_file}} {{output_file}} --open-url "{{open_url}}"

copy output_file="pdf-audio-bookmarklet.generated.txt":
    pbcopy < {{output_file}}
    @echo "Copied {{output_file}} to clipboard."

build-and-copy prompt_file="pdf-audio-prompt-template.txt" output_file="pdf-audio-bookmarklet.generated.txt" open_url="https://gemini.google.com/u/1/app":
    just generate {{prompt_file}} {{output_file}} "{{open_url}}"
    just copy {{output_file}}
