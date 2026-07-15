fn main() {
    // Build-time helper: keep build script minimal. Runtime initialization
    // will load taxonomy data from the crate directory.
    tauri_build::build()
}
