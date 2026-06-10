/**
 * İESU Kariyer Platformu - Admin Güvenlik Doğrulama Köprüsü
 * Bu dosyayı mevcut Apps Script projesine ekleyebilirsiniz.
 * Admin şifresini frontend içinde düz metin tutmak yerine Script Properties üzerinden doğrular.
 *
 * İlk kurulumda Script Properties içine şunları girin:
 * ADMIN_USERNAME = Kariyer
 * ADMIN_PASSWORD_HASH = SHA-256 hash
 * ADMIN_PIN_HASH = SHA-256 hash
 */
function verifyAdminLogin_(payload) {
  var props = PropertiesService.getScriptProperties();
  var username = String(payload.username || '').trim();
  var passwordHash = String(payload.passwordHash || '').trim();
  var pinHash = String(payload.pinHash || '').trim();

  var expectedUser = props.getProperty('ADMIN_USERNAME') || 'Kariyer';
  var expectedPasswordHash = props.getProperty('ADMIN_PASSWORD_HASH');
  var expectedPinHash = props.getProperty('ADMIN_PIN_HASH');

  if (!expectedPasswordHash || !expectedPinHash) {
    return { success: false, error: 'Admin secret/hash ayarları Script Properties içinde tanımlı değil.' };
  }

  if (username !== expectedUser) {
    return { success: false, error: 'Yetkisiz kullanıcı adı.' };
  }

  if (passwordHash !== expectedPasswordHash || pinHash !== expectedPinHash) {
    return { success: false, error: 'Admin doğrulama başarısız.' };
  }

  return {
    success: true,
    role: 'admin',
    accessRole: 'super_admin',
    username: expectedUser,
    verifiedAt: new Date().toISOString()
  };
}

function handleAdminSecurityAction_(payload) {
  if (payload.action === 'verifyAdminLogin') {
    return verifyAdminLogin_(payload);
  }
  return { success: false, error: 'Bilinmeyen admin güvenlik işlemi.' };
}
