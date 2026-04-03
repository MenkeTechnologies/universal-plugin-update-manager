#[test]
fn test_xref_extract_plugins_nonexistent_returns_empty() {
    let plugins = app_lib::xref::extract_plugins("/nonexistent/audio_haxor/project.flp");
    assert!(
        plugins.is_empty(),
        "nonexistent project should yield no plugins, got {}",
        plugins.len()
    );
}

#[test]
fn test_xref_plugin_ref_struct() {
    let ref_info = app_lib::xref::PluginRef {
        name: "Test Plugin".to_string(),
        normalized_name: "test plugin".to_string(),
        manufacturer: "Co".to_string(),
        plugin_type: "VST3".to_string(),
    };
    assert_eq!(ref_info.plugin_type, "VST3");
    assert!(!ref_info.normalized_name.is_empty());
}

#[test]
fn test_xref_plugin_ref_json_roundtrip_camel_case() {
    let json = r#"{
        "name": "Pro-Q 3",
        "normalizedName": "pro-q 3",
        "manufacturer": "FabFilter",
        "pluginType": "VST3"
    }"#;
    let p: app_lib::xref::PluginRef = serde_json::from_str(json).unwrap();
    assert_eq!(p.name, "Pro-Q 3");
    assert_eq!(p.normalized_name, "pro-q 3");
    assert_eq!(p.plugin_type, "VST3");
    let back = serde_json::to_string(&p).unwrap();
    let p2: app_lib::xref::PluginRef = serde_json::from_str(&back).unwrap();
    assert_eq!(p, p2);
}

#[test]
fn test_xref_normalize_plugin_name_strips_trailing_aax_brackets() {
    let n = app_lib::xref::normalize_plugin_name("MyComp [AAX]");
    assert_eq!(n, "mycomp");
}
