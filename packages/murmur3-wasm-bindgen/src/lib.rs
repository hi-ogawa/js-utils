use murmur3;
use std::io::Cursor;
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[wasm_bindgen]
pub fn murmur3_32(source: &[u8], seed: u32) -> Result<u32, JsError> {
    let mut cursor = Cursor::new(source);
    Ok(murmur3::murmur3_32(&mut cursor, seed)?)
}

#[wasm_bindgen]
pub fn murmur3_x64_128(source: &[u8], seed: u32, dest: &mut [u32]) -> Result<(), JsError> {
    let mut cursor = Cursor::new(source);
    let h = murmur3::murmur3_x64_128(&mut cursor, seed)?;
    dest[0] = ((h >> 32 * 0) & 0xffffffff) as u32;
    dest[1] = ((h >> 32 * 1) & 0xffffffff) as u32;
    dest[2] = ((h >> 32 * 2) & 0xffffffff) as u32;
    dest[3] = ((h >> 32 * 3) & 0xffffffff) as u32;
    Ok(())
}

#[wasm_bindgen]
pub fn murmur3_x86_128(source: &[u8], seed: u32, dest: &mut [u32]) -> Result<(), JsError> {
    let mut cursor = Cursor::new(source);
    let h = murmur3::murmur3_x86_128(&mut cursor, seed)?;
    dest[0] = ((h >> 32 * 0) & 0xffffffff) as u32;
    dest[1] = ((h >> 32 * 1) & 0xffffffff) as u32;
    dest[2] = ((h >> 32 * 2) & 0xffffffff) as u32;
    dest[3] = ((h >> 32 * 3) & 0xffffffff) as u32;
    Ok(())
}
