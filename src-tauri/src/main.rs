#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run()
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_compiles() {
        assert!(true);
    }
}
