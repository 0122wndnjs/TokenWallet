// test_crypto.js
const crypto = require('crypto');

// .env 파일에서 직접 복사한 WALLET_ENCRYPTION_KEY 값을 여기에 붙여넣으세요.
// 따옴표 안의 내용을 정확히 붙여넣어야 합니다!
const testSecret = "596dcdc67fe3bc0feaf8ba918fe5660da762396a3578d9ed8c1418a1620f1cb8"; // <-- 이 부분을 사용자의 실제 키로 교체!

console.log(`[TEST] testSecret: ${testSecret}`);
console.log(`[TEST] testSecret length: ${testSecret.length}`);

try {
    const keyBuffer = Buffer.from(testSecret, 'hex');
    console.log(`[TEST] keyBuffer length: ${keyBuffer.length}`); // 32가 나와야 정상
    console.log(`[TEST] keyBuffer type: ${typeof keyBuffer}`);
    console.log(`[TEST] keyBuffer instance of Buffer: ${keyBuffer instanceof Buffer}`);

    // IV는 16바이트 (128비트)
    const iv = crypto.randomBytes(16);
    console.log(`[TEST] IV length: ${iv.length}`); // 16이 나와야 정상

    // AES-256-CBC, 키, IV로 cipher 생성 시도
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    console.log('[TEST] Cipher created successfully!'); // 이 메시지가 보이면 성공!

    // 간단한 데이터 암호화 시도
    let encrypted = cipher.update('hello world', 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log(`[TEST] Encrypted data: ${encrypted}`);

    // 복호화 시도
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(`[TEST] Decrypted data: ${decrypted}`);

} catch (error) {
    console.error('[TEST] Error during crypto operations:', error.message);
    console.error(error); // 전체 에러 객체 출력
}