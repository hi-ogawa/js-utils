use murmur3;
use std::io::Cursor;
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[wasm_bindgen]
pub fn murmur3_32(source: &[u8], seed: u32) -> Result<u32, JsError> {
    let mut cursor = Cursor::new(source);
    Ok(murmur3::murmur3_32(&mut cursor, seed)?)
}
