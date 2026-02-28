set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

generate prompt_file="pdf-audio-prompt-template.txt" output_file="pdf-audio-bookmarklet.generated.txt":
    bun run ./make-pdf-audio-bookmarklet.js {{prompt_file}} {{output_file}}

copy output_file="pdf-audio-bookmarklet.generated.txt":
    pbcopy < {{output_file}}
    @echo "Copied {{output_file}} to clipboard."

build-and-copy prompt_file="pdf-audio-prompt-template.txt" output_file="pdf-audio-bookmarklet.generated.txt":
    just generate {{prompt_file}} {{output_file}}
    just copy {{output_file}}
